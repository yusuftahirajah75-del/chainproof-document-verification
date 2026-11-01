import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./env.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard ABI for DocumentRegistry
export const DOCUMENT_REGISTRY_ABI = [
  "event DocumentRegistered(bytes32 indexed documentHash, address indexed submitter, uint256 registeredAt, string docReference, uint256 blockNumber)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "function registerDocument(bytes32 documentHash, string calldata docReference) external",
  "function verifyDocument(bytes32 documentHash) external view returns (bool exists, address submitter, uint256 registeredAt, string memory docReference, uint256 blockNumber)",
  "function isRegistered(bytes32 documentHash) external view returns (bool)",
  "function totalRegistered() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function transferOwnership(address newOwner) external",
];

/**
 * Resolve contract address dynamically from deployment metadata or environment variable
 */
export function getContractAddress() {
  if (config.blockchain.contractAddress && config.blockchain.contractAddress !== "") {
    return config.blockchain.contractAddress;
  }

  // Attempt reading from scripts/deploy.js output
  const deploymentFile = path.join(__dirname, "contractDeployment.json");
  if (fs.existsSync(deploymentFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      if (data.contractAddress) {
        return data.contractAddress;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

/**
 * Returns JsonRpcProvider
 */
export function getBlockchainProvider() {
  return new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
}

/**
 * Returns Wallet with provider attached
 */
export function getBlockchainWallet() {
  const provider = getBlockchainProvider();
  return new ethers.Wallet(config.blockchain.privateKey, provider);
}

/**
 * Returns ethers.Contract instance
 * @param {ethers.Signer|ethers.Provider} [signerOrProvider]
 */
export function getDocumentRegistryContract(signerOrProvider = null) {
  const address = getContractAddress();
  if (!address) {
    throw new Error(
      "DocumentRegistry contract address is not configured. Please deploy the contract or set CONTRACT_ADDRESS."
    );
  }

  const signer = signerOrProvider || getBlockchainWallet();
  return new ethers.Contract(address, DOCUMENT_REGISTRY_ABI, signer);
}

/**
 * Verifies connectivity to the blockchain node
 */
export async function checkBlockchainConnection() {
  try {
    const provider = getBlockchainProvider();
    const blockNumber = await provider.getBlockNumber();
    logger.info(`[Blockchain Health] Connected to RPC. Latest block: ${blockNumber}`);
    return { connected: true, blockNumber };
  } catch (err) {
    logger.warn(`[Blockchain Health] Node not reachable: ${err.message}`);
    return { connected: false, error: err.message };
  }
}

