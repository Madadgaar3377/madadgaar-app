import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, theme } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';

interface ProfileIconProps {
  imageUri?: string | null;
  initials: string;
  onPress?: () => void;
  size?: number;
}

import { Ionicons } from '@expo/vector-icons';

// ...

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  imageUri,
  initials,
  onPress,
  size = 40,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={[styles.imageWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Ionicons name="person" size={size * 0.5} color="#999" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // border width 0 for cleaner look or 1 for subtle definition
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    // Only if we revert to initials
    fontWeight: '600',
    color: '#666',
  },
});

