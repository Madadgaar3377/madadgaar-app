import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PageLoader } from '@/components/common/PageLoader';

const ONBOARDING_STORAGE_KEY = 'onboardingCompleted';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setOnboardingCompleted(value === 'true');
      } catch (error) {
        // If error, assume onboarding not completed
        setOnboardingCompleted(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // Show loading only while checking onboarding status
  if (checkingOnboarding || loading) {
    return <PageLoader fullScreen={true} message="" />;
  }

  // If onboarding not completed, show onboarding screen
  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  // Allow users to browse without authentication
  // They will be prompted to login/signup when they try to apply
  return <Redirect href="/(tabs)" />;
}

