const { expect } = require("chai");
const { ethers } = require("hardhat");

async function mineBlocks(count) {
  await ethers.provider.send("hardhat_mine", [`0x${count.toString(16)}`]);
}

describe("Campus DAO", function () {
  async function deployFixture() {
    const [admin, alice, bob, carol, dave, outsider] =
      await ethers.getSigners();

    const membership = await ethers.deployContract("MembershipRegistry", [
      admin.address,
    ]);
    const treasury = await ethers.deployContract("Treasury", [admin.address]);
    const governor = await ethers.deployContract("CampusGovernor", [
      await membership.getAddress(),
      await treasury.getAddress(),
    ]);
    const attendance = await ethers.deployContract("AttendanceRegistry", [
      admin.address,
    ]);
    await treasury.setGovernor(await governor.getAddress());

    for (const member of [alice, bob, carol, dave]) {
      await membership.registerMember(member.address);
    }

    return {
      admin,
      alice,
      bob,
      carol,
      dave,
      outsider,
      membership,
      treasury,
      governor,
      attendance,
    };
  }

  it("accepts exactly 60 percent YES approval", async function () {
    const { alice, bob, carol, dave, outsider, membership, governor } = await deployFixture();
    await membership.registerMember(outsider.address);
    await governor.connect(alice).createProposal(ethers.sha256(ethers.toUtf8Bytes("exact-sixty")), ethers.ZeroAddress, 0, 20);
    for (const member of [alice, bob, carol]) await governor.connect(member).castVote(1, 1);
    for (const member of [dave, outsider]) await governor.connect(member).castVote(1, 0);
    await mineBlocks(21);
    expect(await governor.state(1)).to.equal(3n);
  });

  it("keeps membership non-transferable and manager controlled", async function () {
    const { alice, outsider, membership } = await deployFixture();
    expect(await membership.isMember(alice.address)).to.equal(true);
    expect(await membership.memberCount()).to.equal(4n);

    await expect(
      membership.connect(outsider).registerMember(outsider.address),
    ).to.be.reverted;
    await expect(
      membership.registerMember(alice.address),
    ).to.be.revertedWithCustomError(membership, "AlreadyMember");

    await membership.revokeMember(alice.address);
    expect(await membership.isMember(alice.address)).to.equal(false);
    expect(await membership.memberCount()).to.equal(3n);
  });

  it("rejects non-members, duplicate ballots, and invalid vote types", async function () {
    const { alice, outsider, governor } = await deployFixture();
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("proposal-one"));

    await governor
      .connect(alice)
      .createProposal(metadataHash, ethers.ZeroAddress, 0, 10);

    await expect(
      governor.connect(outsider).castVote(1, 1),
    ).to.be.revertedWithCustomError(governor, "OnlyMember");

    await governor.connect(alice).castVote(1, 1);
    await expect(
      governor.connect(alice).castVote(1, 0),
    ).to.be.revertedWithCustomError(governor, "AlreadyVoted");
  });

  it("enforces quorum and the 60 percent approval threshold", async function () {
    const { alice, bob, governor } = await deployFixture();
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("threshold-test"));

    await governor
      .connect(alice)
      .createProposal(metadataHash, ethers.ZeroAddress, 0, 10);
    await governor.connect(alice).castVote(1, 1);
    await governor.connect(bob).castVote(1, 0);
    await mineBlocks(11);

    // Turnout is 50%, but YES approval is only 50%.
    expect(await governor.state(1)).to.equal(2n);
    await expect(governor.execute(1)).to.be.revertedWithCustomError(
      governor,
      "ProposalNotPassed",
    );
  });

  it("executes an approved treasury transfer exactly once", async function () {
    const { admin, alice, bob, carol, dave, governor, treasury } =
      await deployFixture();
    const amount = ethers.parseEther("1");
    await admin.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("2"),
    });

    await governor
      .connect(alice)
      .createProposal(
        ethers.keccak256(ethers.toUtf8Bytes("fund-hacknight")),
        dave.address,
        amount,
        10,
      );
    await governor.connect(alice).castVote(1, 1);
    await governor.connect(bob).castVote(1, 1);
    await governor.connect(carol).castVote(1, 0);
    await mineBlocks(11);

    expect(await governor.state(1)).to.equal(3n);
    const before = await ethers.provider.getBalance(dave.address);
    await governor.execute(1);
    const after = await ethers.provider.getBalance(dave.address);

    expect(after - before).to.equal(amount);
    expect(await governor.state(1)).to.equal(4n);
    expect(await treasury.proposalExecuted(1)).to.equal(true);
    await expect(governor.execute(1)).to.be.revertedWithCustomError(
      governor,
      "ProposalNotPassed",
    );
  });

  it("stores one immutable attendance proof per event", async function () {
    const { admin, outsider, attendance } = await deployFixture();
    const eventId = ethers.keccak256(ethers.toUtf8Bytes("evt-design-critique"));
    const attendanceHash = ethers.sha256(
      ethers.toUtf8Bytes('{"eventId":"evt-design-critique","wallets":[]}'),
    );

    await expect(
      attendance
        .connect(outsider)
        .finalizeAttendance(eventId, attendanceHash),
    ).to.be.reverted;

    await attendance
      .connect(admin)
      .finalizeAttendance(eventId, attendanceHash);
    expect(
      await attendance.verifyAttendance(eventId, attendanceHash),
    ).to.equal(true);

    await expect(
      attendance
        .connect(admin)
        .finalizeAttendance(eventId, attendanceHash),
    ).to.be.revertedWithCustomError(attendance, "EventAlreadyFinalized");
  });

  it("defeats a unanimous vote when turnout is below 30 percent", async function () {
    const { alice, governor } = await deployFixture();
    await governor.connect(alice).createProposal(ethers.id("low-turnout"), ethers.ZeroAddress, 0, 10);
    await governor.connect(alice).castVote(1, 1);
    await mineBlocks(11);
    // One out of four members = 25%, even though YES approval is 100%.
    expect(await governor.state(1)).to.equal(2n);
  });

  it("counts ABSTAIN for quorum and excludes it from approval", async function () {
    const { alice, bob, governor } = await deployFixture();
    await governor.connect(alice).createProposal(ethers.id("abstain"), ethers.ZeroAddress, 0, 10);
    await governor.connect(alice).castVote(1, 1);
    await governor.connect(bob).castVote(1, 2);
    await mineBlocks(11);
    expect(await governor.state(1)).to.equal(3n);
  });

  it("rejects invalid choices, revoked voters, and late votes", async function () {
    const { alice, bob, membership, governor } = await deployFixture();
    await governor.connect(alice).createProposal(ethers.id("invalid"), ethers.ZeroAddress, 0, 10);
    await expect(governor.connect(bob).castVote(1, 3)).to.be.revertedWithCustomError(governor, "InvalidVoteType");
    await membership.revokeMember(bob.address);
    await expect(governor.connect(bob).castVote(1, 1)).to.be.revertedWithCustomError(governor, "OnlyMember");
    await mineBlocks(11);
    await expect(governor.connect(alice).castVote(1, 1)).to.be.revertedWithCustomError(governor, "ProposalNotActive");
  });

  it("prevents even the admin from bypassing or replacing the governor", async function () {
    const { admin, alice, treasury, governor } = await deployFixture();
    await expect(treasury.connect(admin).execute(1, alice.address, 1)).to.be.revertedWithCustomError(treasury, "OnlyGovernor");
    await expect(treasury.setGovernor(alice.address)).to.be.revertedWithCustomError(treasury, "GovernorAlreadySet");
    await governor.connect(alice).createProposal(ethers.id("early"), ethers.ZeroAddress, 0, 10);
    await expect(governor.execute(1)).to.be.revertedWithCustomError(governor, "ProposalNotPassed");
  });

  it("rejects an invalid attendance administrator and mismatched proofs", async function () {
    await expect(ethers.deployContract("AttendanceRegistry", [ethers.ZeroAddress])).to.be.reverted;
    const { attendance } = await deployFixture();
    const eventId = ethers.id("event");
    await attendance.finalizeAttendance(eventId, ethers.sha256(ethers.toUtf8Bytes("original")));
    expect(await attendance.verifyAttendance(eventId, ethers.sha256(ethers.toUtf8Bytes("edited")))).to.equal(false);
  });
});
