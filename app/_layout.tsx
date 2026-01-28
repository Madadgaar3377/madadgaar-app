import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '@/store/store';
import { loadStoredAuth, updateUserLocationAndIp } from '@/store/auth/authActions';
import { AppToast } from '@/components/common/Toast';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/services/notifications';

// Hide native splash screen immediately on app start
// Onboarding will be the first screen users see
try {
  SplashScreen.hideAsync();
} catch (error) {
  // Ignore errors if splash screen API is not available
}

function RootLayoutNav() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

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

          // Register for push notifications
          registerPushNotifications();
        }
      }, 3000); // Wait 3 seconds after auth loads to ensure everything is ready
    };

    loadAuth();

    // Set up notification listeners
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('📩 Notification received:', notification);
    });

    responseListener.current = addNotificationResponseListener((response) => {
      console.log('👆 Notification tapped:', response);
      handleNotificationTap(response.notification.request.content.data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [dispatch]);

  const registerPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log('📱 Push token obtained:', token);
        await savePushToken(token);
        console.log('✅ Push token saved to backend');
      }
    } catch (error) {
      console.error('❌ Error registering push notifications:', error);
    }
  };

  const handleNotificationTap = (data: any) => {
    try {
      if (!data) return;

      console.log('Handling notification data:', data);

      // Navigate based on notification type
      switch (data.type) {
        case 'chat_message':
          router.push('/chat');
          break;
        case 'installment_submitted':
        case 'installment_status_update':
          router.push('/(tabs)/dashboard');
          break;
        case 'loan_status_update':
          router.push('/(tabs)/loans');
          break;
        case 'payment_reminder':
          router.push('/(tabs)/dashboard');
          break;
        case 'admin_online':
          router.push('/chat');
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  };

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

