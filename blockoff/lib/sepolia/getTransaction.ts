/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendSimpleTransaction, getBalance } from './simpleTransaction';

/**
 * Demo function - Easy to test transaction on any chain
 * Just provide: private key, receiver address, amount, and chain
 */
export async function demoTransaction(
  privateKey: string,
  receiverAddress: string,
  amount: string,
  chainId: string = 'sepolia'
) {
  console.log(`🚀 Demo ${chainId.toUpperCase()} Transaction Starting...`);
  console.log('From Private Key:', privateKey.slice(0, 6) + '...');
  console.log('To Address:', receiverAddress);
  console.log('Amount:', amount);
  console.log('Chain:', chainId);
  
  try {
    const result = await sendSimpleTransaction({
      privateKey,
      receiverAddress,
      amount,
      chainId,
    });
    
    if (result.success) {
      console.log(`✅ ${result.chainName} Transaction Success!`);
      console.log('Transaction Hash:', result.transactionHash);
      console.log('Block Number:', result.blockNumber);
      console.log('Gas Used:', result.gasUsed);
      console.log('Chain:', result.chainName);
      console.log('Currency:', result.currency);
      
      return {
        success: true,
        hash: result.transactionHash,
        chainName: result.chainName,
        currency: result.currency,
        message: `${result.chainName} transaction sent successfully!`
      };
    } else {
      console.log(`❌ ${result.chainName || 'Transaction'} Failed:`, result.error);
      
      return {
        success: false,
        error: result.error,
        chainName: result.chainName,
        currency: result.currency,
        message: `${result.chainName || 'Transaction'} failed!`
      };
    }
  } catch (error: any) {
    console.error(`💥 Demo ${chainId.toUpperCase()} Transaction Error:`, error);
    
    return {
      success: false,
      error: error.message,
      message: `Demo ${chainId} transaction encountered an error!`
    };
  }
}

/**
 * Quick balance check for any chain
 * @param address - Wallet address to check
 * @param chainId - Chain ID (defaults to 'sepolia')
 */
export async function checkBalance(address: string, chainId: string = 'sepolia') {
  try {
    const balance = await getBalance(address, chainId);
    console.log(`💰 ${chainId.toUpperCase()} Balance for ${address}: ${balance}`);
    return balance;
  } catch (error) {
    console.error(`Failed to check ${chainId} balance:`, error);
    return '0';
  }
}

// Legacy function for backward compatibility
export async function checkSepoliaBalance(address: string) {
  return checkBalance(address, 'sepolia');
}

// Example usage (commented out):
/*
// Example 1: Send 0.01 ETH on Sepolia
const result = await demoTransaction(
  'YOUR_PRIVATE_KEY_HERE',
  '0xRECEIVER_ADDRESS_HERE', 
  '0.01',
  'sepolia'
);

// Example 2: Check balance on Sepolia
const sepoliaBalance = await checkBalance('0xYOUR_ADDRESS_HERE', 'sepolia');

// Example 3: Get test tokens from faucet
// Sepolia: https://sepoliafaucet.com/
*/

