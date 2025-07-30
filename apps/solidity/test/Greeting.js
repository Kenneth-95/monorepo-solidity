const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeting", function () {
  let greeting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Greeting = await ethers.getContractFactory("Greeting");
    greeting = await Greeting.deploy("World");
    await greeting.waitForDeployment();
  });

  describe("部署", function () {
    it("应该设置初始问候语", async function () {
      expect(await greeting.getGreeting()).to.equal("World");
    });

    it("应该设置正确的所有者", async function () {
      expect(await greeting.owner()).to.equal(owner.address);
    });

    it("应该将更改次数初始化为0", async function () {
      expect(await greeting.getChangeCount()).to.equal(0);
    });
  });

  describe("设置问候语", function () {
    it("应该能够设置新的问候语", async function () {
      await greeting.setGreeting("Alice");
      expect(await greeting.getGreeting()).to.equal("Alice");
    });

    it("应该在设置时触发事件", async function () {
      await expect(greeting.setGreeting("Bob"))
        .to.emit(greeting, "GreetingChanged")
        .withArgs("Bob", owner.address);
    });

    it("应该增加更改次数", async function () {
      await greeting.setGreeting("Charlie");
      expect(await greeting.getChangeCount()).to.equal(1);
      
      await greeting.setGreeting("David");
      expect(await greeting.getChangeCount()).to.equal(2);
    });

    it("应该允许任何人设置问候语", async function () {
      await greeting.connect(addr1).setGreeting("Eve");
      expect(await greeting.getGreeting()).to.equal("Eve");
    });
  });

  describe("获取完整问候信息", function () {
    it("应该返回格式化的问候信息", async function () {
      await greeting.setGreeting("Alice");
      expect(await greeting.getFullGreeting()).to.equal("Hello, Alice!");
    });

    it("应该在问候语前后添加正确的文本", async function () {
      await greeting.setGreeting("Blockchain");
      expect(await greeting.getFullGreeting()).to.equal("Hello, Blockchain!");
    });
  });

  describe("重置问候语", function () {
    it("应该允许所有者重置问候语", async function () {
      await greeting.setGreeting("Test");
      await greeting.resetGreeting();
      expect(await greeting.getGreeting()).to.equal("World");
    });

    it("应该在重置时触发事件", async function () {
      await greeting.setGreeting("Test");
      await expect(greeting.resetGreeting())
        .to.emit(greeting, "GreetingChanged")
        .withArgs("World", owner.address);
    });

    it("应该将更改次数重置为0", async function () {
      await greeting.setGreeting("Test1");
      await greeting.setGreeting("Test2");
      expect(await greeting.getChangeCount()).to.equal(2);
      
      await greeting.resetGreeting();
      expect(await greeting.getChangeCount()).to.equal(0);
    });

    it("不应该允许非所有者重置", async function () {
      await expect(greeting.connect(addr1).resetGreeting())
        .to.be.revertedWith("Only owner can reset");
    });
  });

  describe("查看函数", function () {
    it("应该返回正确的问候语", async function () {
      await greeting.setGreeting("Test");
      expect(await greeting.greeting()).to.equal("Test");
      expect(await greeting.getGreeting()).to.equal("Test");
    });

    it("应该返回正确的更改次数", async function () {
      await greeting.setGreeting("Test1");
      await greeting.setGreeting("Test2");
      expect(await greeting.changeCount()).to.equal(2);
      expect(await greeting.getChangeCount()).to.equal(2);
    });
  });
}); 