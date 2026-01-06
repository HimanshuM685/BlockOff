import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  MessageState,
  BleAdvertiser,
  broadcastOverBle,
  stopBleBroadcast,
  encodeMessageToChunks,
  decodeSingleChunk,
  listenOverBle,
} from "../utils/bleUtils";
import { ethers } from "ethers";
import {
  CONTRACT_CONFIG,
  CONTRACT_ABI,
  TransactionPayload,
} from "../constants/contracts";

// --- BLE Broadcast Tuning ---
const POST_BROADCAST_DELAY_MS = 180; // pause after each advertising send
const INTER_CHUNK_DELAY_MS = 50; // gap between chunk switches
const EMPTY_QUEUE_BACKOFF_MS = 150; // pause when queue temporarily empty
const MAX_BROADCAST_CYCLES = 6; // stop rebroadcasting after N full cycles

// --- Real Blockchain Transaction Submission ---
const submitTransactionToBlockchain = async (
  originalMessage: string
): Promise<string> => {
  try {
    console.log("🌐 Gateway device processing transaction payload...");

    // Parse the transaction payload
    let transactionPayload: TransactionPayload;
    try {
      transactionPayload = JSON.parse(originalMessage);
    } catch (parseError) {
      console.error("❌ Failed to parse transaction payload:", parseError);
      return JSON.stringify({
        success: false,
        error: "Invalid transaction payload format",
        timestamp: Date.now(),
      });
    }

    // Validate payload structure
    if (
      transactionPayload.type !== "TRANSFER_WITH_AUTHORIZATION" ||
      !transactionPayload.parameters ||
      !transactionPayload.contractAddress
    ) {
      console.error(
        "❌ Invalid transaction payload structure:",
        transactionPayload
      );
      return JSON.stringify({
        success: false,
        error: "Invalid transaction payload structure",
        timestamp: Date.now(),
      });
    }

    const { parameters, contractAddress } = transactionPayload;

    console.log("📝 Processing transferWithAuthorization:", {
      from: parameters.from,
      to: parameters.to,
      value: parameters.value,
      contractAddress,
    });

    // Set up the provider and relayer wallet (exactly like simpleSubmitTxnOnChain.ts)
    const provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.RPC_URL);
    const relayerWallet = new ethers.Wallet(
      CONTRACT_CONFIG.RELAYER_PRIVATE_KEY,
      provider
    );

    console.log(`🔗 Relayer Address: ${relayerWallet.address}`);

    // Check relayer balance
    const balance = await provider.getBalance(relayerWallet.address);
    console.log(
      `💰 Relayer Balance: ${ethers.formatEther(balance)} native tokens`
    );

    if (balance === BigInt(0)) {
      console.warn(
        "⚠️ Warning: Relayer wallet has no tokens. Transaction will likely fail."
      );
      return JSON.stringify({
        success: false,
        error: "Relayer wallet has insufficient balance",
        timestamp: Date.now(),
      });
    }

    // Create contract instance
    const tokenContract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      relayerWallet
    );

    console.log("📡 Submitting transaction to Flow EVM testnet...");
    console.log("--- Transaction Parameters ---");
    console.log("from:", parameters.from);
    console.log("to:", parameters.to);
    console.log("value:", parameters.value);
    console.log("validAfter:", parameters.validAfter);
    console.log("validBefore:", parameters.validBefore);
    console.log("nonce:", parameters.nonce);
    console.log("signature:", parameters.signature);
    console.log("signature length:", parameters.signature.length);

    // Call the contract function with the signed data (exactly like simpleSubmitTxnOnChain.ts)
    const tx = await tokenContract.transferWithAuthorization(
      parameters.from,
      parameters.to,
      parameters.value,
      parameters.validAfter,
      parameters.validBefore,
      parameters.nonce,
      parameters.signature
    );

    console.log(`⏳ Transaction sent! Waiting for confirmation...`);
    console.log(`Transaction Hash: ${tx.hash}`);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    console.log("✅ Transaction confirmed!");
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(
      `Flow EVM Explorer: https://evm-testnet.flowscan.io/tx/${tx.hash}`
    );

    // Return success response
    return JSON.stringify({
      success: true,
      transactionHash: tx.hash,
      explorerUrl: `https://evm-testnet.flowscan.io/tx/${tx.hash}`,
    });
  } catch (error: any) {
    console.error("❌ Blockchain transaction submission failed:", error);

    // Extract meaningful error message
    let errorMessage = "Unknown blockchain error";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.code) {
      errorMessage = `Error code: ${error.code}`;
    }

    console.log(errorMessage);

    return JSON.stringify({
      success: false,
    });
  }
};

interface BleContextType {
  // State
  isBroadcasting: boolean;
  hasInternet: boolean;
  masterState: Map<number, MessageState>;
  broadcastQueue: Map<number, Uint8Array[]>;

  // Actions
  broadcastMessage: (message: string) => Promise<void>;
  startBroadcasting: () => void;
  stopBroadcasting: () => void;
  clearAllAndStop: () => Promise<void>;

  // Utility functions
  getCurrentBroadcastInfo: () => { id?: number; text?: string };
  getProgressFor: (state: MessageState) => {
    received: number;
    total: number;
    percent: number;
  };

  // Force re-render trigger for UI updates
  forceUpdate: () => void;
}

const BleContext = createContext<BleContextType | undefined>(undefined);

interface BleProviderProps {
  children: ReactNode;
}

export const BleProvider: React.FC<BleProviderProps> = ({ children }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [, forceRerender] = useState(0);

  // Use NetInfo to get real network connectivity status
  const netInfo = useNetInfo();
  const hasInternet = netInfo.isConnected ?? false;

  // Refs for persistent state
  const managerRef = useRef<BleManager | null>(null);
  const masterStateRef = useRef<Map<number, MessageState>>(new Map());
  const broadcastQueueRef = useRef<Map<number, Uint8Array[]>>(new Map());
  const masterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const broadcastLoopRunningRef = useRef<boolean>(false);
  const broadcastCursorRef = useRef<{ queueIndex: number; chunkIndex: number }>(
    {
      queueIndex: 0,
      chunkIndex: 0,
    }
  );
  const stopScannerRef = useRef<(() => void) | null>(null);

  // Force update function for UI re-renders
  const forceUpdate = () => {
    forceRerender((n) => n + 1);
  };

  // Handle incoming BLE chunks
  const handleIncomingChunk = (chunk: Uint8Array) => {
    const decoded = decodeSingleChunk(chunk);
    if (!decoded) return;

    const { id, totalChunks, chunkNumber, isAck } = decoded;
    if (totalChunks < 1) {
      console.warn(
        "Dropping chunk with invalid totalChunks",
        totalChunks,
        "for message",
        id
      );
      return;
    }

    if (chunkNumber < 1 || chunkNumber > totalChunks) {
      console.warn(
        "Dropping chunk with out-of-range index",
        chunkNumber,
        "of",
        totalChunks,
        "for message",
        id
      );
      return;
    }
    const masterState = masterStateRef.current;
    let entry = masterState.get(id);

    if (entry && !entry.isAck && isAck) {
      // This is the first chunk of a response to our request.
      // Instead of deleting the state, we update it to receive the response.
      entry.isAck = true;
      entry.isComplete = false;
      entry.fullMessage = ""; // Clear the old request message text
      entry.chunks.clear(); // Clear the old request chunks
      entry.totalChunks = totalChunks; // Update with the new total for the response
    }

    if (!entry) {
      entry = {
        id,
        totalChunks,
        isComplete: false,
        isAck,
        chunks: new Map<number, Uint8Array>(),
        fullMessage: "",
      };
      masterState.set(id, entry);
    }

    if (entry.isComplete || entry.chunks.has(chunkNumber)) {
      return;
    }

    entry.chunks.set(chunkNumber, chunk);
    forceUpdate();

    if (entry.chunks.size === entry.totalChunks) {
      // Ensure every expected chunk index is present before attempting reassembly
      const orderedChunks: Uint8Array[] = [];
      for (let i = 1; i <= entry.totalChunks; i++) {
        const part = entry.chunks.get(i);
        if (!part) {
          console.warn(
            `Missing chunk ${i}/${entry.totalChunks} for message ${id}, skipping reassembly`
          );
          entry.isComplete = false;
          return;
        }
        orderedChunks.push(part);
      }

      entry.isComplete = true;

      // --- CORRECTED REASSEMBLY LOGIC ---
      const DATA_PER_CHUNK = 6;
      const fullBinary = new Uint8Array(entry.totalChunks * DATA_PER_CHUNK);
      let offset = 0;

      // This loop ensures chunks are placed in the correct order (1, 2, 3, ...),
      // regardless of the order they were received in.
      for (const part of orderedChunks) {
        const body = part.slice(3); // Remove header
        fullBinary.set(body, offset);
        offset += body.length;
      }

      const decoder = new TextDecoder();
      const fullMessage = decoder.decode(fullBinary).replace(/\0/g, ""); // Remove null padding
      entry.fullMessage = fullMessage;
      // --- END OF FIX ---

      forceUpdate();

      if (hasInternet && !entry.isAck) {
        handleApiResponse(id, fullMessage);
      } else if (!hasInternet) {
        // Mark as outgoing and initialize broadcast progress for rebroadcasted messages
        entry.isOutgoing = true;
        entry.broadcastProgress = 0;
        addToBroadcastQueue(id, orderedChunks);
      }
    }
  };

  // Handle API responses
  const handleApiResponse = async (id: number, messageText: string) => {
    try {
      const apiResponse = await submitTransactionToBlockchain(messageText);
      const ackChunks = encodeMessageToChunks(apiResponse, { id, isAck: true });

      const ackState: MessageState = {
        id,
        totalChunks: ackChunks.length,
        isComplete: false, // Don't mark as complete until broadcast
        isAck: true,
        chunks: new Map(), // Don't pre-populate chunks for outgoing ACK
        fullMessage: apiResponse,
        broadcastProgress: 0, // Start with 0 broadcast progress
        isOutgoing: true, // Mark as outgoing message
      };
      masterStateRef.current.set(id, ackState);
      forceUpdate();

      addToBroadcastQueue(id, ackChunks);
    } catch (err) {
      console.error("API handling error", err);
    }
  };

  // Add chunks to broadcast queue
  const addToBroadcastQueue = (id: number, chunks: Uint8Array[]) => {
    broadcastQueueRef.current.set(id, chunks);
    if (!masterIntervalRef.current) {
      startMasterBroadcastLoop();
    }
  };

  // Start the master broadcast loop
  const startMasterBroadcastLoop = () => {
    setIsBroadcasting(true);
    if (masterIntervalRef.current) clearInterval(masterIntervalRef.current);
    
    // Don't start if already running
    if (broadcastLoopRunningRef.current) {
      return;
    }

    broadcastCursorRef.current = { queueIndex: 0, chunkIndex: 0 };
    broadcastLoopRunningRef.current = true;

    // Proper async loop that awaits each broadcast
    const broadcastLoop = async () => {
      while (broadcastLoopRunningRef.current) {
        const entries = Array.from(broadcastQueueRef.current.entries());
        if (entries.length === 0) {
          stopMasterBroadcastLoop();
          return;
        }

        let { queueIndex, chunkIndex } = broadcastCursorRef.current;
        if (queueIndex >= entries.length) queueIndex = 0;

        const [currentId, chunksToBroadcast] = entries[queueIndex]!;
        if (!chunksToBroadcast || chunksToBroadcast.length === 0) {
          broadcastQueueRef.current.delete(currentId);
          broadcastCursorRef.current = { queueIndex: 0, chunkIndex: 0 };
          // Continue to next iteration
          await new Promise(resolve => setTimeout(resolve, EMPTY_QUEUE_BACKOFF_MS));
          continue;
        }

        if (chunkIndex >= chunksToBroadcast.length) chunkIndex = 0;

        try {
          // IMPORTANT: Await the broadcast to ensure it actually completes before moving on
          await broadcastOverBle(chunksToBroadcast[chunkIndex]);
          
          // Add a small delay after broadcast to ensure it has time to transmit
          // BLE advertising needs time for other devices to actually receive the data
          await new Promise(resolve => setTimeout(resolve, POST_BROADCAST_DELAY_MS));
          
          // Update broadcast progress for outgoing messages
          const state = masterStateRef.current.get(currentId);
          if (state && state.isOutgoing) {
            // Track progress: chunkIndex + 1 (since chunkIndex is 0-based)
            const currentChunkNumber = chunkIndex + 1;
            
            // Update progress to show we've broadcast up to this chunk
            if (!state.broadcastProgress || currentChunkNumber > state.broadcastProgress) {
              state.broadcastProgress = currentChunkNumber;
            }
            
            forceUpdate();
          }
        } catch (e) {
          console.error("broadcast error", e);
        }

        chunkIndex++;
        if (chunkIndex >= chunksToBroadcast.length) {
          // We've completed a full cycle through all chunks
          const state = masterStateRef.current.get(currentId);
          if (state && state.isOutgoing) {
            // Increment cycle count
            if (!state.broadcastCycles) {
              state.broadcastCycles = 0;
            }
            state.broadcastCycles = (state.broadcastCycles || 0) + 1;
            
            // Ensure progress is at 100% after first complete cycle
            state.broadcastProgress = chunksToBroadcast.length;
            
            // Don't mark as complete immediately - keep broadcasting for mesh propagation
            // BLE mesh needs multiple cycles for reliable propagation to nearby devices
            // Progress shows 100% after first cycle, but we continue broadcasting
            
            console.log(`📡 Completed broadcast cycle ${state.broadcastCycles} for message ${currentId}`);
            forceUpdate();

            // Stop rebroadcasting after the configured number of cycles to avoid endless loops
            if (state.broadcastCycles >= MAX_BROADCAST_CYCLES) {
              broadcastQueueRef.current.delete(currentId);
              state.isComplete = true;
              state.isOutgoing = false;
              broadcastCursorRef.current = { queueIndex: 0, chunkIndex: 0 };
              console.log(`✅ Stopped broadcast for message ${currentId} after ${state.broadcastCycles} cycles`);
            }
          }
          chunkIndex = 0;
          queueIndex++;
          if (queueIndex >= entries.length) queueIndex = 0;
        }

        broadcastCursorRef.current = { queueIndex, chunkIndex };
        
        // Small delay between chunks to prevent overwhelming BLE stack
        await new Promise(resolve => setTimeout(resolve, INTER_CHUNK_DELAY_MS));
      }
    };

    // Start the async loop
    broadcastLoop().catch(err => {
      console.error("Broadcast loop error:", err);
      stopMasterBroadcastLoop();
    });
  };

  // Stop the master broadcast loop
  const stopMasterBroadcastLoop = () => {
    broadcastLoopRunningRef.current = false;
    if (masterIntervalRef.current) {
      clearInterval(masterIntervalRef.current);
      masterIntervalRef.current = null;
    }
    stopBleBroadcast();
    setIsBroadcasting(false);
    broadcastCursorRef.current = { queueIndex: 0, chunkIndex: 0 };
    forceUpdate();
  };

  // Broadcast a new message
  const broadcastMessage = async (message: string) => {
    try {
      const chunks = encodeMessageToChunks(message, { isAck: false });
      const id = decodeSingleChunk(chunks[0])!.id;

      const newState: MessageState = {
        id,
        totalChunks: chunks.length,
        isComplete: false, // Don't mark as complete until all chunks are broadcast
        isAck: false,
        chunks: new Map(), // Don't pre-populate chunks for outgoing messages
        fullMessage: message,
        broadcastProgress: 0, // Start with 0 broadcast progress
        isOutgoing: true, // Mark as outgoing message
      };

      masterStateRef.current.set(id, newState);
      forceUpdate();
      addToBroadcastQueue(id, chunks);
    } catch (err) {
      throw err;
    }
  };

  // Get current broadcast info for UI
  const getCurrentBroadcastInfo = (): { id?: number; text?: string } => {
    const entries = Array.from(broadcastQueueRef.current.entries());
    if (entries.length === 0) return {};
    let idx = broadcastCursorRef.current.queueIndex;
    if (idx >= entries.length) idx = 0;
    const [id] = entries[idx];
    const state = masterStateRef.current.get(id);
    if (!state) {
      const chunks = entries[idx][1];
      try {
        const maybe = decodeSingleChunk(chunks[0]) as any;
        return {
          id,
          text: maybe?.decodedData?.slice(0, 120) ?? "Broadcasting...",
        };
      } catch {
        return { id, text: "Broadcasting..." };
      }
    }
    const maxLen = 60;
    const text =
      state.fullMessage.length > maxLen
        ? `${state.fullMessage.slice(0, maxLen)}...`
        : state.fullMessage;
    return { id: state.id, text };
  };

  // Get progress for a message state
  const getProgressFor = (state: MessageState) => {
    // For outgoing messages (messages we're broadcasting), use broadcast progress
    if (state.isOutgoing) {
      const broadcast = state.broadcastProgress || 0;
      const total = state.totalChunks || 1;
      const percent = Math.round((broadcast / total) * 100);
      return { received: broadcast, total, percent };
    }
    
    // For incoming messages (messages we're receiving), use received chunks
    const received = state.chunks.size;
    const total = state.totalChunks || 1;
    const percent = Math.round((received / total) * 100);
    return { received, total, percent };
  };

  // Clear everything and stop all operations
  const clearAllAndStop = async () => {
    // Stop all current operations
    if (stopScannerRef.current) {
      stopScannerRef.current();
      stopScannerRef.current = null;
    }
    if (masterIntervalRef.current) {
      clearInterval(masterIntervalRef.current);
      masterIntervalRef.current = null;
    }
    await stopBleBroadcast();

    // Destroy the BleManager instance to clear the native cache
    if (managerRef.current) {
      managerRef.current.destroy();
      managerRef.current = null;
    }

    // Clear all application-level state
    masterStateRef.current.clear();
    broadcastQueueRef.current.clear();
    setIsBroadcasting(false);
    broadcastCursorRef.current = { queueIndex: 0, chunkIndex: 0 };

    // Force a UI update to reflect the cleared state
    forceUpdate();

    // Re-initialize and restart the scanner after a short delay
    setTimeout(() => {
      try {
        // Create a new BleManager instance
        managerRef.current = new BleManager();
        // Start listening again
        stopScannerRef.current = listenOverBle(
          managerRef.current,
          handleIncomingChunk
        );
        console.log("BLE stack reset and scanner restarted.");
      } catch (e) {
        console.error("Failed to restart scanner after clear:", e);
      }
    }, 500);
  };

  // Initialize BLE on mount
  useEffect(() => {
    managerRef.current = new BleManager();
    if (Platform.OS === "android") {
      try {
        if (BleAdvertiser && (BleAdvertiser as any).setCompanyId) {
          (BleAdvertiser as any).setCompanyId(0xffff);
        } else {
          console.warn("⚠️ BLE advertiser not available (native module missing?)");
        }
      } catch (e) {
        console.error("BLE advertiser init error:", e);
      }
    }

    // Start listening for BLE messages - this runs continuously in the background
    stopScannerRef.current = listenOverBle(
      managerRef.current,
      handleIncomingChunk
    );

    return () => {
      try {
        stopScannerRef.current?.();
      } catch {}
      stopScannerRef.current = null;

      if (masterIntervalRef.current) {
        clearInterval(masterIntervalRef.current);
        masterIntervalRef.current = null;
      }
      try {
        managerRef.current?.destroy();
      } catch {}
      managerRef.current = null;
    };
  }, []);

  const contextValue: BleContextType = {
    // State
    isBroadcasting,
    hasInternet,
    masterState: masterStateRef.current,
    broadcastQueue: broadcastQueueRef.current,

    // Actions
    broadcastMessage,
    startBroadcasting: startMasterBroadcastLoop,
    stopBroadcasting: stopMasterBroadcastLoop,
    clearAllAndStop,

    // Utility functions
    getCurrentBroadcastInfo,
    getProgressFor,
    forceUpdate,
  };

  return (
    <BleContext.Provider value={contextValue}>{children}</BleContext.Provider>
  );
};

// Hook to use the BLE context
export const useBle = (): BleContextType => {
  const context = useContext(BleContext);
  if (context === undefined) {
    throw new Error("useBle must be used within a BleProvider");
  }
  return context;
};