import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { forgotPassword } from '@/store/auth/authActions';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';
import { PersonIcon } from '@/components/icons';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const GRAY_LIGHT = '#F8F9FA';
const GRAY_BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    const result = await dispatch(forgotPassword({ email: email.toLowerCase() }));
    if (result && result.success) {
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Please check your email for the verification code',
      });
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/reset-otp',
          params: { email: email.toLowerCase(), type: 'password-reset' },
        });
      }, 500);
    } else if (result && result.error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Send OTP',
        text2: result.error,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AuthHeader
              title="Forgot Password"
              subtitle="Enter your email address and we'll send you a verification code"
            />

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputGroup,
                    focusedField === 'email' && styles.inputGroupFocused,
                    emailError && styles.inputGroupError,
                  ]}
                >
                  <PersonIcon
                    size={20}
                    color={focusedField === 'email' ? RED_PRIMARY : TEXT_SECONDARY}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={TEXT_SECONDARY}
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => {
                      setFocusedField(null);
                      validateEmail();
                    }}
                    onChangeText={(text) => {
                      setEmail(text.toLowerCase());
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true}
                  />
                </View>
                {emailError && (
                  <Text style={styles.errorText}>{emailError}</Text>
                )}
              </View>

              <Button
                title="Send Verification Code"
                onPress={handleSendOtp}
                loading={loading}
                disabled={loading}
                style={styles.sendButton}
                fullWidth
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.white,
  },
  formContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_LIGHT,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: GRAY_BORDER,
    paddingHorizontal: spacing.md,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputGroupFocused: {
    borderColor: RED_PRIMARY,
    backgroundColor: colors.white,
    shadowColor: RED_PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroupError: {
    borderColor: colors.error,
    backgroundColor: RED_LIGHT,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: '500',
    paddingVertical: 0,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  sendButton: {
    marginTop: spacing.lg,
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  footerText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '400',
  },
  loginLink: {
    color: RED_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
});
