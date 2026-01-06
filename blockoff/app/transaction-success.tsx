import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import {
  Text,
  Button,
  Card,
  Surface,
  Divider,
  Chip,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useBle } from '@/contexts/bleContext';

export default function TransactionSuccessPage(): React.JSX.Element {
  const theme = useTheme();
  const { stopBroadcasting } = useBle();
  const {
    amount,
    currency,
    toAddress,
    fromAddress,
    chain,
    txHash,
    timestamp,
    fullMessage,
  } = useLocalSearchParams<{
    amount: string;
    currency: string;
    toAddress: string;
    fromAddress: string;
    chain: string;
    txHash: string;
    timestamp: string;
    fullMessage?: string;
  }>();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleNewTransaction = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    stopBroadcasting();
  }, []);

  // Generate signature string from transaction hash (simplified for demo)
  const generateSignatureString = (hash: string): string => {
    if (!hash) return 'Generating signature...';
    // This would normally be the actual signature from the transaction
    return `0x${hash.slice(2, 34)}...${hash.slice(-32)}`;
  };


  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: '#0A0B0D' }]}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Text style={styles.successIcon}>✅</Text>
          <Text
            variant="headlineMedium"
            style={[styles.successTitle, { color: theme.colors.onBackground }]}
          >
            Transaction Sent!
          </Text>
        </View>

        {/* QR Code Section - MOST IMPORTANT */}
        <Card style={styles.qrCard} elevation={4}>
          <Card.Content style={styles.qrContent}>
            <Text variant="titleLarge" style={styles.qrTitle}>
              Transaction QR Code
            </Text>
            <View style={styles.qrContainer}>
              {txHash ? (
                <QRCode
                  value={txHash}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Text>Generating QR...</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Transaction Hash - SECOND MOST IMPORTANT */}
        <Card style={styles.hashCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.hashTitle}>
              Transaction Hash
            </Text>
            <Surface style={styles.hashSurface} elevation={1}>
              <Text variant="bodyMedium" style={styles.hashText} selectable>
                {txHash || 'Generating hash...'}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Hash Signature - THIRD MOST IMPORTANT */}
        <Card style={styles.signatureCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.signatureTitle}>
              Hash Signature
            </Text>
            <Surface style={styles.signatureSurface} elevation={1}>
              <Text
                variant="bodyMedium"
                style={styles.signatureText}
                selectable
              >
                {generateSignatureString(txHash || '')}
              </Text>
            </Surface>
          </Card.Content>
        </Card>

        {/* Full Message Response - Show if available */}
        {fullMessage && (
          <Card style={styles.responseCard} elevation={2}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.responseTitle}>
                Network Response
              </Text>
              <Surface style={styles.responseSurface} elevation={1}>
                <ScrollView style={styles.responseScroll} nestedScrollEnabled>
                  <Text
                    variant="bodySmall"
                    style={styles.responseText}
                    selectable
                  >
                    {fullMessage}
                  </Text>
                </ScrollView>
              </Surface>
            </Card.Content>
          </Card>
        )}

        {/* Primary Action - GO HOME BUTTON */}
        <Button
          mode="contained"
          onPress={handleGoHome}
          style={styles.homeButton}
          contentStyle={styles.homeButtonContent}
        >
          Go to Home
        </Button>

        {/* Additional Details - Less Important */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.detailsTitle}>
              Transaction Details
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="labelMedium" style={styles.detailLabel}>
                Amount
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {amount} {currency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="labelMedium" style={styles.detailLabel}>
                Network
              </Text>
              <Chip mode="outlined" style={styles.chainChip}>
                {chain}
              </Chip>
            </View>

            <View style={styles.detailRow}>
              <Text variant="labelMedium" style={styles.detailLabel}>
                To Address
              </Text>
              <Text variant="bodySmall" style={styles.addressText}>
                {toAddress
                  ? `${toAddress.slice(0, 8)}...${toAddress.slice(-8)}`
                  : 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="labelMedium" style={styles.detailLabel}>
                Time
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {timestamp
                  ? new Date(parseInt(timestamp)).toLocaleString()
                  : 'Just now'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Secondary Action */}
        <Button
          mode="outlined"
          onPress={handleNewTransaction}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
        >
          Send Another Transaction
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0D',
  },
  content: {
    padding: Math.min(SCREEN_WIDTH * 0.05, 20),
    paddingBottom: 40,
    flexGrow: 1,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  // Success Header
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
    padding: 24,
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // QR Code - MOST IMPORTANT
  qrCard: {
    marginBottom: 24,
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  qrContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  qrTitle: {
    fontWeight: '900',
    marginBottom: 24,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#0000FF',
  },

  // Transaction Hash - SECOND MOST IMPORTANT
  hashCard: {
    marginBottom: 20,
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  hashTitle: {
    fontWeight: '800',
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hashSurface: {
    padding: 20,
    borderRadius: 0,
    backgroundColor: '#32353D',
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  hashText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Hash Signature - THIRD MOST IMPORTANT
  signatureCard: {
    marginBottom: 24,
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  signatureTitle: {
    fontWeight: '800',
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  signatureSurface: {
    padding: 20,
    borderRadius: 0,
    backgroundColor: '#32353D',
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  signatureText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Network Response Card
  responseCard: {
    marginBottom: 20,
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  responseTitle: {
    fontWeight: '800',
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  responseSurface: {
    padding: 16,
    borderRadius: 0,
    backgroundColor: '#32353D',
    maxHeight: 150,
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  responseScroll: {
    maxHeight: 120,
  },
  responseText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
    fontWeight: '600',
  },

  // Primary Home Button - FOURTH MOST IMPORTANT
  homeButton: {
    marginBottom: 32,
    backgroundColor: '#0000FF',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  homeButtonContent: {
    paddingVertical: 16,
  },

  // Additional Details - Less Important
  detailsCard: {
    marginBottom: 20,
    backgroundColor: '#0A0B0D',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  detailsTitle: {
    fontWeight: '800',
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    marginBottom: 20,
    backgroundColor: '#0000FF',
    height: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  detailLabel: {
    textTransform: 'uppercase',
    color: '#B1B7C3',
    flex: 1,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
    fontSize: 16,
  },
  chainChip: {
    backgroundColor: '#0000FF',
    borderColor: '#0000FF',
    borderWidth: 2,
  },
  addressText: {
    fontFamily: 'monospace',
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },

  // Secondary Button
  secondaryButton: {
    marginBottom: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#0000FF',
  },
  buttonContent: {
    paddingVertical: 12,
  },
});
