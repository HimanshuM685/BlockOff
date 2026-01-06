import base64 from 'react-native-base64';
import { BleManager, ScanMode } from 'react-native-ble-plx';
import RNAdvertiser from 'react-native-ble-advertiser';

// -----------------------------------------------------------------------------
// BLE Advertiser (real native module only; no mock fallback)
// -----------------------------------------------------------------------------
export const BleAdvertiser = RNAdvertiser;

// -----------------------------------------------------------------------------
// Constants & Types
// -----------------------------------------------------------------------------
export const MESH_SERVICE_UUID = 'f1d0c001-c9e5-4d6c-96ff-7f73f4f99c15';

export type MessageState = {
  id: number;
  totalChunks: number;
  isComplete: boolean;
  isAck: boolean;
  chunks: Map<number, Uint8Array>;
  fullMessage: string;
  // Track broadcast progress for outgoing messages (messages we're sending)
  broadcastProgress?: number; // Number of chunks that have been broadcast
  isOutgoing?: boolean; // True if this is a message we're broadcasting (not receiving)
  broadcastCycles?: number; // Number of complete cycles through all chunks (for mesh propagation)
};

// -----------------------------------------------------------------------------
// BLE Broadcasting
// -----------------------------------------------------------------------------
const stopAdvertiserSafely = async (): Promise<void> => {
  try {
    await (BleAdvertiser as any)?.stopBroadcast?.();
  } catch (err) {
    console.warn('⚠️ Failed to stop BLE broadcast', err);
  }
};

export const broadcastOverBle = async (chunk: Uint8Array): Promise<void> => {
  if (!BleAdvertiser) {
    throw new Error('❌ BLE advertiser not available (native module missing)');
  }
  const payload = Array.from(chunk);
  
  console.log('📡 broadcastOverBle called with chunk:', {
    chunkLength: chunk.length,
    payloadPreview: payload.slice(0, 10),
    payloadHex: payload.slice(0, 10).map(b => b.toString(16).padStart(2, '0')).join('')
  });

  await stopAdvertiserSafely();

  try {
    console.log('📡 Attempting service data broadcast...');
    await (BleAdvertiser as any).broadcast?.(MESH_SERVICE_UUID, payload, {
      connectable: false,
      includeDeviceName: false,
      includeTxPowerLevel: false,
      advertiseMode: (BleAdvertiser as any).ADVERTISE_MODE_LOW_LATENCY,
      txPowerLevel: (BleAdvertiser as any).ADVERTISE_TX_POWER_HIGH,
    });
    console.log('✅ Service data broadcast successful');
  } catch (serviceError) {
    console.warn(
      '⚠️ Service data broadcast failed, trying manufacturer data:',
      serviceError
    );

    try {
      console.log('📡 Attempting manufacturer data broadcast...');
      await (BleAdvertiser as any).broadcastManufacturerData?.(
        0xffff,
        payload,
        {
          connectable: false,
          includeDeviceName: false,
          includeTxPowerLevel: false,
        }
      );
      console.log('✅ Manufacturer data broadcast successful');
    } catch (manuErr) {
      console.error('❌ Manufacturer broadcast also failed:', manuErr);
      throw manuErr;
    }
  }
};

export const stopBleBroadcast = async (): Promise<void> => {
  await stopAdvertiserSafely();
};

// -----------------------------------------------------------------------------
// Data Conversion
// -----------------------------------------------------------------------------
export const base64ToUint8Array = (b64: string): Uint8Array => {
  const decoded = base64.decode(b64);
  return Uint8Array.from(decoded, c => c.charCodeAt(0));
};

// -----------------------------------------------------------------------------
// Protocol Encoding / Decoding
// -----------------------------------------------------------------------------
const HEADER_SIZE = 3;
const DATA_PER_CHUNK = 6;
const MAX_PAYLOAD_SIZE = HEADER_SIZE + DATA_PER_CHUNK;

const generateMessageId = (): number => {
  const idArray = new Uint8Array(1);

  if (typeof crypto !== 'undefined' && (crypto as any).getRandomValues) {
    (crypto as any).getRandomValues(idArray);
  } else {
    idArray[0] = Math.floor(Math.random() * 256);
  }

  return idArray[0];
};

export const encodeMessageToChunks = (
  message: string,
  options: { id?: number; isAck?: boolean } = {}
): Uint8Array[] => {
  const encoder = new TextEncoder();
  const binary = encoder.encode(message);

  const totalChunks = Math.ceil(binary.length / DATA_PER_CHUNK) || 1;
  if (totalChunks > 127) {
    throw new Error('Message is too large and exceeds the 127 chunk limit.');
  }

  const id = options.id ?? generateMessageId();
  const isAck = options.isAck || false;

  const chunks: Uint8Array[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const chunkNumber = i + 1;
    const payload = new Uint8Array(MAX_PAYLOAD_SIZE);
    const view = new DataView(payload.buffer);

    view.setUint8(0, id);
    view.setUint8(1, totalChunks);

    let chunkByte = chunkNumber & 0b01111111;
    if (isAck) {
      chunkByte |= 0b10000000;
    }
    view.setUint8(2, chunkByte);

    const start = i * DATA_PER_CHUNK;
    const slice = binary.slice(start, start + DATA_PER_CHUNK);
    payload.set(slice, HEADER_SIZE);

    chunks.push(payload);
  }

  return chunks;
};

export const decodeSingleChunk = (
  chunk: Uint8Array
):
  | (MessageState & {
    chunkNumber: number;
    data: Uint8Array;
    decodedData: string;
  })
  | null => {
  if (!chunk || chunk.length < HEADER_SIZE) return null;

  const view = new DataView(chunk.buffer);
  const id = view.getUint8(0);
  const totalChunks = view.getUint8(1);

  const chunkByte = view.getUint8(2);
  const isAck = (chunkByte & 0b10000000) !== 0;
  const chunkNumber = chunkByte & 0b01111111;

  const data = chunk.slice(HEADER_SIZE);

  const decoder = new TextDecoder();
  const nullIndex = data.indexOf(0);
  const cleanData = nullIndex === -1 ? data : data.slice(0, nullIndex);
  const decodedData = decoder.decode(cleanData);

  return {
    id,
    totalChunks,
    isComplete: false,
    isAck,
    chunks: new Map<number, Uint8Array>(),
    fullMessage: '',
    chunkNumber,
    data,
    decodedData,
  } as any;
};

// -----------------------------------------------------------------------------
// BLE Listening
// -----------------------------------------------------------------------------
export const listenOverBle = (
  bleManager: BleManager | null,
  onChunkReceived: (chunk: Uint8Array) => void
): (() => void) => {
  if (!bleManager) {
    console.error('BLE Manager not initialized');
    return () => { };
  }

  bleManager.startDeviceScan(
    null,
    {
      allowDuplicates: true,
      scanMode: ScanMode.LowLatency,
    },
    (error, device) => {
      if (error) {
        console.error('BLE Scan Error:', error.message);
        return;
      }
      if (!device) return;

      const serviceDataB64 = (device as any).serviceData?.[MESH_SERVICE_UUID];
      const manufacturerDataB64 = (device as any).manufacturerData;

      let chunk: Uint8Array | null = null;

      if (serviceDataB64) {
        try {
          chunk = base64ToUint8Array(serviceDataB64);
        } catch (e) {
          console.error('Error decoding service data:', e);
        }
      } else if (manufacturerDataB64) {
        try {
          const fullChunk = base64ToUint8Array(manufacturerDataB64);
          if (
            fullChunk.length > 2 &&
            fullChunk[0] === 255 &&
            fullChunk[1] === 255
          ) {
            chunk = fullChunk.slice(2);
          }
        } catch (e) {
          console.error('Error decoding manufacturer data:', e);
        }
      }

      if (chunk) {
        onChunkReceived(chunk);
      }
    }
  );

  return () => {
    try {
      bleManager.stopDeviceScan();
    } catch {
      /* ignore */
    }
    console.log('BLE Scan stopped (stop function called).');
  };
};
