export interface AdvertisingOptions {
  advertiseMode?: number;
  txPowerLevel?: number;
  connectable?: boolean;
  includeDeviceName?: boolean;
  includeTxPowerLevel?: boolean;
}

export interface AdvertisingState {
  isAdvertising: boolean;
  isSupported: boolean;
  advertisingData?: any;
}

export interface BleAdvertiser {
  advertise(payload: any): Promise<boolean>;
  broadcast(serviceUuid: string, payload: Uint8Array, options?: AdvertisingOptions): Promise<boolean>;
  broadcastManufacturerData(companyId: number, payload: Uint8Array, options?: AdvertisingOptions): Promise<boolean>;
  stopBroadcast(): Promise<boolean>;
  stop(): Promise<boolean>;
  isSupported(): Promise<boolean>;
  getState(): Promise<AdvertisingState>;
  requestPermission(): Promise<string>;
  initialize(): Promise<boolean>;
  getMockState(): { isAdvertising: boolean; advertisingData?: any };
  
  // Constants
  ADVERTISE_MODE_LOW_LATENCY: number;
  ADVERTISE_TX_POWER_HIGH: number;
  setCompanyId?(companyId: number): void;
}

declare const BleAdvertiser: BleAdvertiser;
export default BleAdvertiser;
