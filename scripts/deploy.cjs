const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Starting Campus DAO Smart Contract Deployment...");
  console.log("--------------------------------------------------");

  const [deployer, officerAccount, treasurerAccount, studentAccount] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy MembershipContract
  const Membership = await ethers.getContractFactory("MembershipContract");
  const membership = await Membership.deploy();
  await membership.waitForDeployment();
  const membershipAddress = await membership.getAddress();
  console.log("✓ MembershipContract deployed to:", membershipAddress);

  // 2. Deploy VotingContract
  const Voting = await ethers.getContractFactory("VotingContract");
  const voting = await Voting.deploy(membershipAddress);
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("✓ VotingContract deployed to:", votingAddress);

  // 3. Deploy GovernanceContract
  const Governance = await ethers.getContractFactory("GovernanceContract");
  const governance = await Governance.deploy(membershipAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✓ GovernanceContract deployed to:", governanceAddress);

  // 4. Deploy TreasuryContract
  const Treasury = await ethers.getContractFactory("TreasuryContract");
  const treasury = await Treasury.deploy(membershipAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✓ TreasuryContract deployed to:", treasuryAddress);

  // 5. Deploy VerificationContract
  const Verification = await ethers.getContractFactory("VerificationContract");
  const verification = await Verification.deploy(membershipAddress);
  await verification.waitForDeployment();
  const verificationAddress = await verification.getAddress();
  console.log("✓ VerificationContract deployed to:", verificationAddress);

  // Setup initial demo state on deployment
  console.log("\nSeeding initial demo permissions and on-chain records...");
  
  // Authorize deployer student ID mapping if not already authorized
  if (!await membership.isAuthorized(deployer.address)) {
    const deployerStudentId = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROOT"));
    await membership.authorizeWallet(deployer.address, deployerStudentId);
  }

  // If additional accounts exist, authorize them
  if (officerAccount) {
    const officerId = ethers.keccak256(ethers.toUtf8Bytes("2023BCSE010")); // Rahul Verma (Officer)
    await membership.authorizeWallet(officerAccount.address, officerId);
    await membership.setRole(officerAccount.address, 2); // Role.Officer
    console.log("✓ Authorized Officer:", officerAccount.address);
  }

  if (treasurerAccount) {
    const treasurerId = ethers.keccak256(ethers.toUtf8Bytes("2023BCSE025")); // Priya Nair (Treasurer)
    await membership.authorizeWallet(treasurerAccount.address, treasurerId);
    await membership.setRole(treasurerAccount.address, 3); // Role.Treasurer
    console.log("✓ Authorized Treasurer:", treasurerAccount.address);
  }

  if (studentAccount) {
    const studentId = ethers.keccak256(ethers.toUtf8Bytes("2023BCSE042")); // Aditi Sharma (Member)
    await membership.authorizeWallet(studentAccount.address, studentId);
    console.log("✓ Authorized Student:", studentAccount.address);
  }

  // Create initial demo election
  const now = Math.floor(Date.now() / 1000);
  const electionStartTime = now - 60; // started 1 min ago
  const electionEndTime = now + 7 * 86400; // 7 days duration
  await voting.createElection(
    "Coding Club President Election 2026",
    electionStartTime,
    electionEndTime,
    [1, 2, 3],
    ["Aditi Sharma (Cloud & AI Lead)", "Rahul Verma (Competitive Programmer)", "Karan Gupta (Full-Stack Dev)"]
  );
  console.log("✓ Created Sample Election: Coding Club President Election 2026");

  // Create initial demo proposal
  const proposalHash = ethers.keccak256(ethers.toUtf8Bytes("Conduct National Hackathon 'Hack-Campus' 2026"));
  await governance.createProposal(proposalHash, 5 * 86400);
  console.log("✓ Created Sample Governance Proposal: Hack-Campus 2026");

  // Create initial demo spending proposal
  const spendHash = ethers.keccak256(ethers.toUtf8Bytes("₹15,000 for Hackathon Refreshments & Prizes"));
  await treasury.createSpendingProposal(spendHash, 15000, 5 * 86400);
  console.log("✓ Created Sample Treasury Proposal: ₹15,000 for Hackathon");

  // Store an initial attendance verification proof
  const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("ATTENDANCE_WORKSHOP_WEB3_DAY1"));
  const canonicalHash = ethers.keccak256(ethers.toUtf8Bytes("CANONICAL_JSON_ATTENDANCE_HASH_V1"));
  await verification.storeProof(recordSetId, canonicalHash);
  console.log("✓ Stored Sample Attendance Proof:", recordSetId);

  // Export addresses and ABIs to frontend
  const contractsDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deployedAddresses = {
    MembershipContract: membershipAddress,
    VotingContract: votingAddress,
    GovernanceContract: governanceAddress,
    TreasuryContract: treasuryAddress,
    VerificationContract: verificationAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployedAddresses.json"),
    JSON.stringify(deployedAddresses, null, 2)
  );

  // Copy ABIs from artifacts
  const abisDir = path.join(contractsDir, "abis");
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  const contractNames = [
    "MembershipContract",
    "VotingContract",
    "GovernanceContract",
    "TreasuryContract",
    "VerificationContract"
  ];

  for (const name of contractNames) {
    const artifactPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      `${name}.sol`,
      `${name}.json`
    );
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      fs.writeFileSync(
        path.join(abisDir, `${name}.json`),
        JSON.stringify(artifact.abi, null, 2)
      );
    }
  }

  console.log("✓ Successfully exported contract addresses and ABIs to frontend src/contracts/");
  console.log("--------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
