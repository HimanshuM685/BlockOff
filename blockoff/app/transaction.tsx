import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import {
  Text,
  TextInput,
  Button,
  Card,
  Surface,
  Modal,
  Portal,
  List,
  Divider,
  Chip,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useWallet } from '@/contexts/walletContext';
import {
  CHAINS,
  DEFAULT_CHAIN,
  Chain,
} from '@/constants/assets';
import { TransactionLoader } from '@/components/TransactionLoader';

export default function TransactionPage(): React.JSX.Element {
  const { toAddress } = useLocalSearchParams<{ toAddress: string }>();
  const { userWalletAddress, isLoggedIn } = useWallet();
  const theme = useTheme();

  // Transaction state
  const [amount, setAmount] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<Chain>(DEFAULT_CHAIN);

  // Modal states
  const [showChainModal, setShowChainModal] = useState(false);
  const [showTransactionLoader, setShowTransactionLoader] = useState(false);

  const handleSubmitTransaction = async () => {
    if (!isLoggedIn || !userWalletAddress) {
      Alert.alert('Error', 'Please create a wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!toAddress) {
      Alert.alert('Error', 'Recipient address is required');
      return;
    }

    // Show the transaction loader with mesh network flow
    setShowTransactionLoader(true);
  };

  const generateOfflineTransactionHash = (): string => {
    // Generate a realistic-looking transaction hash for offline display
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleTransactionComplete = (fullMessage?: string) => {
    setShowTransactionLoader(false);

    // Use the response message as transaction hash if available, otherwise generate one
    let txHash: string;
    if (fullMessage) {
      // If we received a response, try to extract transaction hash from it
      try {
        const response = JSON.parse(fullMessage);
        txHash =
          response.transactionHash ||
          response.hash ||
          generateOfflineTransactionHash();
      } catch {
        // If parsing fails, use the full message as hash or generate one
        txHash =
          fullMessage.length > 10
            ? fullMessage
            : generateOfflineTransactionHash();
      }
    } else {
      txHash = generateOfflineTransactionHash();
    }

    const timestamp = Date.now().toString();

    // Navigate to success page with transaction details
    router.replace({
      pathname: '/transaction-success',
      params: {
        amount,
        currency: selectedChain.symbol, // Use chain symbol as currency
        toAddress: toAddress || '',
        fromAddress: userWalletAddress || '',
        chain: selectedChain.name,
        txHash,
        timestamp,
        fullMessage: fullMessage || '', // Pass the full response message
      },
    });
  };

  const handleTransactionCancel = () => {
    setShowTransactionLoader(false);
    Alert.alert(
      'Transaction Cancelled',
      'Your transaction has been cancelled.'
    );
  };


  const renderChainItem = ({ item }: { item: Chain }) => (
    <List.Item
      title={item.name}
      description={item.symbol}
      left={() => (
        <View style={styles.imageContainer}>
          <Image source={item.imageUrl} style={styles.chainImage} />
        </View>
      )}
      right={() =>
        selectedChain.id === item.id ? <List.Icon icon="check" /> : null
      }
      onPress={() => {
        setSelectedChain(item);
        setShowChainModal(false);
      }}
      style={styles.modalListItem}
      titleStyle={styles.modalItemTitle}
      descriptionStyle={styles.modalItemDescription}
    />
  );

  // Show loader if transaction is being processed
  if (showTransactionLoader) {
    return (
      <TransactionLoader
        onComplete={handleTransactionComplete}
        onCancel={handleTransactionCancel}
        transactionData={{
          amount,
          currency: selectedChain.symbol,
          toAddress: toAddress || '',
          chain: selectedChain.name,
          chainId: selectedChain.chainId,
        }}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#0A0B0D' }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: '#0f172a' }]}
        >
          Send BOFF Transaction
        </Text>

        {/* From Address */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              From (Your Wallet)
            </Text>
            <Surface style={styles.addressSurface} elevation={1}>
              <Text variant="bodyMedium" style={styles.addressText}>
                {userWalletAddress
                  ? `${userWalletAddress.slice(
                      0,
                      6
                    )}...${userWalletAddress.slice(-4)}`
                  : 'No wallet connected'}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* To Address */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              To (Recipient)
            </Text>
            <Surface style={styles.addressSurface} elevation={1}>
              <Text variant="bodyMedium" style={styles.addressText}>
                {toAddress
                  ? `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`
                  : 'No address'}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Chain Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              Network
            </Text>
            <List.Item
              title={selectedChain.name}
              description={selectedChain.symbol}
              left={() => (
                <View style={styles.imageContainer}>
                  <Image
                    source={selectedChain.imageUrl}
                    style={styles.chainImage}
                  />
                </View>
              )}
              right={() => <List.Icon icon="chevron-down" />}
              onPress={() => setShowChainModal(true)}
              style={styles.selectorItem}
            />
          </Card.Content>
        </Card>


        {/* Amount Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              Amount
            </Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                mode="outlined"
                right={<TextInput.Affix text={selectedChain.symbol} />}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmitTransaction}
          disabled={!isLoggedIn || !amount || showTransactionLoader}
          loading={showTransactionLoader}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {showTransactionLoader ? 'Processing...' : 'Send Transaction'}
        </Button>

        {/* Cancel Button */}
        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>


      {/* Chain Selection Modal */}
      <Portal>
        <Modal
          visible={showChainModal}
          onDismiss={() => setShowChainModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalSurface}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge">Select Network</Text>
              <Button onPress={() => setShowChainModal(false)} mode="text">
                Close
              </Button>
            </View>
            <Divider />
            <FlatList
              data={CHAINS}
              renderItem={renderChainItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => null}
            />
          </Surface>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0D',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: Math.min(SCREEN_WIDTH * 0.04, 16),
    gap: 14,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    textAlign: 'left',
    marginBottom: 12,
    marginTop: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#0f172a',
  },
  addressSurface: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  addressText: {
    fontFamily: 'monospace',
    color: '#0f172a',
  },
  selectorItem: {
    paddingHorizontal: 0,
  },
  amountContainer: {
    marginTop: 8,
  },
  amountInput: {
    fontSize: 18,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  memoInput: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  submitButtonContent: {
    paddingVertical: 10,
  },
  cancelButton: {
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  modalContainer: {
    margin: 20,
    maxHeight: '80%',
  },
  modalSurface: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#1e293b',
    elevation: 10,
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e293b',
  },
  modalList: {
    maxHeight: 400,
    paddingVertical: 8,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 4,
  },
  chainImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  modalListItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0b1222',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    color: '#e2e8f0',
  },
  modalItemDescription: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
