import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyAccount, resendOtp } from '@/store/auth/authActions';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OTPInput } from '@/components/common/OTPInput';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const GRAY_LIGHT = '#F8F9FA';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const email = (params.email as string) || '';
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Redirecting to login...',
      });
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter a 6-digit code',
      });
      return;
    }

    const result = await dispatch(verifyAccount({ email, otp }));
    if (result && result.success) {
      Toast.show({
        type: 'success',
        text1: 'Account Verified!',
        text2: result.message || 'Welcome to Madadgaar',
      });
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else if (result && result.error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: result.error,
      });
      setOtp('');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    const result = await dispatch(resendOtp({ email }));
    if (result && result.success) {
      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: 'Check your email for the new code',
      });
      setResendTimer(60);
    } else if (result && result.error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Resend',
        text2: result.error,
      });
    }
    setResendLoading(false);
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
            <View style={styles.headerSection}>
              <AuthHeader
                title="Verify Your Email"
                subtitle="Enter the 6-digit code sent to your email address"
              />
            </View>

            {email && (
              <View style={styles.emailContainer}>
                <View style={styles.emailIconWrapper}>
                  <Ionicons name="mail" size={16} color={RED_PRIMARY} />
                </View>
                <Text style={styles.emailText}>{email}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter Verification Code</Text>
                <View style={styles.otpWrapper}>
                  <OTPInput
                    length={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus={true}
                  />
                </View>
              </View>

              <View style={styles.buttonSection}>
                <Button
                  title="Verify Account"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={loading || otp.length !== 6}
                  style={styles.verifyButton}
                  fullWidth
                />
              </View>

              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendLoading || resendTimer > 0}
                  style={styles.resendButton}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      (resendLoading || resendTimer > 0) && styles.resendLinkDisabled,
                    ]}
                  >
                    {resendLoading
                      ? 'Sending...'
                      : resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend Code'}
                  </Text>
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
  headerSection: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED_LIGHT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.md,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emailIconWrapper: {
    marginRight: spacing.xs,
  },
  emailText: {
    color: RED_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  otpSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  otpWrapper: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  buttonSection: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  verifyButton: {
    height: 56,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  resendText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '400',
  },
  resendButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  resendLink: {
    color: RED_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: TEXT_SECONDARY,
    opacity: 0.5,
    textDecorationLine: 'none',
  },
});
