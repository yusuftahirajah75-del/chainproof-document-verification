import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting DocumentRegistry deployment...");

  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
  const registry = await DocumentRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\n========================================`);
  console.log(`DocumentRegistry deployed successfully!`);
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Deployer Address : ${deployer.address}`);
  console.log(`Network Name     : ${hre.network.name}`);
  console.log(`Chain ID         : ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log(`========================================\n`);

  // Persist deployment metadata for application consumption
  const deploymentInfo = {
    contractAddress,
    deployerAddress: deployer.address,
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };

  const configDir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const outputPath = path.join(configDir, "contractDeployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2), "utf8");
  console.log(`Saved deployment details to ${outputPath}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

