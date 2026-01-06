import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  Surface,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { router } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { useWallet, WalletData } from '@/contexts/walletContext';
import {
  NeoBrutalButton,
  NeoBrutalCard,
  NeoBrutalHeader,
  NeoBrutalBadge,
  NeoBrutalDivider
} from '@/components/NeoBrutalismComponents';
import { NeoBrutalismColors } from '@/constants/neoBrutalism';
import { requestBluetoothPermissions } from '@/utils/permissions';

export default function WelcomePage(): React.JSX.Element {
  const { isLoggedIn, createWallet, importWallet, tokenBalance, isLoadingBalance } = useWallet();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isImportingWallet, setIsImportingWallet] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Check if user already has a wallet and redirect to tabs
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  // Callback function that gets triggered after wallet is successfully created
  const onWalletCreated = async (walletData: WalletData): Promise<void> => {
    try {
      console.log('🚀 Wallet creation callback triggered for address:', walletData.address);

      // TODO: Callback for wallet creation

    } catch (error) {
      console.error('❌ Error in wallet creation callback:', error);
      // Don't throw - let wallet creation succeed even if API calls fail
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsCreatingWallet(true);

      console.log('🔐 Starting wallet creation with permission requests...');

      // 1. Request Camera Permission - Native dialog
      console.log('📷 Step 1: Requesting camera permission...');
      let cameraResult;
      try {
        cameraResult = await Promise.race([
          requestCameraPermission(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Camera permission timeout')), 10000)
          )
        ]) as any;
        console.log('✅ Camera permission result:', cameraResult?.status || 'unknown');
      } catch (cameraError) {
        console.warn('⚠️ Camera permission request failed or timed out:', cameraError);
        // Continue anyway
      }

      // 2. Request Bluetooth Permissions - Native dialogs
      console.log('📶 Step 2: Requesting Bluetooth permissions...');
      let bluetoothGranted = false;
      try {
        bluetoothGranted = await Promise.race([
          requestBluetoothPermissions(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Bluetooth permission timeout')), 10000)
          )
        ]) as boolean;
        console.log('✅ Bluetooth permission result:', bluetoothGranted);
      } catch (bluetoothError) {
        console.warn('⚠️ Bluetooth permission request failed or timed out:', bluetoothError);
        // Continue anyway - BLE is optional
      }

      console.log('📋 Permission Summary:', {
        camera: cameraResult?.status === 'granted' ? '✅' : '❌',
        bluetooth: bluetoothGranted ? '✅' : '❌',
      });

      // Create wallet regardless of permission results
      // App will work with limited functionality if permissions denied
      console.log('🔐 Step 3: Creating wallet...');
      const walletData = await Promise.race([
        createWallet(onWalletCreated),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Wallet creation timeout after 30 seconds')), 30000)
        )
      ]);

      console.log('✅ Wallet created successfully:', walletData?.address);
      console.log('🚀 Step 4: Navigating to app...');

      // Navigate to main app
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error('❌ Error creating wallet:', error);
      console.error('Error details:', error?.message, error?.stack);

      Alert.alert(
        'Error',
        error?.message?.includes('timeout')
          ? 'Wallet creation is taking too long. Please try again.'
          : 'Failed to create wallet. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      setIsImportingWallet(true);
      console.log('🔐 Starting wallet import...');

      // Validate private key format
      if (!privateKeyInput.trim()) {
        Alert.alert('Error', 'Please enter a private key');
        return;
      }

      // Clean and validate private key
      let cleanPrivateKey = privateKeyInput.trim();
      if (!cleanPrivateKey.startsWith('0x')) {
        cleanPrivateKey = '0x' + cleanPrivateKey;
      }

      // Import wallet
      const walletData = await importWallet(cleanPrivateKey);
      console.log('✅ Wallet imported successfully:', walletData.address);

      // Close dialog and navigate
      setShowImportDialog(false);
      setPrivateKeyInput('');
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error('❌ Error importing wallet:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to import wallet. Please check your private key and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsImportingWallet(false);
    }
  };

  const currentBgColor = isDarkTheme ? NeoBrutalismColors.background : '#FFFFFF';
  const currentTextColor = isDarkTheme ? NeoBrutalismColors.textPrimary : '#000000';
  const currentSurfaceColor = isDarkTheme ? NeoBrutalismColors.surface : '#F1F3F4';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentBgColor }]}>
      {/* Theme Toggle Button */}
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity
          style={[
            styles.themeToggleButton,
            {
              backgroundColor: currentSurfaceColor,
              borderColor: NeoBrutalismColors.primary,
            }
          ]}
          onPress={() => setIsDarkTheme(!isDarkTheme)}
        >
          <Text style={[styles.themeToggleText, { color: currentTextColor }]}>
            {isDarkTheme ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[
            styles.logoContainer,
            {
              backgroundColor: currentSurfaceColor,
              borderColor: NeoBrutalismColors.primary,
            }
          ]}>
            <Text style={styles.logoIcon}>💎</Text>
          </View>
          <Text style={[styles.appName, { color: currentTextColor }]}>BlockOff</Text>
        </View>

        {/* Create Wallet Button */}
        <View style={styles.buttonSection}>
          <NeoBrutalButton
            title={isCreatingWallet ? "Creating Wallet..." : "Create Wallet"}
            onPress={handleCreateWallet}
            variant="primary"
            size="large"
            disabled={isCreatingWallet}
            style={styles.createButton}
          />

          <NeoBrutalButton
            title="Import Wallet"
            onPress={() => setShowImportDialog(true)}
            variant="secondary"
            size="large"
            disabled={isCreatingWallet || isImportingWallet}
            style={styles.importButton}
          />

          {isCreatingWallet && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={NeoBrutalismColors.primary} />
            </View>
          )}
        </View>

        {/* Balance Display */}
        {tokenBalance !== null && (
          <View style={[
            styles.balanceCard,
            {
              backgroundColor: currentSurfaceColor,
              borderColor: NeoBrutalismColors.primary,
            }
          ]}>
            <Text style={[styles.balanceLabel, { color: currentTextColor }]}>
              BlockOff Token Balance
            </Text>
            <View style={styles.balanceRow}>
              {isLoadingBalance ? (
                <ActivityIndicator size="small" color={NeoBrutalismColors.primary} />
              ) : (
                <>
                  <Text style={[styles.balanceAmount, { color: currentTextColor }]}>
                    {parseFloat(tokenBalance).toFixed(4)}
                  </Text>
                  <Text style={[styles.balanceSymbol, { color: currentTextColor }]}>
                    BOFF
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Import Wallet Dialog */}
      {showImportDialog && (
        <View style={styles.dialogOverlay}>
          <View style={[
            styles.dialogContainer,
            {
              backgroundColor: currentSurfaceColor,
              borderColor: NeoBrutalismColors.primary,
            }
          ]}>
            <Text style={[styles.dialogTitle, { color: currentTextColor }]}>
              Import Existing Wallet
            </Text>
            <Text style={[styles.dialogSubtitle, { color: currentTextColor }]}>
              Enter your private key to import your wallet
            </Text>
            
            <TextInput
              style={[
                styles.privateKeyInput,
                {
                  backgroundColor: isDarkTheme ? '#2A2A2A' : '#F8F9FA',
                  borderColor: NeoBrutalismColors.primary,
                  color: currentTextColor,
                }
              ]}
              placeholder="0x..."
              placeholderTextColor={isDarkTheme ? '#999' : '#666'}
              value={privateKeyInput}
              onChangeText={setPrivateKeyInput}
              multiline
              numberOfLines={3}
              secureTextEntry={true}
            />

            <View style={styles.dialogButtons}>
              <NeoBrutalButton
                title="Cancel"
                onPress={() => {
                  setShowImportDialog(false);
                  setPrivateKeyInput('');
                }}
                variant="secondary"
                size="medium"
                style={styles.dialogButton}
              />
              <NeoBrutalButton
                title={isImportingWallet ? "Importing..." : "Import"}
                onPress={handleImportWallet}
                variant="primary"
                size="medium"
                disabled={isImportingWallet || !privateKeyInput.trim()}
                style={styles.dialogButton}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Theme Toggle
  themeToggleContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  themeToggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: NeoBrutalismColors.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  themeToggleText: {
    fontSize: 24,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: NeoBrutalismColors.primary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    ...Platform.select({
      web: {
        textShadow: `2px 2px 0px ${NeoBrutalismColors.primary}`,
      },
      default: {
        textShadowColor: NeoBrutalismColors.primary,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
      },
    }),
  },

  // Button Section
  buttonSection: {
    alignItems: 'center',
    width: '100%',
  },
  createButton: {
    minWidth: 280,
    marginBottom: 16,
  },
  importButton: {
    minWidth: 280,
    marginBottom: 16,
  },
  loadingIndicator: {
    marginTop: 16,
  },

  // Balance Card
  balanceCard: {
    width: '100%',
    maxWidth: 320,
    padding: 20,
    borderRadius: 16,
    borderWidth: 4,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: NeoBrutalismColors.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '900',
    marginRight: 8,
  },
  balanceSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Import Dialog
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    borderWidth: 4,
    alignItems: 'center',
    shadowColor: NeoBrutalismColors.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  privateKeyInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
  },
});
