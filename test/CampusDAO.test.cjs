const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campus DAO — Smart Contract Test Suite", function () {
  let membership, voting, governance, treasury, verification;
  let admin, officer, treasurer, student1, student2, unauthorizedUser;

  const student1Id = ethers.keccak256(ethers.toUtf8Bytes("2023BCSE001"));
  const student2Id = ethers.keccak256(ethers.toUtf8Bytes("2023BCSE002"));

  beforeEach(async function () {
    [admin, officer, treasurer, student1, student2, unauthorizedUser] = await ethers.getSigners();

    // Deploy MembershipContract
    const MembershipFactory = await ethers.getContractFactory("MembershipContract");
    membership = await MembershipFactory.deploy();
    await membership.waitForDeployment();

    // Authorize roles
    await membership.authorizeWallet(officer.address, ethers.keccak256(ethers.toUtf8Bytes("OFFICER_01")));
    await membership.setRole(officer.address, 2); // Role.Officer

    await membership.authorizeWallet(treasurer.address, ethers.keccak256(ethers.toUtf8Bytes("TREASURER_01")));
    await membership.setRole(treasurer.address, 3); // Role.Treasurer

    await membership.authorizeWallet(student1.address, student1Id); // Role.Member by default
    await membership.authorizeWallet(student2.address, student2Id);

    // Deploy other contracts with membership address
    const VotingFactory = await ethers.getContractFactory("VotingContract");
    voting = await VotingFactory.deploy(await membership.getAddress());
    await voting.waitForDeployment();

    const GovernanceFactory = await ethers.getContractFactory("GovernanceContract");
    governance = await GovernanceFactory.deploy(await membership.getAddress());
    await governance.waitForDeployment();

    const TreasuryFactory = await ethers.getContractFactory("TreasuryContract");
    treasury = await TreasuryFactory.deploy(await membership.getAddress());
    await treasury.waitForDeployment();

    const VerificationFactory = await ethers.getContractFactory("VerificationContract");
    verification = await VerificationFactory.deploy(await membership.getAddress());
    await verification.waitForDeployment();
  });

  describe("1. Membership & Sybil / Multi-Wallet Mitigation", function () {
    it("Should correctly authorize verified wallets with roles", async function () {
      expect(await membership.isAuthorized(student1.address)).to.be.true;
      expect(await membership.isAuthorized(unauthorizedUser.address)).to.be.false;
      expect(await membership.roleOf(officer.address)).to.equal(2); // Officer
      expect(await membership.roleOf(treasurer.address)).to.equal(3); // Treasurer
    });

    it("Should prevent authorizing an already authorized wallet", async function () {
      await expect(
        membership.authorizeWallet(student1.address, ethers.keccak256(ethers.toUtf8Bytes("NEW_ID")))
      ).to.be.revertedWith("Wallet is already authorized");
    });

    it("Should prevent a student from claiming a second active wallet (Sybil defense)", async function () {
      await expect(
        membership.authorizeWallet(unauthorizedUser.address, student1Id)
      ).to.be.revertedWith("Student already has an active wallet");
    });

    it("Should support wallet replacement while preserving the studentIdHash", async function () {
      const newWallet = unauthorizedUser;
      await membership.replaceWallet(student1.address, newWallet.address);

      expect(await membership.isAuthorized(student1.address)).to.be.false;
      expect(await membership.isAuthorized(newWallet.address)).to.be.true;
      expect(await membership.studentIdOf(newWallet.address)).to.equal(student1Id);
    });
  });

  describe("2. Voting System & Elections", function () {
    let electionId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now - 10;
      const endTime = now + 3600;
      const candidateIds = [1, 2];
      const candidateNames = ["Aditi Sharma", "Rahul Verma"];

      const tx = await voting.connect(officer).createElection(
        "Coding Club President 2026",
        startTime,
        endTime,
        candidateIds,
        candidateNames
      );
      await tx.wait();
      electionId = 1;
    });

    it("Should allow authorized student to cast a vote", async function () {
      await expect(voting.connect(student1).vote(electionId, 1))
        .to.emit(voting, "VoteCast")
        .withArgs(electionId, 1, student1Id, student1.address);

      const [ids, names, counts] = await voting.getResults(electionId);
      expect(counts[0]).to.equal(1);
      expect(counts[1]).to.equal(0);
    });

    it("Should prevent duplicate voting by the same student", async function () {
      await voting.connect(student1).vote(electionId, 1);
      await expect(voting.connect(student1).vote(electionId, 2)).to.be.revertedWith(
        "VotingContract: Student has already voted in this election"
      );
    });

    it("Should prevent unauthorized wallet from voting", async function () {
      await expect(voting.connect(unauthorizedUser).vote(electionId, 1)).to.be.revertedWith(
        "VotingContract: Wallet not authorized"
      );
    });

    it("Should prevent double voting even if wallet was replaced during election", async function () {
      await voting.connect(student1).vote(electionId, 1);
      // Replace student1 wallet with unauthorizedUser address
      await membership.replaceWallet(student1.address, unauthorizedUser.address);

      // Now unauthorizedUser is student1's new wallet, but studentId is already marked as voted
      await expect(voting.connect(unauthorizedUser).vote(electionId, 2)).to.be.revertedWith(
        "VotingContract: Student has already voted in this election"
      );
    });
  });

  describe("3. DAO Governance Proposals", function () {
    it("Should allow officer to create proposal and members to vote and finalize", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("Conduct National Hackathon 2026"));
      const votingPeriod = 60; // 60 seconds

      const tx = await governance.connect(officer).createProposal(contentHash, votingPeriod);
      await tx.wait();

      // Student1 votes Yes
      await governance.connect(student1).voteOnProposal(1, true);
      // Student2 votes Yes
      await governance.connect(student2).voteOnProposal(1, true);

      // Cannot vote twice
      await expect(governance.connect(student1).voteOnProposal(1, false)).to.be.revertedWith(
        "GovernanceContract: Already voted on this proposal"
      );

      // Fast forward time past voting period
      await ethers.provider.send("evm_increaseTime", [65]);
      await ethers.provider.send("evm_mine");

      await expect(governance.finalizeProposal(1))
        .to.emit(governance, "ProposalFinalized")
        .withArgs(1, 1, 2, 0); // ProposalState.Passed = 1

      // Officer executes passed proposal
      await expect(governance.connect(officer).executeProposal(1))
        .to.emit(governance, "ProposalExecuted")
        .withArgs(1);
    });
  });

  describe("4. Treasury Governance (₹ INR Budget Requests & Demo Token Simulation)", function () {
    it("Should handle spending proposal creation, member voting, and approval proof", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("Hackathon Refreshments & Prizes"));
      const amountINR = 15000; // ₹15,000
      const votingPeriod = 60;

      await treasury.connect(treasurer).createSpendingProposal(contentHash, amountINR, votingPeriod);

      // Members vote Yes
      await treasury.connect(student1).voteOnSpendingProposal(1, true);
      await treasury.connect(student2).voteOnSpendingProposal(1, true);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [65]);
      await ethers.provider.send("evm_mine");

      // Finalize -> triggers SpendingApproved governance event
      await expect(treasury.finalizeSpendingProposal(1))
        .to.emit(treasury, "SpendingApproved")
        .withArgs(1, amountINR, treasurer.address, await membership.studentIdOf(treasurer.address));

      // Release demo simulation funds
      await expect(treasury.connect(treasurer).releaseDemoFunds(1))
        .to.emit(treasury, "DemoFundsReleased")
        .withArgs(1, amountINR, treasurer.address);
    });
  });

  describe("5. Attendance & Record Tamper-Evidence Verification", function () {
    it("Should store record hash proof and detect tampering", async function () {
      const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("EVENT_ATTENDANCE_HACKATHON_DAY1"));
      const canonicalRecordHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify([{ student: "2023BCSE001", present: true }]))
      );

      // Store proof
      await expect(verification.connect(officer).storeProof(recordSetId, canonicalRecordHash))
        .to.emit(verification, "ProofStored")
        .withArgs(recordSetId, canonicalRecordHash, (val) => val > 0, officer.address);

      // Verify authentic record
      expect(await verification.verifyProof(recordSetId, canonicalRecordHash)).to.be.true;

      // Verify tampered record (someone silently modified present status)
      const tamperedRecordHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify([{ student: "2023BCSE001", present: false }]))
      );
      expect(await verification.verifyProof(recordSetId, tamperedRecordHash)).to.be.false;
    });
  });
});
