import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '@/store/store';
import { loadStoredAuth, updateUserLocationAndIp } from '@/store/auth/authActions';
import { AppToast } from '@/components/common/Toast';
import * as SplashScreen from 'expo-splash-screen';

// Hide native splash screen immediately on app start
// Onboarding will be the first screen users see
try {
  SplashScreen.hideAsync();
} catch (error) {
  // Ignore errors if splash screen API is not available
}

function RootLayoutNav() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load stored auth data on app start
    const loadAuth = async () => {
      const result = await dispatch(loadStoredAuth());

      // Wait a bit for auth to load, then update location and IP if authenticated
      setTimeout(async () => {
        const state = store.getState();

        if (state.auth.isAuthenticated && state.auth.userId) {
          // Update location and IP in the background (don't block UI)
          dispatch(updateUserLocationAndIp()).catch((error) => {
            // Silent fail
          });
        }
      }, 3000); // Wait 3 seconds after auth loads to ensure everything is ready
    };

    loadAuth();
  }, [dispatch]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <AppToast />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </Provider>
  );
}

