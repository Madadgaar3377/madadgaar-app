import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/theme';

interface OnboardingSlideProps {
  image: any;
}

const { width, height } = Dimensions.get('window');

export function OnboardingSlide({ image }: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      <Image
        source={image}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

