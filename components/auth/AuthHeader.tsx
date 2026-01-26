import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Logo } from '@/components/common/Logo';
import { colors, spacing } from '@/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size="xlarge" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
    // White background to match auth screen - ensures perfect blending
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    backgroundColor: colors.white,
    // White background matching screen - no visible container
    // No borders, no shadows, no padding - completely flat
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
  },
});

