import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, theme } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';

interface ProfilePictureProps {
  imageUri?: string | null;
  initials: string;
  uploading?: boolean;
  onPress?: () => void;
  size?: number;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  imageUri,
  initials,
  uploading = false,
  onPress,
  size = 140,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={uploading}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={[styles.imageWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
        {imageUri ? (
          <LazyImage
            source={{ uri: imageUri }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
          </View>
        )}
        
        {uploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="small" color={WHITE} />
          </View>
        )}
        
        {!uploading && (
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color={WHITE} />
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
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...theme.shadows.lg,
    borderWidth: 4,
    borderColor: '#FFCDD2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: RED_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
    color: WHITE,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: RED_PRIMARY,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});

