const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const HealthRecord = await ethers.getContractFactory("HealthRecord");
  const contract = await HealthRecord.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);

  // Optional: Save address to a file
  fs.writeFileSync("deployedAddress.json", JSON.stringify({ address }, null, 2));
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
