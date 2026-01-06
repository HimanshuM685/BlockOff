import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface LogToggleButtonProps {
  onPress: () => void;
  logCount?: number;
}

const LogToggleButton: React.FC<LogToggleButtonProps> = ({ onPress, logCount = 0 }) => {
  const hasErrors = logCount > 0; // You could track error count separately if needed

  return (
    <TouchableOpacity
      style={[styles.button, hasErrors && styles.buttonError]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name="bug-report"
        size={20}
        color={hasErrors ? Colors.neoBrutalism.error : Colors.neoBrutalism.primary}
      />
      {logCount > 0 && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neoBrutalism.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.neoBrutalism.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  buttonError: {
    borderColor: Colors.neoBrutalism.error,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neoBrutalism.error,
  },
});

export default LogToggleButton;

