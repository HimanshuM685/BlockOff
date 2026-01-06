import React, { useState } from 'react';
import { Alert, View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import {
  Provider as PaperProvider,
  DefaultTheme,
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Badge,
  Surface,
  ProgressBar,
  Icon,
  IconButton,
} from 'react-native-paper';
import { useBle } from '@/contexts/bleContext';
import { MessageState } from '@/utils/bleUtils';

// --- Theme ---
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#FF5722',
  },
};

const MeshScreen = () => {
  const [message, setMessage] = useState('');

  // Use the global BLE context
  const {
    isBroadcasting,
    hasInternet,
    masterState,
    broadcastMessage,
    startBroadcasting,
    stopBroadcasting,
    clearAllAndStop,
    getCurrentBroadcastInfo,
    getProgressFor,
  } = useBle();

  const handleStartUserBroadcast = async () => {
    try {
      await broadcastMessage(message);
      setMessage('');
    } catch (err) {
      Alert.alert(
        'Error',
        (err as Error).message || 'Failed to encode message'
      );
    }
  };

  // Clear everything & stop (single button)
  const handleClearEverythingAndStop = () => {
    if (masterState.size === 0 && !isBroadcasting) {
      return;
    }

    Alert.alert(
      'Clear Everything & Stop',
      'This will clear received messages, clear the broadcast queue, and stop broadcasting. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all & stop',
          style: 'destructive',
          onPress: clearAllAndStop,
        },
      ]
    );
  };

  const renderReceivedMessageCard = (state: MessageState) => {
    const progress = getProgressFor(state);
    return (
      <Card key={`msg-${state.id}`} style={[styles.messageCard]}>
        <Card.Content>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title style={[styles.messageTitle, { textAlign: 'left' }]}>
              {state.isAck ? 'Response' : 'Request'}
            </Title>
          </View>

          <Paragraph numberOfLines={3} style={{ color: '#B1B7C3', fontWeight: '600' }}>
            {state.fullMessage ||
              (state.isComplete ? '(Decoded)' : '(Incomplete)')}
          </Paragraph>

          <View style={{ marginTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{`Chunks: ${progress.received}/${progress.total}`}</Text>
              <View style={{ flex: 1 }} />
              <Text style={{ color: '#0000FF', fontWeight: '800', fontSize: 16 }}>{`${progress.percent}%`}</Text>
            </View>
            <ProgressBar
              progress={progress.percent / 100}
              style={{ height: 12, borderRadius: 0 }}
              color="#0000FF"
            />
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}
            >
              {Array.from({ length: state.totalChunks }, (_, i) => {
                const idx = i + 1;
                // For outgoing messages, check broadcast progress; for incoming, check received chunks
                const have = state.isOutgoing
                  ? (state.broadcastProgress || 0) >= idx
                  : state.chunks.has(idx);
                return (
                  <Badge
                    key={idx}
                    style={[
                      styles.chunkBadge,
                      have ? styles.chunkHave : styles.chunkMissing,
                    ]}
                  >
                    {idx}
                  </Badge>
                );
              })}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const allMessages = Array.from(masterState.values()).sort(
    (a, b) => b.id - a.id
  );
  const currentBroadcast = getCurrentBroadcastInfo();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Surface style={styles.broadcasterSection} elevation={2}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title style={styles.sectionTitle}>Mesh Node</Title>
            <View style={styles.internetStatusContainer}>
              <Icon
                source={hasInternet ? 'wifi' : 'bluetooth'}
                size={24}
                color={hasInternet ? '#4CAF50' : '#2196F3'}
              />
              <Text
                style={{
                  marginLeft: 8,
                  color: hasInternet ? '#34C759' : '#0000FF',
                  fontWeight: '800',
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {hasInternet ? 'Online' : 'BLE Mesh'}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginVertical: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#B1B7C3', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Currently broadcasting:
              </Text>
              <Paragraph style={{ fontWeight: '800', marginTop: 4, color: '#FFFFFF', fontSize: 16 }}>
                {isBroadcasting && currentBroadcast.text
                  ? `🔊 ${currentBroadcast.text}`
                  : '— not broadcasting —'}
              </Paragraph>
            </View>
            <IconButton
              mode="outlined"
              onPress={() => {
                if (isBroadcasting) stopBroadcasting();
                else startBroadcasting();
              }}
              icon={isBroadcasting ? 'pause' : 'play'}
              contentStyle={{ flexDirection: 'row-reverse' }}
            />
          </View>

          <TextInput
            mode="outlined"
            label="Broadcast New Message"
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            multiline
          />
          <Button
            mode="contained"
            onPress={handleStartUserBroadcast}
            disabled={!message.trim()}
            style={styles.button}
          >
            Broadcast Message
          </Button>
        </Surface>

          <Surface style={styles.receiverSection} elevation={2}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Title style={styles.sectionTitle}>Network Messages</Title>
              <Button mode="text" onPress={handleClearEverythingAndStop} compact>
                Clear
              </Button>
            </View>

            <View style={styles.messagesContainer}>
              {allMessages.length === 0 ? (
                <Paragraph style={styles.placeholderText}>
                  Listening for messages...
                </Paragraph>
              ) : (
                allMessages.map((msg) => renderReceivedMessageCard(msg))
              )}
            </View>
          </Surface>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

// --- Styles ---
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
    paddingBottom: 20,
  },
  broadcasterSection: {
    padding: Math.min(SCREEN_WIDTH * 0.05, 20),
    margin: Math.min(SCREEN_WIDTH * 0.04, 16),
    marginBottom: 12,
    borderRadius: 0,
    backgroundColor: '#0A0B0D',
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  receiverSection: {
    padding: Math.min(SCREEN_WIDTH * 0.05, 20),
    margin: Math.min(SCREEN_WIDTH * 0.04, 16),
    marginTop: 0,
    marginBottom: 20,
    minHeight: 200,
    borderRadius: 0,
    backgroundColor: '#0A0B0D',
    borderWidth: 4,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  messagesContainer: {
    maxHeight: 400,
  },
  sectionTitle: {
    textAlign: 'left',
    marginBottom: 16,
    fontWeight: '900',
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  internetSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  internetStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  textInput: {
    marginBottom: 16,
    minHeight: 80,
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#0000FF',
  },
  button: {
    paddingVertical: 12,
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
  placeholderText: {
    textAlign: 'center',
    color: '#B1B7C3',
    marginTop: 40,
    fontSize: 16,
    fontWeight: '600',
  },
  messageCard: {
    marginBottom: 16,
    elevation: 0,
    shadowColor: 'transparent',
    backgroundColor: '#32353D',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#0000FF',
    shadowColor: '#0000FF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chunkBadge: {
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 2,
    fontWeight: '700',
  },
  chunkHave: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
    color: '#FFFFFF',
  },
  chunkMissing: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
    color: '#FFFFFF',
  },
});

export default MeshScreen;
