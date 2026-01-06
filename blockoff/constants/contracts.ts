// Contract configuration constants
export const CONTRACT_CONFIG = {
  RPC_URL: "https://sepolia.drpc.org",
  CONTRACT_ADDRESS: "0x0CC56d4c3dECc6736A1b75053e47208199323a02",
  RELAYER_PRIVATE_KEY:
    "0x0dc44ac53ddd8cc746d9aaf38b0a790036d3b7ff50c94eab857c9361b1897282",
};

// Contract ABI for transferWithAuthorization function
export const CONTRACT_ABI = [
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

// Transaction payload structure for mesh network broadcasting
export interface TransactionPayload {
  type: "TRANSFER_WITH_AUTHORIZATION";
  contractAddress: string;
  functionName: string;
  parameters: {
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
    signature: string;
  };
}
