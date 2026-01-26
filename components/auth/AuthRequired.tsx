import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface AuthRequiredProps {
  title?: string;
  message?: string;
  redirectPath?: string;
}

export function AuthRequired({ 
  title = 'Authentication Required',
  message = 'Please login or signup to access this feature',
  redirectPath 
}: AuthRequiredProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push({
      pathname: '/(auth)/login',
      params: redirectPath ? { redirect: redirectPath } : undefined
    } as any);
  };

  const handleSignup = () => {
    router.push({
      pathname: '/(auth)/signup',
      params: redirectPath ? { redirect: redirectPath } : undefined
    } as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LazyImage
            source={require('@/assets/authlogo.png')}
            style={styles.logo}
            resizeMode="contain"
            transparent={true}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            onPress={handleLogin}
            variant="primary"
            fullWidth
            style={styles.button}
          />
          <Button
            title="Sign Up"
            onPress={handleSignup}
            variant="outline"
            fullWidth
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    alignSelf: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    marginBottom: 0,
  },
});

