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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/auth/authActions';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';
import { PersonIcon, LockIcon } from '@/components/icons';
import { Ionicons } from '@expo/vector-icons';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const GRAY_LIGHT = '#F8F9FA';
const GRAY_BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function LoginScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check your input fields',
      });
      return;
    }

    const result = await dispatch(login(formData));
    if (result && result.success) {
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Successfully signed in',
      });
      setTimeout(() => {
        if (redirect) {
          router.replace(redirect as any);
        } else {
          router.replace('/(tabs)');
        }
      }, 500);
    } else if (result && result.error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: result.error,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {loading && <PageLoader fullScreen message="Signing in..." />}
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
              title="Welcome Back"
              subtitle="Sign in to continue to your account"
            />

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputGroup,
                    focusedField === 'email' && styles.inputGroupFocused,
                    formErrors.email && styles.inputGroupError,
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
                    value={formData.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setFormData({ ...formData, email: text.toLowerCase() });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {formErrors.email && (
                  <Text style={styles.errorText}>{formErrors.email}</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputGroup,
                    focusedField === 'password' && styles.inputGroupFocused,
                    formErrors.password && styles.inputGroupError,
                  ]}
                >
                  <LockIcon
                    size={20}
                    color={focusedField === 'password' ? RED_PRIMARY : TEXT_SECONDARY}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={TEXT_SECONDARY}
                    value={formData.password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setFormData({ ...formData, password: text });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
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
                {formErrors.password && (
                  <Text style={styles.errorText}>{formErrors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                fullWidth
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: RED_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.md,
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
  signupLink: {
    color: RED_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
});
