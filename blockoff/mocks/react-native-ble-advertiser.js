// Mock implementation of react-native-ble-advertiser to avoid build issues
// This provides the same interface but simulates BLE advertising for testing

// Mock state to simulate advertising
let isAdvertisingState = false;
let advertisingData = null;

const BleAdvertiser = {
  // Legacy method
  advertise: async (payload) => {
    console.log('Mock BLE advertising (legacy):', payload);
    isAdvertisingState = true;
    advertisingData = payload;
    return Promise.resolve(true);
  },
  
  // New methods used by bleUtils.ts
  broadcast: async (serviceUuid, payload, options) => {
    console.log('Mock BLE broadcast service data:', {
      serviceUuid,
      payloadLength: payload?.length || 0,
      payload: Array.isArray(payload) ? payload.slice(0, 10) : payload, // Show first 10 bytes
      options
    });
    isAdvertisingState = true;
    advertisingData = { type: 'service', serviceUuid, payload, options };
    
    // Simulate broadcasting delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return Promise.resolve(true);
  },
  
  broadcastManufacturerData: async (companyId, payload, options) => {
    console.log('Mock BLE broadcast manufacturer data:', {
      companyId: `0x${companyId.toString(16)}`,
      payloadLength: payload?.length || 0,
      payload: Array.isArray(payload) ? payload.slice(0, 10) : payload, // Show first 10 bytes
      options
    });
    isAdvertisingState = true;
    advertisingData = { type: 'manufacturer', companyId, payload, options };
    
    // Simulate broadcasting delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return Promise.resolve(true);
  },
  
  stopBroadcast: async () => {
    console.log('Mock BLE stop broadcasting');
    isAdvertisingState = false;
    advertisingData = null;
    return Promise.resolve(true);
  },
  
  stop: async () => {
    console.log('Mock BLE stop advertising (legacy)');
    isAdvertisingState = false;
    advertisingData = null;
    return Promise.resolve(true);
  },
  
  isSupported: async () => {
    return Promise.resolve(true);
  },
  
  getState: async () => {
    return Promise.resolve({ 
      isAdvertising: isAdvertisingState, 
      isSupported: true,
      advertisingData
    });
  },
  
  // Add any other methods that might be called
  requestPermission: async () => {
    return Promise.resolve('granted');
  },
  
  initialize: async () => {
    return Promise.resolve(true);
  },
  
  // Constants used by bleUtils.ts
  ADVERTISE_MODE_LOW_LATENCY: 1,
  ADVERTISE_TX_POWER_HIGH: 3,
};

// Add debug method to check current state
BleAdvertiser.getMockState = () => ({
  isAdvertising: isAdvertisingState,
  advertisingData
});

export default BleAdvertiser;
