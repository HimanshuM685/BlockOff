import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import {
  Text,
  TextInput,
  Button,
  Card,
  Surface,
  Chip,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useWallet } from '@/contexts/walletContext';
import {
  sendSimpleTransaction,
  getBalance,
  isValidAddress,
  getCurrentGasPrice,
  TESTNET_INFO,
  SimpleTransactionResult
} from '@/lib/sepolia/simpleTransaction';

export default function SimpleTransactionScreen() {
  const { walletData } = useWallet();
  const theme = useTheme();

  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastTransaction, setLastTransaction] = useState<SimpleTransactionResult | null>(null);

  // Load balance and gas price
  const loadWalletInfo = async () => {
    if (!walletData?.address) return;

    try {
      setIsLoading(true);

      // Get balance
      const bal = await getBalance(walletData.address, 'sepolia');
      setBalance(bal);

      // Get gas price
      const gas = await getCurrentGasPrice('sepolia');
      setGasPrice(gas);

    } catch (error) {
      console.error('Failed to load wallet info:', error);
      Alert.alert('Error', 'Failed to load wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  // Send transaction
  const handleSendTransaction = async () => {
    if (!walletData?.privateKey) {
      Alert.alert('Error', 'No wallet found. Please create a wallet first.');
      return;
    }

    if (!receiverAddress || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidAddress(receiverAddress)) {
      Alert.alert('Error', 'Invalid receiver address');
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      setIsLoading(true);

      Alert.alert(
        'Confirm Transaction',
        `Send ${amount} BOFF to ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            onPress: async () => {
              const result = await sendSimpleTransaction({
                privateKey: walletData.privateKey,
                receiverAddress,
                amount,
                chainId: 'sepolia', // Default to Sepolia chain
              });

              setLastTransaction(result);

              if (result.success) {
                Alert.alert(
                  'Transaction Sent! 🎉',
                  `Transaction Hash: ${result.transactionHash}\n\nYou can view it on Etherscan`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setReceiverAddress('');
                        setAmount('');
                        loadWalletInfo(); // Refresh balance
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Transaction Failed', result.error || 'Unknown error occurred');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (walletData?.address) {
      loadWalletInfo();
    }
  }, [walletData]);

  if (!walletData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
            No wallet found. Please create a wallet first.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0B0D' }]}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBadgeRow}>
            <Text variant="labelLarge" style={styles.headerBadge}>BOFF • Sepolia</Text>
            <Text variant="labelMedium" style={styles.headerHint}>Secure BLE Mesh Relay</Text>
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            💸 Simple Transaction
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Broadcast offline, relay online — keep funds moving.
          </Text>
        </View>

        {/* Wallet Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>Your Wallet</Text>

            <View style={styles.infoSection}>
              <Text variant="labelMedium" style={styles.label}>Address:</Text>
              <Surface style={styles.addressSurface} elevation={1}>
                <Text variant="bodyMedium" style={styles.address}>
                  {walletData.address.slice(0, 6)}...{walletData.address.slice(-4)}
                </Text>
              </Surface>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.balanceSection}>
              <View style={styles.balancePill}>
                <Text variant="labelMedium" style={styles.balanceLabel}>Balance</Text>
                <Text variant="headlineSmall" style={styles.balanceText}>
                  {balance} BOFF
                </Text>
              </View>
              <View style={styles.balanceMetaRow}>
                <Chip mode="outlined" style={styles.networkChip}>
                  {TESTNET_INFO.name}
                </Chip>
                <Chip mode="outlined" style={styles.gasChip}>
                  Gas: {gasPrice} Gwei
                </Chip>
                <Button
                  mode="outlined"
                  onPress={loadWalletInfo}
                  disabled={isLoading}
                  loading={isLoading}
                  compact
                  style={styles.refreshButton}
                >
                  Refresh
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Transaction Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>Send Transaction</Text>

            <View style={styles.formGroup}>
              <Text variant="labelMedium" style={styles.label}>Receiver Address</Text>
              <TextInput
                mode="outlined"
                value={receiverAddress}
                onChangeText={setReceiverAddress}
                placeholder="0x..."
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text variant="labelMedium" style={styles.label}>Amount (BOFF)</Text>
              <TextInput
                mode="outlined"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.01"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSendTransaction}
              disabled={isLoading}
              loading={isLoading}
              style={styles.sendButton}
              contentStyle={styles.sendButtonContent}
            >
              Send Transaction
            </Button>
          </Card.Content>
        </Card>

        {/* Last Transaction Result */}
        {lastTransaction && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Last Transaction</Text>

              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  lastTransaction.success ? styles.statusSuccess : styles.statusError
                ]}
                textStyle={styles.statusText}
              >
                {lastTransaction.success ? '✅ Success' : '❌ Failed'}
              </Chip>

              {lastTransaction.success ? (
                <View style={styles.successDetails}>
                  <View style={styles.detailRow}>
                    <Text variant="labelMedium" style={styles.detailLabel}>Transaction Hash:</Text>
                    <Surface style={styles.detailSurface} elevation={1}>
                      <Text variant="bodySmall" style={styles.detailValue}>
                        {lastTransaction.transactionHash?.slice(0, 10)}...{lastTransaction.transactionHash?.slice(-8)}
                      </Text>
                    </Surface>
                  </View>

                  {lastTransaction.blockNumber && (
                    <View style={styles.detailRow}>
                      <Text variant="labelMedium" style={styles.detailLabel}>Block Number:</Text>
                      <Chip mode="outlined">{lastTransaction.blockNumber}</Chip>
                    </View>
                  )}

                  {lastTransaction.gasUsed && (
                    <View style={styles.detailRow}>
                      <Text variant="labelMedium" style={styles.detailLabel}>Gas Used:</Text>
                      <Chip mode="outlined">{lastTransaction.gasUsed}</Chip>
                    </View>
                  )}
                </View>
              ) : (
                <Surface style={styles.errorSurface} elevation={1}>
                  <Text variant="bodyMedium" style={styles.errorMessage}>{lastTransaction.error}</Text>
                </Surface>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Testnet Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>ℹ️ Testnet Information</Text>
            <View style={styles.infoList}>
              <Text variant="bodyMedium" style={styles.infoText}>• Network: {TESTNET_INFO.name}</Text>
              <Text variant="bodyMedium" style={styles.infoText}>• Currency: {TESTNET_INFO.currency}</Text>
              <Text variant="bodyMedium" style={styles.infoText}>• Get test funds: {TESTNET_INFO.faucet}</Text>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0D',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    paddingVertical: Math.min(SCREEN_WIDTH * 0.05, 20),
    paddingHorizontal: Math.min(SCREEN_WIDTH * 0.05, 20),
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    marginHorizontal: Math.min(SCREEN_WIDTH * 0.04, 16),
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  headerBadgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBadge: {
    backgroundColor: '#0000FF',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    letterSpacing: 1,
    fontWeight: '800',
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  headerHint: {
    color: '#B1B7C3',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  title: {
    marginBottom: 6,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: 'left',
    color: '#B1B7C3',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: Math.min(SCREEN_WIDTH * 0.04, 16),
    marginBottom: 20,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    backgroundColor: '#0A0B0D',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  cardTitle: {
    marginBottom: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#B1B7C3',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  addressSurface: {
    padding: 16,
    borderRadius: 0,
    backgroundColor: '#32353D',
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  address: {
    fontFamily: 'monospace',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#0000FF',
    height: 2,
  },
  balanceSection: {
    gap: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    marginBottom: 4,
    color: '#B1B7C3',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  balanceText: {
    marginBottom: 12,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 32,
    letterSpacing: 1,
  },
  balancePill: {
    width: '100%',
    padding: 20,
    borderRadius: 0,
    backgroundColor: '#0000FF',
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  balanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  networkChip: {
    alignSelf: 'center',
    backgroundColor: '#32353D',
    borderColor: '#0000FF',
    borderWidth: 2,
  },
  gasChip: {
    alignSelf: 'center',
    backgroundColor: '#32353D',
    borderColor: '#0000FF',
    borderWidth: 2,
  },
  refreshButton: {
    marginLeft: 'auto',
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginBottom: 4,
    color: '#B1B7C3',
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    marginTop: 8,
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  sendButton: {
    marginTop: 24,
    borderRadius: 0,
    backgroundColor: '#0000FF',
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  sendButtonContent: {
    paddingVertical: 12,
    fontWeight: '900',
  },
  statusChip: {
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  statusSuccess: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  statusError: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  statusText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    flex: 1,
    textTransform: 'uppercase',
    color: '#B1B7C3',
    fontWeight: '700',
    fontSize: 12,
  },
  detailSurface: {
    padding: 12,
    borderRadius: 0,
    flex: 2,
    marginLeft: 12,
    backgroundColor: '#32353D',
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  detailValue: {
    fontFamily: 'monospace',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorSurface: {
    padding: 16,
    borderRadius: 0,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  errorMessage: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  infoList: {
    gap: 8,
  },
});
