import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/theme';

const TEXT_SECONDARY = '#6B7280';
const RED_PRIMARY = '#D32F2F';

export const Footer: React.FC = () => {
  const router = useRouter();

  const handleCodeXALink = () => {
    Linking.openURL('https://code-xa.web.app').catch((err) => {
      console.error('Error opening link:', err);
    });
  };

  const handleTermsPress = () => {
    router.push('/terms-and-conditions' as any);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleTermsPress} style={styles.termsLink}>
        <Text style={styles.termsLinkText}>Terms & Conditions</Text>
      </TouchableOpacity>
      <Text style={styles.copyrightText}>
        © 2024 Madadgaar Expert Partner. Designed & Developed By{' '}
        <Text style={styles.linkText} onPress={handleCodeXALink}>
          Code-XA
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  termsLink: {
    marginBottom: spacing.sm,
  },
  termsLinkText: {
    fontSize: 13,
    color: RED_PRIMARY,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  copyrightText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: RED_PRIMARY,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
