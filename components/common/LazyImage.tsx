import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Image, ImageStyle, ViewStyle, ActivityIndicator, Animated } from 'react-native';
import { colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface LazyImageProps {
  source: { uri: string } | number;
  style?: ImageStyle | ImageStyle[];
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
  placeholder?: React.ReactNode;
  fallbackIcon?: string;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  priority?: 'low' | 'normal' | 'high';
  transparent?: boolean; // For logos and images that need transparent backgrounds
}

const RED_PRIMARY = '#D32F2F';

export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder,
  fallbackIcon = 'image-outline',
  fallbackIconSize = 32,
  fallbackIconColor = '#ccc',
  onLoadStart,
  onLoadEnd,
  onError,
  priority = 'normal',
  transparent = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageSourceRef = useRef<string | number>('');

  // Memoize local image check for performance
  const isLocalImage = useMemo(() => {
    return typeof source === 'number' || (typeof source === 'object' && 'uri' in source && source.uri.startsWith('file://'));
  }, [source]);

  // Memoize image source with cache headers for faster loading
  const optimizedSource = useMemo(() => {
    if (typeof source === 'number') {
      return source;
    }
    if (typeof source === 'object' && 'uri' in source) {
      // Add cache control for faster loading
      return {
        uri: source.uri,
        cache: priority === 'high' ? 'force-cache' : 'default',
      };
    }
    return source;
  }, [source, priority]);

  // Reset states when source changes
  useEffect(() => {
    const currentSource = typeof source === 'object' && 'uri' in source ? source.uri : source;
    if (imageSourceRef.current !== currentSource) {
      imageSourceRef.current = currentSource;
      setLoading(true);
      setError(false);
      setImageLoaded(false);
      fadeAnim.setValue(0);
    }
  }, [source, fadeAnim]);

  // For local images, load instantly without any delay
  useEffect(() => {
    if (isLocalImage) {
      setLoading(false);
      setImageLoaded(true);
      fadeAnim.setValue(1);
      onLoadEnd?.();
    }
  }, [isLocalImage, fadeAnim, onLoadEnd]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setImageLoaded(true);
    // Ultra-fast fade animation (50ms instead of 300ms)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 50, // Reduced from 300ms to 50ms for instant feel
      useNativeDriver: true,
    }).start(() => {
      onLoadEnd?.();
    });
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    // For transparent images, show minimal or no loader for faster perceived performance
    if (transparent) {
      return null; // No placeholder for transparent images - instant display
    }

    // Only show placeholder if image hasn't loaded yet
    if (!imageLoaded) {
      return (
        <View style={[styles.placeholder, style]}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={RED_PRIMARY} />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderError = () => {
    return (
      <View style={[transparent ? styles.errorContainerTransparent : styles.errorContainer, style]}>
        <Ionicons name={fallbackIcon as any} size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  };

  if (error) {
    return renderError();
  }

  const containerStyle = transparent 
    ? [styles.containerTransparent, style]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      {loading && !isLocalImage && !imageLoaded && renderPlaceholder()}
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Image
          source={optimizedSource}
          style={[styles.image, transparent && styles.imageTransparent, style]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          fadeDuration={0}
          defaultSource={undefined}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  containerTransparent: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageTransparent: {
    backgroundColor: 'transparent',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderTransparent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainerTransparent: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

