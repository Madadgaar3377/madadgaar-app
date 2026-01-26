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
import { forgotPassword } from '@/store/auth/authActions';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OTPInput } from '@/components/common/OTPInput';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function ResetOtpScreen() {
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
        text2: 'Redirecting to forgot password...',
      });
      setTimeout(() => {
        router.replace('/(auth)/forgot-password');
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

    router.push({
      pathname: '/(auth)/new-password',
      params: { email, otp },
    });
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    const result = await dispatch(forgotPassword({ email }));
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
            <AuthHeader
              title="Verify Your Email"
              subtitle="Enter the 6-digit code sent to your email address"
            />

            {email && (
              <View style={styles.emailContainer}>
                <Ionicons name="mail" size={16} color={RED_PRIMARY} />
                <Text style={styles.emailText}>{email}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.otpWrapper}>
                <OTPInput
                  length={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus={true}
                />
              </View>

              <Button
                title="Verify Code"
                onPress={handleVerify}
                loading={loading}
                disabled={loading || otp.length !== 6}
                style={styles.verifyButton}
                fullWidth
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendLoading || resendTimer > 0}
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
    justifyContent: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED_LIGHT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    marginTop: spacing.lg,
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
  emailText: {
    color: RED_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  formContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  otpWrapper: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  verifyButton: {
    marginTop: spacing.lg,
    height: 56,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  resendText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '400',
  },
  resendLink: {
    color: RED_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: TEXT_SECONDARY,
    opacity: 0.6,
    textDecorationLine: 'none',
  },
});
