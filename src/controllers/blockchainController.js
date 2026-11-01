import { BlockchainService } from "../services/blockchainService.js";
import { checkBlockchainConnection, getContractAddress } from "../config/blockchain.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { config } from "../config/env.js";

export class BlockchainController {
  /**
   * Get blockchain node and smart contract status
   */
  static async getStatus(req, res, next) {
    try {
      const health = await checkBlockchainConnection();
      const contractAddress = getContractAddress();

      return ApiResponse.success(res, "Blockchain network status.", {
        network: config.blockchain.network,
        rpcUrl: config.blockchain.rpcUrl,
        connected: health.connected,
        latestBlockNumber: health.blockNumber || null,
        contractConfigured: Boolean(contractAddress),
        contractAddress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Query transaction receipt and on-chain details
   */
  static async getTransaction(req, res, next) {
    try {
      const { txHash } = req.params;
      const receipt = await BlockchainService.getTransactionReceipt(txHash);
      return ApiResponse.success(res, "Transaction receipt retrieved.", { transaction: receipt });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Direct on-chain verification lookup without database dependency
   */
  static async verifyHashOnChain(req, res, next) {
    try {
      const { hash } = req.params;
      const onChainRecord = await BlockchainService.verifyDocumentOnChain(hash);
      return ApiResponse.success(res, "On-chain record retrieved.", { record: onChainRecord });
    } catch (error) {
      next(error);
    }
  }
}

