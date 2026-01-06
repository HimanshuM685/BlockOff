import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");
const SEPOLIA_CHAIN_ID = 11155111;

// Apply EIP-55 checksum to an address
const applyEthereumChecksum = (address: string): string => {
  try {
    const addressLower = address.toLowerCase().replace("0x", "");
    const hash = CryptoJS.SHA3(addressLower, { outputLength: 256 }).toString(
      CryptoJS.enc.Hex
    );

    let checksumAddress = "0x";
    for (let i = 0; i < addressLower.length; i++) {
      checksumAddress +=
        parseInt(hash[i], 16) >= 8
          ? addressLower[i].toUpperCase()
          : addressLower[i];
    }

    return checksumAddress;
  } catch (error) {
    console.error("Error applying checksum:", error);
    return address;
  }
};

// Derive an Ethereum address from a public key
const generateEthereumAddress = (publicKeyHex: string): string => {
  try {
    const cleanPublicKey = publicKeyHex.startsWith("04")
      ? publicKeyHex.slice(2)
      : publicKeyHex;

    const publicKeyWords = CryptoJS.enc.Hex.parse(cleanPublicKey);
    const hash = CryptoJS.SHA3(publicKeyWords, { outputLength: 256 });
    const addressHex = hash.toString(CryptoJS.enc.Hex).slice(-40);

    return applyEthereumChecksum(`0x${addressHex}`);
  } catch (error) {
    console.error("Error generating Ethereum address:", error);
    throw new Error("Failed to generate Ethereum address");
  }
};

// Generate a new wallet (not used in main flow, kept for parity with other scripts)
const generateRealWallet = (): {
  address: string;
  privateKey: string;
  publicKey: string;
} => {
  try {
    const keyPair = ec.genKeyPair();
    const privateKeyHex = keyPair.getPrivate("hex").padStart(64, "0");
    const publicKeyHex = keyPair.getPublic("hex");

    return {
      address: generateEthereumAddress(publicKeyHex),
      privateKey: `0x${privateKeyHex}`,
      publicKey: `0x${publicKeyHex}`,
    };
  } catch (error) {
    console.error("Error generating wallet:", error);
    throw new Error("Failed to generate cryptographic wallet");
  }
};

(async () => {
  // --- 1. Setup (Sepolia) ---
  const ownerKey = process.env.SEPOLIA_OWNER_PRIVATE_KEY;
  const toAddress = process.env.SEPOLIA_TO_ADDRESS;
  const tokenContractAddress = process.env.SEPOLIA_TOKEN_CONTRACT_ADDRESS;
  const transferAmount = process.env.SEPOLIA_TRANSFER_AMOUNT ?? "1";

  if (!ownerKey) throw new Error("Missing SEPOLIA_OWNER_PRIVATE_KEY");
  if (!toAddress) throw new Error("Missing SEPOLIA_TO_ADDRESS");
  if (!tokenContractAddress)
    throw new Error("Missing SEPOLIA_TOKEN_CONTRACT_ADDRESS");

  const wallet = new ethers.Wallet(ownerKey);
  const fromAddress = wallet.address;

  const now = Math.floor(Date.now() / 1000);
  const transferValue = {
    from: fromAddress,
    to: toAddress,
    value: ethers.parseUnits(transferAmount, 18),
    validAfter: 0n,
    validBefore: BigInt(now + 3600), // 1 hour window
    nonce: ethers.randomBytes(32),
  };

  // --- 2. Message hash (matches on-chain getMessageHash) ---
  const messageHash = ethers.solidityPackedKeccak256(
    [
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
      "address",
      "uint256",
    ],
    [
      transferValue.from,
      transferValue.to,
      transferValue.value,
      transferValue.validAfter,
      transferValue.validBefore,
      transferValue.nonce,
      tokenContractAddress,
      SEPOLIA_CHAIN_ID,
    ]
  );

  // --- 3. Sign ---
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));
  const splitSignature = ethers.Signature.from(signature);

  // --- 4. Output ---
  console.log("--- Transaction Parameters ---");
  console.log("from:        ", transferValue.from);
  console.log("to:          ", transferValue.to);
  console.log("value:       ", transferValue.value.toString());
  console.log("validAfter:  ", transferValue.validAfter.toString());
  console.log("validBefore: ", transferValue.validBefore.toString());
  console.log("nonce:       ", ethers.hexlify(transferValue.nonce));
  console.log("messageHash: ", messageHash);
  console.log("signature:   ", signature);

  console.log("\n--- Signature Components ---");
  console.log("v:", splitSignature.v);
  console.log("r:", splitSignature.r);
  console.log("s:", splitSignature.s);

  console.log("\n--- JSON for submitTxnOnChain.ts ---");
  console.log(
    JSON.stringify(
      {
        from: transferValue.from,
        to: transferValue.to,
        value: transferValue.value.toString(),
        validAfter: transferValue.validAfter.toString(),
        validBefore: transferValue.validBefore.toString(),
        nonce: ethers.hexlify(transferValue.nonce),
        signature,
      },
      null,
      2
    )
  );

  // --- 5. Verification ---
  const recreatedHash = ethers.solidityPackedKeccak256(
    [
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
      "address",
      "uint256",
    ],
    [
      transferValue.from,
      transferValue.to,
      transferValue.value,
      transferValue.validAfter,
      transferValue.validBefore,
      transferValue.nonce,
      tokenContractAddress,
      SEPOLIA_CHAIN_ID,
    ]
  );
  const recoveredSigner = ethers.verifyMessage(
    ethers.getBytes(messageHash),
    signature
  );
  console.log("\nHashes match:", messageHash === recreatedHash);
  console.log("Recovered signer:", recoveredSigner);
  console.log(
    "Signature valid:",
    recoveredSigner.toLowerCase() === fromAddress.toLowerCase()
  );
})();
