const { mkdir, writeFile } = require("node:fs/promises");
const { network, ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No deployer account configured");

  console.log(`Deploying Campus DAO to ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);

  const membership = await ethers.deployContract("MembershipRegistry", [
    deployer.address,
  ]);
  await membership.waitForDeployment();

  const treasury = await ethers.deployContract("Treasury", [deployer.address]);
  await treasury.waitForDeployment();

  const governor = await ethers.deployContract("CampusGovernor", [
    await membership.getAddress(),
    await treasury.getAddress(),
  ]);
  await governor.waitForDeployment();

  const attendance = await ethers.deployContract("AttendanceRegistry", [
    deployer.address,
  ]);
  await attendance.waitForDeployment();

  await (await treasury.setGovernor(await governor.getAddress())).wait();

  const deployment = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      membership: await membership.getAddress(),
      treasury: await treasury.getAddress(),
      governor: await governor.getAddress(),
      attendance: await attendance.getAddress(),
    },
  };

  await mkdir("deployments", { recursive: true });
  await writeFile(
    `deployments/${network.name}.json`,
    `${JSON.stringify(deployment, null, 2)}\n`,
  );

  console.log(deployment);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
