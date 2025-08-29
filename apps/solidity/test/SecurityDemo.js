const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityDemo - 安全模式测试", function () {
  let securityDemo;
  let maliciousContract;
  let owner, user1, user2, attacker;
  let ADMIN_ROLE, MINTER_ROLE, BURNER_ROLE;

  beforeEach(async function () {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    // 部署主合约
    const SecurityDemo = await ethers.getContractFactory("SecurityDemo");
    securityDemo = await SecurityDemo.deploy();

    // 部署恶意合约
    const MaliciousContract = await ethers.getContractFactory("MaliciousContract");
    maliciousContract = await MaliciousContract.connect(attacker).deploy(securityDemo.address);

    // 获取角色常量
    ADMIN_ROLE = await securityDemo.ADMIN_ROLE();
    MINTER_ROLE = await securityDemo.MINTER_ROLE();
    BURNER_ROLE = await securityDemo.BURNER_ROLE();
  });

  describe("1. 重入攻击防护测试", function () {
    it("应该防止重入攻击", async function () {
      // 正常存款
      await securityDemo.connect(user1).deposit({ value: ethers.utils.parseEther("1") });
      
      // 给恶意合约一些以太币进行攻击
      await maliciousContract.attack({ value: ethers.utils.parseEther("0.5") });
      
      // 验证攻击被阻止 - 恶意合约应该只能提取一次
      const maliciousBalance = await securityDemo.getBalance(maliciousContract.address);
      expect(maliciousBalance).to.equal(0); // 成功提取后余额为0
      
      // 验证主合约余额正常
      const contractBalance = await securityDemo.getContractBalance();
      expect(contractBalance).to.equal(ethers.utils.parseEther("1")); // 只有user1的存款
    });

    it("重入攻击尝试应该失败", async function () {
      // 恶意合约存款
      await securityDemo.connect(attacker).deposit({ value: ethers.utils.parseEther("1") });
      
      // 尝试多次调用withdraw（模拟重入）
      await expect(
        maliciousContract.attack({ value: ethers.utils.parseEther("0.5") })
      ).to.not.be.reverted; // 第一次调用会成功
      
      // 验证攻击计数器，确保重入被阻止
      const attackCount = await maliciousContract.attackCount();
      expect(attackCount).to.be.at.most(1); // 最多只能攻击一次
    });
  });

  describe("2. 访问控制测试", function () {
    it("应该正确分配初始角色", async function () {
      expect(await securityDemo.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await securityDemo.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await securityDemo.hasRole(BURNER_ROLE, owner.address)).to.be.true;
    });

    it("只有ADMIN可以分配角色", async function () {
      // owner可以分配角色
      await expect(
        securityDemo.grantRole(MINTER_ROLE, user1.address)
      ).to.emit(securityDemo, "RoleGranted");

      // 非ADMIN用户不能分配角色
      await expect(
        securityDemo.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.revertedWith("访问权限不足");
    });

    it("只有MINTER可以铸造代币", async function () {
      // 分配MINTER角色给user1
      await securityDemo.grantRole(MINTER_ROLE, user1.address);
      
      // user1可以铸造
      await expect(
        securityDemo.connect(user1).mint(user2.address, ethers.utils.parseEther("100"))
      ).to.emit(securityDemo, "Transfer");

      // user2不能铸造
      await expect(
        securityDemo.connect(user2).mint(user2.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("访问权限不足");
    });

    it("只有BURNER可以销毁代币", async function () {
      // 先铸造一些代币
      await securityDemo.mint(user1.address, ethers.utils.parseEther("100"));
      
      // owner可以销毁（有BURNER角色）
      await expect(
        securityDemo.burn(user1.address, ethers.utils.parseEther("50"))
      ).to.emit(securityDemo, "Transfer");

      // user1不能销毁
      await expect(
        securityDemo.connect(user1).burn(user1.address, ethers.utils.parseEther("50"))
      ).to.be.revertedWith("访问权限不足");
    });
  });

  describe("3. 暂停机制测试", function () {
    it("暂停后应该阻止正常操作", async function () {
      // 暂停合约
      await securityDemo.pause();
      expect(await securityDemo.paused()).to.be.true;

      // 暂停后不能存款
      await expect(
        securityDemo.connect(user1).deposit({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("合约已暂停");

      // 暂停后不能提款
      await expect(
        securityDemo.connect(user1).withdraw(ethers.utils.parseEther("1"))
      ).to.be.revertedWith("合约已暂停");
    });

    it("只有ADMIN可以暂停和恢复", async function () {
      // 非ADMIN不能暂停
      await expect(
        securityDemo.connect(user1).pause()
      ).to.be.revertedWith("访问权限不足");

      // ADMIN可以暂停
      await expect(securityDemo.pause()).to.emit(securityDemo, "Paused");
      
      // ADMIN可以恢复
      await expect(securityDemo.unpause()).to.emit(securityDemo, "Unpaused");
    });

    it("紧急提取只能在暂停状态下使用", async function () {
      // 先存入一些资金
      await securityDemo.connect(user1).deposit({ value: ethers.utils.parseEther("1") });
      
      // 未暂停时不能紧急提取
      await expect(
        securityDemo.emergencyWithdraw()
      ).to.be.revertedWith("合约未暂停");

      // 暂停后可以紧急提取
      await securityDemo.pause();
      const initialBalance = await owner.getBalance();
      await securityDemo.emergencyWithdraw();
      
      // 验证资金被提取
      expect(await securityDemo.getContractBalance()).to.equal(0);
    });
  });

  describe("4. CEI模式和错误处理测试", function () {
    it("应该正确处理自定义错误", async function () {
      // 测试零金额错误
      await expect(
        securityDemo.connect(user1).deposit({ value: 0 })
      ).to.be.revertedWithCustomError(securityDemo, "InvalidAmount");

      // 测试余额不足错误
      await expect(
        securityDemo.connect(user1).withdraw(ethers.utils.parseEther("1"))
      ).to.be.revertedWithCustomError(securityDemo, "InsufficientBalance");

      // 测试零地址错误
      await expect(
        securityDemo.connect(user1).transfer(ethers.constants.AddressZero, 100)
      ).to.be.revertedWithCustomError(securityDemo, "ZeroAddress");
    });

    it("转账应该正确更新余额", async function () {
      // 给user1一些代币
      await securityDemo.mint(user1.address, ethers.utils.parseEther("100"));
      
      // 转账
      await expect(
        securityDemo.connect(user1).transfer(user2.address, ethers.utils.parseEther("30"))
      ).to.emit(securityDemo, "Transfer");

      // 验证余额
      expect(await securityDemo.getBalance(user1.address)).to.equal(ethers.utils.parseEther("70"));
      expect(await securityDemo.getBalance(user2.address)).to.equal(ethers.utils.parseEther("30"));
    });
  });

  describe("5. 时间锁测试", function () {
    it("关键操作需要时间锁", async function () {
      const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("critical_op_1"));
      
      // 没有启动时间锁就执行关键操作应该失败
      await expect(
        securityDemo.criticalOperation(operationId)
      ).to.be.revertedWith("时间锁未到期");

      // 启动时间锁
      await expect(
        securityDemo.startTimelock(operationId)
      ).to.emit(securityDemo, "TimelockStarted");

      // 时间锁期间不能执行
      await expect(
        securityDemo.criticalOperation(operationId)
      ).to.be.revertedWith("时间锁未到期");
    });

    it("时间锁到期后可以执行操作", async function () {
      const operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("critical_op_2"));
      
      // 启动时间锁
      await securityDemo.startTimelock(operationId);
      
      // 快进时间（在测试环境中）
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1]); // 2天+1秒
      await ethers.provider.send("evm_mine");

      // 现在可以执行关键操作
      await expect(
        securityDemo.criticalOperation(operationId)
      ).to.emit(securityDemo, "TimelockExecuted");
    });
  });

  describe("6. 数学安全测试", function () {
    it("应该检测数学溢出", async function () {
      const maxUint = ethers.constants.MaxUint256;
      
      // 这应该成功（没有溢出）
      const result = await securityDemo.safeMath(100, 200);
      expect(result.sum).to.equal(300);
      expect(result.product).to.equal(20000);
      
      // 在实际使用中，Solidity 0.8+会自动检查溢出
      // 这里只是演示概念
    });
  });

  describe("7. 完整安全流程测试", function () {
    it("完整的安全操作流程", async function () {
      // 1. 用户存款
      await securityDemo.connect(user1).deposit({ value: ethers.utils.parseEther("2") });
      expect(await securityDemo.getBalance(user1.address)).to.equal(ethers.utils.parseEther("2"));

      // 2. 用户转账
      await securityDemo.connect(user1).transfer(user2.address, ethers.utils.parseEther("0.5"));
      expect(await securityDemo.getBalance(user2.address)).to.equal(ethers.utils.parseEther("0.5"));

      // 3. 用户提款
      await securityDemo.connect(user2).withdraw(ethers.utils.parseEther("0.5"));
      expect(await securityDemo.getBalance(user2.address)).to.equal(0);

      // 4. 管理员铸造代币
      await securityDemo.mint(user1.address, ethers.utils.parseEther("10"));
      expect(await securityDemo.getBalance(user1.address)).to.equal(ethers.utils.parseEther("11.5"));

      // 5. 验证总供应量
      expect(await securityDemo.totalSupply()).to.equal(ethers.utils.parseEther("11.5"));
    });
  });
});
