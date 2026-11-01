const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentRegistry Smart Contract", function () {
  let DocumentRegistry;
  let registry;
  let owner;
  let submitter1;
  let submitter2;

  // Sample SHA-256 hashes converted to bytes32
  const sampleHash1 = "0xa665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
  const sampleHash2 = "0x73475cb40a568e8da8a045ced110137e159f890ac4daecf800431605f10f464e";
  const zeroHash = ethers.ZeroHash;

  beforeEach(async function () {
    [owner, submitter1, submitter2] = await ethers.getSigners();
    DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
    registry = await DocumentRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as the owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should initialize totalRegistered to 0", async function () {
      expect(await registry.totalRegistered()).to.equal(0);
    });
  });

  describe("Document Hash Registration", function () {
    it("Should successfully register a valid document hash and emit event", async function () {
      const docRef = "DOC-20261101-ABCD";

      const tx = await registry.connect(submitter1).registerDocument(sampleHash1, docRef);
      const receipt = await tx.wait();

      expect(await registry.totalRegistered()).to.equal(1);
      expect(await registry.isRegistered(sampleHash1)).to.be.true;

      // Check event emission
      await expect(tx)
        .to.emit(registry, "DocumentRegistered")
        .withArgs(
          sampleHash1,
          submitter1.address,
          (await ethers.provider.getBlock(receipt.blockNumber)).timestamp,
          docRef,
          receipt.blockNumber
        );
    });

    it("Should reject zero hash registration", async function () {
      await expect(
        registry.connect(submitter1).registerDocument(zeroHash, "DOC-INVALID")
      ).to.be.revertedWith("DocumentRegistry: document hash cannot be zero");
    });

    it("Should prevent duplicate document hash registration", async function () {
      await registry.connect(submitter1).registerDocument(sampleHash1, "DOC-ORIGINAL");

      // Attempt second registration with same hash from another address
      await expect(
        registry.connect(submitter2).registerDocument(sampleHash1, "DOC-DUPLICATE")
      ).to.be.revertedWith("DocumentRegistry: document hash already registered");

      expect(await registry.totalRegistered()).to.equal(1);
    });
  });

  describe("Document Verification", function () {
    it("Should return correct record for registered document", async function () {
      const docRef = "DOC-ACADEMIC-THESIS";
      const tx = await registry.connect(submitter1).registerDocument(sampleHash1, docRef);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const [exists, submitter, registeredAt, retrievedRef, blockNumber] =
        await registry.verifyDocument(sampleHash1);

      expect(exists).to.be.true;
      expect(submitter).to.equal(submitter1.address);
      expect(registeredAt).to.equal(block.timestamp);
      expect(retrievedRef).to.equal(docRef);
      expect(blockNumber).to.equal(receipt.blockNumber);
    });

    it("Should return exists=false for unregistered document hash", async function () {
      const [exists, submitter, registeredAt, retrievedRef, blockNumber] =
        await registry.verifyDocument(sampleHash2);

      expect(exists).to.be.false;
      expect(submitter).to.equal(ethers.ZeroAddress);
      expect(registeredAt).to.equal(0);
      expect(retrievedRef).to.equal("");
      expect(blockNumber).to.equal(0);
    });
  });

  describe("Ownership Management", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(registry.connect(owner).transferOwnership(submitter1.address))
        .to.emit(registry, "OwnershipTransferred")
        .withArgs(owner.address, submitter1.address);

      expect(await registry.owner()).to.equal(submitter1.address);
    });

    it("Should reject unauthorized ownership transfer", async function () {
      await expect(
        registry.connect(submitter1).transferOwnership(submitter2.address)
      ).to.be.revertedWith("DocumentRegistry: caller is not the owner");
    });
  });
});

