import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '@/constants/theme';
import { useWallet } from '@/contexts/walletContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Show(): React.JSX.Element {
  const {
    userWalletAddress,
    isLoggedIn,
    walletData,
    tokenBalance,
    isLoadingBalance,
    getTokenBalance,
  } = useWallet();
  const [customAddress, setCustomAddress] = useState<string>('');
  
  // Use user's wallet address if logged in, otherwise use custom address
  const displayAddress = userWalletAddress || customAddress || '0x742d35Cc6634C0532925a3b8D404d0C8b7b8E5c2';

  const generateRandomAddress = () => {
    // Generate a mock Web3 wallet address for demonstration
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const newAddress = '0x' + Array.from({ length: 40 }, () => randomHex()).join('');
    setCustomAddress(newAddress);
  };

  const copyPrivateKey = () => {
    if (!isLoggedIn || !walletData?.privateKey) {
      Alert.alert('Error', 'No private key available. Please create a wallet first.');
      return;
    }

    // In a real app, you would use a clipboard library like @react-native-clipboard/clipboard
    // For now, we'll show an alert with the private key
    Alert.alert(
      'Private Key',
      `Your private key:\n\n${walletData.privateKey}\n\n⚠️ Keep this private key secure and never share it with anyone!`,
      [
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            // Here you would implement actual clipboard functionality
            Alert.alert('Copied', 'Private key copied to clipboard');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const qrSize = Math.min(SCREEN_WIDTH * 0.6, 250);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Wallet Address QR Code</Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={displayAddress}
            size={qrSize}
            color="black"
            backgroundColor="white"
          />
        </View>

      {/* Wallet Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isLoggedIn ? "Wallet Connected" : "No Wallet"}
        </Text>
        {walletData && (
          <Text style={styles.createdText}>
            Created: {walletData.createdAt.toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Last Known Block Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Last Known Block Balance</Text>
          <TouchableOpacity
            onPress={getTokenBalance}
            disabled={isLoadingBalance || !userWalletAddress}
            style={[
              styles.refreshButton,
              (!userWalletAddress || isLoadingBalance) && styles.refreshButtonDisabled,
            ]}
          >
            {isLoadingBalance ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.refreshText}>Refresh</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>
            {tokenBalance !== null ? `${tokenBalance} BOFF` : '—'}
          </Text>
        </View>
        <Text style={styles.balanceSubtext}>
          Cached from last successful on-chain fetch
        </Text>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>
          {isLoggedIn ? "Your Wallet Address:" : "Custom Address:"}
        </Text>
        {isLoggedIn ? (
          <Text style={styles.walletAddressText}>{userWalletAddress}</Text>
        ) : (
          <TextInput
            style={styles.addressInput}
            value={customAddress}
            onChangeText={setCustomAddress}
            placeholder="Enter custom wallet address"
            placeholderTextColor={Colors.light.icon}
            multiline
          />
        )}
      </View>

      {!isLoggedIn && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.generateButton} onPress={generateRandomAddress}>
            <Text style={styles.buttonText}>Generate Random Address</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Copy Private Key Button - Only show when logged in */}
      {isLoggedIn && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.copyPrivateKeyButton} onPress={copyPrivateKey}>
            <Text style={styles.copyButtonText}>Export Private Key</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0B0D',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0B0D',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: Math.min(SCREEN_WIDTH * 0.08, 32),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 30,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  qrContainer: {
    padding: Math.min(SCREEN_WIDTH * 0.06, 24),
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    marginBottom: 30,
    alignSelf: 'center',
  },
  addressContainer: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 30,
    alignSelf: 'center',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B1B7C3',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressInput: {
    borderWidth: 3,
    borderColor: '#0000FF',
    borderRadius: 0,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#32353D',
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#0000FF',
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  createdText: {
    fontSize: 14,
    color: '#B1B7C3',
    fontWeight: '600',
  },
  balanceCard: {
    width: '100%',
    maxWidth: 500,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B1B7C3',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#8C93A3',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0000FF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletAddressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
    backgroundColor: '#32353D',
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#0000FF',
    minHeight: 80,
    textAlignVertical: 'top',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 16,
    alignSelf: 'center',
  },
  generateButton: {
    backgroundColor: '#0000FF',
    paddingHorizontal: Math.min(SCREEN_WIDTH * 0.08, 32),
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  copyPrivateKeyButton: {
    backgroundColor: '#0000FF',
    paddingHorizontal: Math.min(SCREEN_WIDTH * 0.08, 32),
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    width: '100%',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
