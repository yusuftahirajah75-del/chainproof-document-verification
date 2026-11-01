import { ethers } from "ethers";
import {
  getDocumentRegistryContract,
  getBlockchainProvider,
  getBlockchainWallet,
  getContractAddress,
} from "../config/blockchain.js";
import { HashService } from "./hashService.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/env.js";

export class BlockchainService {
  /**
   * Registers a document hash on the smart contract
   * @param {string} sha256Hash 64-char hex string
   * @param {string} docReference Document tracking reference
   * @returns {Promise<object>} Transaction details
   */
  static async registerDocumentOnChain(sha256Hash, docReference) {
    const bytes32Hash = HashService.toBytes32(sha256Hash);

    try {
      const contract = getDocumentRegistryContract();
      const wallet = getBlockchainWallet();

      // Check if already registered on-chain
      const existsOnChain = await contract.isRegistered(bytes32Hash);
      if (existsOnChain) {
        throw new AppError(
          "Document hash is already registered on the blockchain ledger.",
          409
        );
      }

      logger.info(
        `[Blockchain] Submitting registration tx for hash ${bytes32Hash} (Ref: ${docReference})`
      );

      // Execute contract transaction
      const tx = await contract.registerDocument(bytes32Hash, docReference);
      logger.info(`[Blockchain] Tx broadcasted: ${tx.hash}. Waiting for confirmation...`);

      const receipt = await tx.wait(1); // Wait for 1 confirmation
      const block = await receipt.getBlock();

      const blockTimestamp = block ? new Date(Number(block.timestamp) * 1000) : new Date();

      logger.info(
        `[Blockchain] Tx confirmed in block ${receipt.blockNumber}. Gas used: ${receipt.gasUsed}`
      );

      return {
        transactionHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        blockTimestamp,
        networkName: config.blockchain.network,
        chainId: Number((await getBlockchainProvider().getNetwork()).chainId),
        contractAddress: getContractAddress(),
        submitterAddress: wallet.address,
        gasUsed: Number(receipt.gasUsed),
        effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : "0",
        status: receipt.status === 1 ? "CONFIRMED" : "FAILED",
      };
    } catch (err) {
      if (err instanceof AppError) throw err;

      // Handle custom revert strings or already registered
      if (err.message && err.message.includes("already registered")) {
        throw new AppError("Document hash is already registered on the blockchain.", 409);
      }

      logger.error(`[Blockchain Error during registration]: ${err.message}`);
      throw new AppError(`Blockchain transaction failed: ${err.message}`, 502);
    }
  }

  /**
   * Independently verify a document hash directly against the smart contract
   * @param {string} sha256Hash
   * @returns {Promise<object>} Verification result
   */
  static async verifyDocumentOnChain(sha256Hash) {
    const bytes32Hash = HashService.toBytes32(sha256Hash);

    try {
      const provider = getBlockchainProvider();
      const contract = getDocumentRegistryContract(provider);

      const [exists, submitter, registeredAt, docReference, blockNumber] =
        await contract.verifyDocument(bytes32Hash);

      if (!exists) {
        return {
          exists: false,
          documentHash: sha256Hash,
          bytes32Hash,
          submitter: null,
          registeredAt: null,
          docReference: null,
          blockNumber: null,
        };
      }

      return {
        exists: true,
        documentHash: sha256Hash,
        bytes32Hash,
        submitter,
        registeredAt: new Date(Number(registeredAt) * 1000),
        docReference,
        blockNumber: Number(blockNumber),
      };
    } catch (err) {
      logger.error(`[Blockchain Verification Call Failed]: ${err.message}`);
      throw new AppError(`Failed to query blockchain record: ${err.message}`, 502);
    }
  }

  /**
   * Lookup transaction receipt and event logs
   * @param {string} txHash
   */
  static async getTransactionReceipt(txHash) {
    try {
      const provider = getBlockchainProvider();
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        throw new AppError("Transaction receipt not found on blockchain.", 404);
      }

      const tx = await provider.getTransaction(txHash);
      const block = await receipt.getBlock();

      return {
        transactionHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        blockTimestamp: block ? new Date(Number(block.timestamp) * 1000) : null,
        from: tx ? tx.from : receipt.from,
        to: tx ? tx.to : receipt.to,
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : null,
        status: receipt.status === 1 ? "SUCCESS" : "REVERTED",
        confirmations: await receipt.confirmations(),
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Error fetching transaction: ${err.message}`, 500);
    }
  }
}

