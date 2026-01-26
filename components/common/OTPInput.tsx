import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors, spacing, theme } from '@/theme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChangeText,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handlePaste = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
    if (numericText.length > 0) {
      onChangeText(numericText);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(numericText.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Handle paste (when text length > 1)
    if (numericText.length > 1) {
      handlePaste(numericText);
      return;
    }
    
    if (numericText.length > 0) {
      const newValue = value.split('');
      newValue[index] = numericText[0];
      const updatedValue = newValue.join('').slice(0, length);
      onChangeText(updatedValue);

      // Auto-focus next input
      if (index < length - 1 && numericText.length > 0) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // Handle backspace
      const newValue = value.split('');
      newValue[index] = '';
      onChangeText(newValue.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Clear the current input when focused if it has a value
    if (value[index]) {
      const newValue = value.split('');
      newValue[index] = '';
      onChangeText(newValue.join(''));
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            value[index] && styles.inputFilled,
            index === value.length && styles.inputFocused,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={length}
          selectTextOnFocus
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  input: {
    width: 50,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputFilled: {
    borderColor: colors.accent,
    backgroundColor: '#FFEBEE',
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

