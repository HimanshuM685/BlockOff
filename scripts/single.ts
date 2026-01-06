// @ts-nocheck

import { ethers } from "ethers";
import readline from "readline";

// --- Configuration (Sepolia, generic ERC-20) ---
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL ?? "https://sepolia.drpc.org";
const TOKEN_CONTRACT_ADDRESS = process.env.SEPOLIA_TOKEN_CONTRACT_ADDRESS ?? "";
const RECIPIENT_ADDRESS = process.env.SEPOLIA_TO_ADDRESS ?? ""; // The address receiving the tokens
const TOKEN_NAME = process.env.SEPOLIA_TOKEN_NAME ?? "YourToken";
const TOKEN_VERSION = process.env.SEPOLIA_TOKEN_VERSION ?? "1";
const TRANSFER_AMOUNT = process.env.SEPOLIA_TRANSFER_AMOUNT ?? "1";
const CHAIN_ID = 11155111; // Sepolia

const RELAYER_PRIVATE_KEY = process.env.SEPOLIA_RELAYER_PRIVATE_KEY ?? "";

if (!TOKEN_CONTRACT_ADDRESS) throw new Error("Set SEPOLIA_TOKEN_CONTRACT_ADDRESS");
if (!RECIPIENT_ADDRESS) throw new Error("Set SEPOLIA_TO_ADDRESS");
if (!RELAYER_PRIVATE_KEY) throw new Error("Set SEPOLIA_RELAYER_PRIVATE_KEY");

const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "validAfter", type: "uint256" },
      { internalType: "uint256", name: "validBefore", type: "uint256" },
      { internalType: "bytes32", name: "nonce", type: "bytes32" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

(async () => {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

  try {
    // --- STEP 1: GENERATE THE USER'S WALLET (who owns the tokens) ---
    console.log("🔐 Part 1: Generating the User's Wallet (Signer)");
    const userWallet = ethers.Wallet.createRandom();
    console.log(`   -> User's Address: ${userWallet.address}`);
    console.log("\nACTION REQUIRED:");
    console.log(
      `Please send at least ${TRANSFER_AMOUNT} ${TOKEN_NAME} to the address above on Sepolia.`
    );
    await askQuestion("Press ENTER after the account has been funded...");

    // --- DIAGNOSTIC STEP: VERIFY BALANCE ---
    const readOnlyContract = new ethers.Contract(
      TOKEN_CONTRACT_ADDRESS,
      contractABI,
      provider
    );
    const decimals = await readOnlyContract.decimals();
    const balance = await readOnlyContract.balanceOf(userWallet.address);
    console.log(`   -> Verified Balance: ${ethers.formatUnits(balance, decimals)} ${TOKEN_NAME}`);

    if (balance === 0n) {
      console.error(
        "   -> ❌ ERROR: The user wallet has not been funded with tokens. Please send tokens and restart the script."
      );
      rl.close();
      return;
    }

    // --- STEP 2: CREATE THE OFFLINE SIGNATURE ---
    console.log("\n✍️ Part 2: Creating the Offline Signature");
    const domain = {
      name: TOKEN_NAME,
      version: TOKEN_VERSION,
      chainId: CHAIN_ID,
      verifyingContract: TOKEN_CONTRACT_ADDRESS,
    };

    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const validBefore = Math.floor(Date.now() / 1000) + 86400;

    const transferValue = {
      from: userWallet.address,
      to: RECIPIENT_ADDRESS,
      value: ethers.parseUnits(TRANSFER_AMOUNT, decimals).toString(),
      validAfter: "0",
      validBefore: validBefore.toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };

    // ** THE FIX IS HERE **
    // Manually construct the EIP-712 digest to ensure exact compliance.
    const digest = ethers.TypedDataEncoder.hash(domain, types, transferValue);
    // Sign the raw digest.
    const signature = userWallet.signingKey.sign(digest);

    console.log("   -> Signature generated successfully using manual digest!");

    // --- STEP 3: SUBMIT THE TRANSACTION AS A RELAYER ---
    console.log("\n🚀 Part 3: Submitting Transaction as Relayer");

    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

    console.log(`   -> Relayer Address: ${relayerWallet.address}`);
    const relayerEthBalance = await provider.getBalance(relayerWallet.address);
    console.log(
      `   -> Relayer Balance: ${ethers.formatEther(relayerEthBalance)} Sepolia ETH`
    );

    const tokenContract = new ethers.Contract(
      TOKEN_CONTRACT_ADDRESS,
      contractABI,
      relayerWallet
    );

    console.log("\n📡 Sending transaction to the network...");
    const tx = await tokenContract.transferWithAuthorization(
      transferValue.from,
      transferValue.to,
      transferValue.value,
      transferValue.validAfter,
      transferValue.validBefore,
      transferValue.nonce,
      signature.v,
      signature.r,
      signature.s,
      {
        gasLimit: 200000,
      }
    );

    console.log(`   -> Transaction sent! Hash: ${tx.hash}`);
    console.log("   -> Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("\n✅ Transaction Confirmed!");
    console.log(
      `   -> View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`
    );
  } catch (error) {
    const errorReason = error.reason || error.message;
    console.error("\n❌ An error occurred:", errorReason);
    if (error.data) {
      console.error("   -> Error Data:", error.data);
    }
  } finally {
    rl.close();
  }
})();
