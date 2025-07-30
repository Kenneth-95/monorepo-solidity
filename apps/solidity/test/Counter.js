const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
  let counter;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  describe("部署", function () {
    it("应该将计数器初始化为0", async function () {
      expect(await counter.getCount()).to.equal(0);
    });

    it("应该设置正确的所有者", async function () {
      expect(await counter.getOwner()).to.equal(owner.address);
    });
  });

  describe("增加计数", function () {
    it("应该增加计数器", async function () {
      await counter.increment();
      expect(await counter.getCount()).to.equal(1);
    });

    it("应该在增加时触发事件", async function () {
      await expect(counter.increment())
        .to.emit(counter, "CountIncreased")
        .withArgs(1);
    });

    it("应该能够多次增加", async function () {
      await counter.increment();
      await counter.increment();
      await counter.increment();
      expect(await counter.getCount()).to.equal(3);
    });
  });

  describe("减少计数", function () {
    it("应该减少计数器", async function () {
      await counter.increment();
      await counter.increment();
      await counter.decrement();
      expect(await counter.getCount()).to.equal(1);
    });

    it("应该在减少时触发事件", async function () {
      await counter.increment();
      await expect(counter.decrement())
        .to.emit(counter, "CountDecreased")
        .withArgs(0);
    });

    it("当计数为0时不应该减少", async function () {
      await expect(counter.decrement())
        .to.be.revertedWith("Counter cannot be negative");
    });
  });

  describe("重置计数", function () {
    it("应该允许所有者重置计数器", async function () {
      await counter.increment();
      await counter.increment();
      await counter.reset();
      expect(await counter.getCount()).to.equal(0);
    });

    it("应该在重置时触发事件", async function () {
      await counter.increment();
      await expect(counter.reset())
        .to.emit(counter, "CountReset")
        .withArgs(0);
    });

    it("不应该允许非所有者重置", async function () {
      await expect(counter.connect(addr1).reset())
        .to.be.revertedWith("Only owner can reset");
    });
  });

  describe("查看函数", function () {
    it("应该返回正确的计数值", async function () {
      await counter.increment();
      expect(await counter.count()).to.equal(1);
      expect(await counter.getCount()).to.equal(1);
    });

    it("应该返回正确的所有者", async function () {
      expect(await counter.owner()).to.equal(owner.address);
      expect(await counter.getOwner()).to.equal(owner.address);
    });
  });
}); 