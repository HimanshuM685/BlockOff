import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useLogs, LogEntry } from '@/contexts/logContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface LogWindowProps {
  visible: boolean;
  onClose: () => void;
}

const LogWindow: React.FC<LogWindowProps> = ({ visible, onClose }) => {
  const { logs, clearLogs, getLogsAsText } = useLogs();
  const scrollViewRef = useRef<ScrollView>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && visible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [logs, visible, autoScroll]);

  const handleCopyLogs = () => {
    const logsText = getLogsAsText();
    Clipboard.setString(logsText);
    Alert.alert('Copied!', 'All logs have been copied to clipboard');
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearLogs();
          },
        },
      ]
    );
  };

  const getLogColor = (level: LogEntry['level']): string => {
    switch (level) {
      case 'error':
        return '#ff4444';
      case 'warn':
        return '#ffaa00';
      case 'info':
        return '#00aaff';
      case 'debug':
        return '#888888';
      default:
        return Colors.neoBrutalism.text;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="bug-report" size={24} color={Colors.neoBrutalism.primary} />
            <Text style={styles.headerTitle}>Debug Logs</Text>
            <Text style={styles.logCount}>({logs.length})</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setAutoScroll(!autoScroll)}
              style={styles.iconButton}
            >
              <MaterialIcons
                name={autoScroll ? 'vertical-align-bottom' : 'vertical-align-center'}
                size={20}
                color={Colors.neoBrutalism.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopyLogs} style={styles.iconButton}>
              <MaterialIcons name="content-copy" size={20} color={Colors.neoBrutalism.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearLogs} style={styles.iconButton}>
              <MaterialIcons name="delete-outline" size={20} color={Colors.neoBrutalism.error} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <MaterialIcons name="close" size={24} color={Colors.neoBrutalism.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logs List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.logsContainer}
          contentContainerStyle={styles.logsContent}
          onScrollBeginDrag={() => setAutoScroll(false)}
        >
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="info-outline" size={48} color={Colors.neoBrutalism.textSecondary} />
              <Text style={styles.emptyText}>No logs yet</Text>
              <Text style={styles.emptySubtext}>Logs will appear here as the app runs</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <View style={[styles.logLevelBadge, { backgroundColor: getLogColor(log.level) }]}>
                    <Text style={styles.logLevelText}>{log.level.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
                </View>
                <Text style={[styles.logMessage, { color: getLogColor(log.level) }]}>
                  {log.message}
                </Text>
                {log.data && log.data.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dataContainer}>
                    <Text style={styles.logData}>
                      {JSON.stringify(log.data, null, 2)}
                    </Text>
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {logs.length} log{logs.length !== 1 ? 's' : ''} • Tap to scroll
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neoBrutalism.background,
    marginTop: Platform.OS === 'android' ? 40 : 60,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 4,
    borderColor: Colors.neoBrutalism.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neoBrutalism.surface,
    borderBottomWidth: 4,
    borderBottomColor: Colors.neoBrutalism.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neoBrutalism.text,
    textTransform: 'uppercase',
  },
  logCount: {
    fontSize: 14,
    color: Colors.neoBrutalism.textSecondary,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: Colors.neoBrutalism.background,
  },
  logsContent: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neoBrutalism.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neoBrutalism.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  logEntry: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.neoBrutalism.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.neoBrutalism.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  logLevelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logTimestamp: {
    fontSize: 11,
    color: Colors.neoBrutalism.textSecondary,
    fontFamily: 'monospace',
  },
  logMessage: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 18,
    color: Colors.neoBrutalism.text,
  },
  dataContainer: {
    marginTop: 8,
    maxHeight: 100,
  },
  logData: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.neoBrutalism.textSecondary,
  },
  footer: {
    padding: 12,
    backgroundColor: Colors.neoBrutalism.surface,
    borderTopWidth: 4,
    borderTopColor: Colors.neoBrutalism.border,
  },
  footerText: {
    fontSize: 12,
    color: Colors.neoBrutalism.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LogWindow;

