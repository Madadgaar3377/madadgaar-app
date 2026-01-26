import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/theme';

interface LoaderProps {
  onAnimationComplete: () => void;
}

const { width } = Dimensions.get('window');
const TOTAL_DURATION = 2000; // 2 seconds

export function Loader({ onAnimationComplete }: LoaderProps) {
  // Logo image animation
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoY = useSharedValue(20);

  useEffect(() => {
    // Hide native splash screen immediately
    SplashScreen.hideAsync().catch(() => {
      // Ignore errors
    });

    // Premium easing curve - smooth and confident
    const premiumEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

    // Logo animation: fade in, scale up, and slide up
    logoOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );

    logoScale.value = withDelay(
      200,
      withTiming(1, {
        duration: 800,
        easing: premiumEasing,
      })
    );

    logoY.value = withDelay(
      200,
      withTiming(0, {
        duration: 800,
        easing: premiumEasing,
      })
    );

    // Complete animation
    const completeTimer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, TOTAL_DURATION);

    return () => clearTimeout(completeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logo animated style
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <Image
          source={require('@/assets/logo_madadgaar.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 75,
  },
});
