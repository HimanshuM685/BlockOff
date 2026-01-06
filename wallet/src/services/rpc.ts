import { ethers } from 'ethers';

const SEPOLIA_RPC_URL = 'https://ethereum-sepolia.publicnode.com'; // Public RPC (Better CORS)
const CHAIN_ID = 11155111;

export class RpcService {
    private static provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

    static async getBalance(address: string): Promise<string> {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            return '0.0';
        }
    }

    static async getNonce(address: string): Promise<number> {
        try {
            return await this.provider.getTransactionCount(address);
        } catch (error) {
            console.error('Failed to fetch nonce:', error);
            return 0;
        }
    }

    static async broadcastTransaction(signedTx: string): Promise<string> {
        try {
            const tx = await this.provider.broadcastTransaction(signedTx);
            return tx.hash;
        } catch (error) {
            console.error('Failed to broadcast transaction:', error);
            throw error;
        }
    }

    static async getFeeData() {
        return await this.provider.getFeeData();
    }
}
