import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setNewPassword } from '@/store/auth/authActions';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';
import { LockIcon } from '@/components/icons';
import { Ionicons } from '@expo/vector-icons';
import { PageLoader } from '@/components/common/PageLoader';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const GRAY_LIGHT = '#F8F9FA';
const GRAY_BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function NewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const email = (params.email as string) || '';
  const otp = (params.otp as string) || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !otp) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Redirecting to forgot password...',
      });
      setTimeout(() => {
        router.replace('/(auth)/forgot-password');
      }, 1500);
    }
  }, [email, otp, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check your input fields',
      });
      return;
    }

    const result = await dispatch(
      setNewPassword({
        email: email.toLowerCase(),
        otp,
        newPassword: formData.newPassword,
      })
    );

    if (result && result.success) {
      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'Your password has been updated successfully',
      });
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    } else if (result && result.error) {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: result.error,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {loading && <PageLoader fullScreen message="Resetting password..." />}
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
              title="Set New Password"
              subtitle="Enter your new password below"
            />

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View
                  style={[
                    styles.inputGroup,
                    focusedField === 'newPassword' && styles.inputGroupFocused,
                    formErrors.newPassword && styles.inputGroupError,
                  ]}
                >
                  <LockIcon
                    size={20}
                    color={
                      focusedField === 'newPassword'
                        ? RED_PRIMARY
                        : TEXT_SECONDARY
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={TEXT_SECONDARY}
                    value={formData.newPassword}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setFormData({ ...formData, newPassword: text });
                      if (formErrors.newPassword)
                        setFormErrors({ ...formErrors, newPassword: '' });
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>
                {formErrors.newPassword && (
                  <Text style={styles.errorText}>{formErrors.newPassword}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputGroup,
                    focusedField === 'confirmPassword' &&
                      styles.inputGroupFocused,
                    formErrors.confirmPassword && styles.inputGroupError,
                  ]}
                >
                  <LockIcon
                    size={20}
                    color={
                      focusedField === 'confirmPassword'
                        ? RED_PRIMARY
                        : TEXT_SECONDARY
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={TEXT_SECONDARY}
                    value={formData.confirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setFormData({ ...formData, confirmPassword: text });
                      if (formErrors.confirmPassword)
                        setFormErrors({
                          ...formErrors,
                          confirmPassword: '',
                        });
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>
                {formErrors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {formErrors.confirmPassword}
                  </Text>
                )}
              </View>

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.resetButton}
                fullWidth
              />
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
  resetButton: {
    marginTop: spacing.lg,
    height: 56,
  },
});
