import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { Button } from '@/components/common/Button';
import { colors, spacing } from '@/theme';

const { width } = Dimensions.get('window');

const ONBOARDING_IMAGES = [
  require('../assets/onboarding screens images/onboarding1.jpeg'),
  require('../assets/onboarding screens images/onboarding2.png'),
  require('../assets/onboarding screens images/onboarding3.jpeg'),
];

const ONBOARDING_STORAGE_KEY = 'onboardingCompleted';

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item }: { item: any }) => {
    return <OnboardingSlide image={item} />;
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {ONBOARDING_IMAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip Button - Only show on first 2 slides */}
      {currentIndex < 2 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Image Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_IMAGES}
        renderItem={renderSlide}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom Overlay */}
      <View style={styles.overlay}>
        {/* Pagination Dots */}
        {renderPagination()}

        {/* Get Started Button - Only on last slide */}
        {currentIndex === 2 && (
          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.getStartedButton}
              fullWidth
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.xxl + 20,
    right: spacing.xl,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xxl + 20,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'transparent',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#D32F2F',
  },
  buttonContainer: {
    width: '100%',
  },
  getStartedButton: {
    height: 56,
    borderRadius: 30,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
});

