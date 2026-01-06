import { ethers } from 'ethers';

// Ethereum Sepolia Chain ID
const CHAIN_ID = 11155111;

export interface TransactionParams {
    to: string;
    value: string; // ETH amount
    gasLimit: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    nonce: number;
    chainId: number;
}

export class WalletService {
    /**
     * Generates a completely new random wallet.
     */
    static generateWallet(): ethers.HDNodeWallet {
        return ethers.Wallet.createRandom();
    }

    /**
     * Imports a wallet from a mnemonic phrase or private key.
     * @param input Mnemonic phrase or private key
     */
    static importWallet(input: string): ethers.Wallet | ethers.HDNodeWallet {
        const cleanInput = input.trim();

        // Check if it's a mnemonic (spaces check is a simple heuristic, proper check via ethers)
        if (cleanInput.includes(' ')) {
            return ethers.Wallet.fromPhrase(cleanInput);
        } else {
            // Assume private key
            // Add 0x if missing
            const privateKey = cleanInput.startsWith('0x') ? cleanInput : `0x${cleanInput}`;
            return new ethers.Wallet(privateKey);
        }
    }

    /**
     * Encrypts the wallet with a password.
     * @param wallet The wallet to encrypt
     * @param password The password to use
     */
    static async encryptWallet(wallet: ethers.Wallet | ethers.HDNodeWallet, password: string): Promise<string> {
        return await wallet.encrypt(password);
    }

    /**
     * Decrypts a wallet from JSON.
     * @param json Encrypted JSON
     * @param password Password
     */
    static async decryptWallet(json: string, password: string): Promise<ethers.Wallet | ethers.HDNodeWallet> {
        return await ethers.Wallet.fromEncryptedJson(json, password);
    }

    /**
     * Creates an unsigned transaction object (mostly for validation/display before signing).
     */
    static createTransactionRequest(params: TransactionParams): ethers.TransactionRequest {
        return {
            to: params.to,
            value: ethers.parseEther(params.value),
            gasLimit: BigInt(params.gasLimit),
            maxFeePerGas: ethers.parseUnits(params.maxFeePerGas, 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits(params.maxPriorityFeePerGas, 'gwei'),
            nonce: params.nonce,
            chainId: params.chainId,
            type: 2, // EIP-1559
        };
    }

    /**
     * Signs a transaction completely offline.
     * @param wallet The signer wallet
     * @param params Transaction parameters
     * @returns Signed transaction hex string
     */
    static async signTransaction(wallet: ethers.Wallet | ethers.HDNodeWallet, params: TransactionParams): Promise<string> {
        const txRequest = this.createTransactionRequest(params);
        // signTransaction populates the transaction with the properties and signs it
        return await wallet.signTransaction(txRequest);
    }
}
