import { ethers } from "ethers";

// --- Configuration (Sepolia) ---
// Provide these via environment variables for safety.
const RPC_URL =
  process.env.SEPOLIA_RPC_URL ?? "https://sepolia.infura.io/v3/YOUR_KEY";
const CONTRACT_ADDRESS = process.env.SEPOLIA_TOKEN_CONTRACT_ADDRESS ?? "";
const RELAYER_PRIVATE_KEY = process.env.SEPOLIA_RELAYER_PRIVATE_KEY ?? "";

// --- Contract ABI ---
const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "validAfter", type: "uint256" },
      { internalType: "uint256", name: "validBefore", type: "uint256" },
      { internalType: "bytes32", name: "nonce", type: "bytes32" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// --- Pre-signed Transaction Data ---
// Paste the JSON produced by scripts/sepolia/1_transferWithAuthorization.ts
// Example (replace with fresh values):
const signedTxData = {
  from: "0x", // owner address that signed
  to: "0x", // recipient
  value: "0", // stringified uint256
  validAfter: "0",
  validBefore: "0",
  nonce: "0x", // 32-byte hex
  signature: "0x", // signature bytes from signMessage
};

(async () => {
  try {
    console.log("🚀 Starting Sepolia relayer script...");

    if (!RPC_URL || RPC_URL.includes("YOUR_KEY")) {
      throw new Error("Set SEPOLIA_RPC_URL to a valid HTTPS endpoint");
    }
    if (!CONTRACT_ADDRESS) {
      throw new Error("Set SEPOLIA_TOKEN_CONTRACT_ADDRESS");
    }
    if (!RELAYER_PRIVATE_KEY || RELAYER_PRIVATE_KEY.length < 10) {
      throw new Error("Set SEPOLIA_RELAYER_PRIVATE_KEY");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
    console.log(`\nRelayer Address: ${relayerWallet.address}`);
    const balance = await provider.getBalance(relayerWallet.address);
    console.log(`Relayer Balance: ${ethers.formatEther(balance)} ETH`);
    if (balance === 0n) {
      console.warn("⚠️ Warning: relayer has no ETH; tx will fail");
    }

    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      relayerWallet
    );

    console.log("\n📡 Submitting transaction to Sepolia...");

    console.log("\n--- Transaction Parameters ---");
    console.log("from:", signedTxData.from);
    console.log("to:", signedTxData.to);
    console.log("value:", signedTxData.value);
    console.log("validAfter:", signedTxData.validAfter);
    console.log("validBefore:", signedTxData.validBefore);
    console.log("nonce:", signedTxData.nonce);
    console.log("signature:", signedTxData.signature);
    console.log("signature length:", signedTxData.signature.length);

    const tx = await tokenContract.transferWithAuthorization(
      signedTxData.from,
      signedTxData.to,
      signedTxData.value,
      signedTxData.validAfter,
      signedTxData.validBefore,
      signedTxData.nonce,
      signedTxData.signature
    );

    console.log("⏳ Transaction sent! Waiting for confirmation...");
    console.log(`Transaction Hash: ${tx.hash}`);

    const receipt = await tx.wait();

    console.log("\n✅ Transaction confirmed!");
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log("\nView on Sepolia Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${tx.hash}`);
  } catch (error: unknown) {
    console.error("\n❌ An error occurred:", error);
  }
})();
