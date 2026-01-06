import { Platform, PermissionsAndroid } from 'react-native';
import { Camera } from 'expo-camera';

export interface PermissionStatus {
  camera: boolean;
  bluetooth: boolean;
  allGranted: boolean;
}

const isAndroid = Platform.OS === 'android';
const androidVersion = Platform.Version as number;

/**
 * Get required Bluetooth permissions based on Android version
 */
const getBluetoothPermissions = (): string[] => {
  if (!isAndroid) return [];

  if (androidVersion >= 31) {
    // Android 12+
    return [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ];
  }

  // Android 11 and below
  return [
    (PermissionsAndroid.PERMISSIONS as any).BLUETOOTH,
    (PermissionsAndroid.PERMISSIONS as any).BLUETOOTH_ADMIN,
  ];
};

/**
 * Request Bluetooth permissions (Android only)
 * Shows native permission dialogs directly
 */
export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (!isAndroid) {
    // iOS handles Bluetooth permissions automatically
    return true;
  }

  try {
    const permissions = getBluetoothPermissions();
    const results = await PermissionsAndroid.requestMultiple(permissions as any);

    return Object.values(results).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.error('Error requesting Bluetooth permissions:', error);
    return false;
  }
};

/**
 * Check current permission status without requesting
 */
export const checkPermissionStatus = async (): Promise<PermissionStatus> => {
  const status: PermissionStatus = {
    camera: false,
    bluetooth: false,
    allGranted: false,
  };

  try {
    // Camera permission
    const cameraPermission = await Camera.getCameraPermissionsAsync();
    status.camera = cameraPermission.granted;

    // Bluetooth permission
    if (isAndroid) {
      status.bluetooth = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
    } else {
      status.bluetooth = true;
    }

    status.allGranted = status.camera && status.bluetooth;
    return status;
  } catch (error) {
    console.error('Error checking permission status:', error);
    return status;
  }
};
