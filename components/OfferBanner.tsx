import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Linking,
} from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { useRouter } from 'expo-router';
import { OfferBanner as OfferBannerType } from '@/services/banner.api';
import { spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RED_PRIMARY = '#D32F2F';
const BANNER_HEIGHT = 160; // More compact
const AUTO_SCROLL_INTERVAL = 4000;

interface OfferBannerProps {
  banners: OfferBannerType[];
}

export const OfferBanner: React.FC<OfferBannerProps> = ({ banners }) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  if (!banners || banners.length === 0) {
    return null;
  }

  const handleBannerPress = async (banner: OfferBannerType) => {
    if (banner.link) {
      if (banner.link.startsWith('http://') || banner.link.startsWith('https://')) {
        try {
          const canOpen = await Linking.canOpenURL(banner.link);
          if (canOpen) {
            await Linking.openURL(banner.link);
          }
        } catch (error) {
          // Error opening link
        }
      } else {
        router.push(banner.link as any);
      }
    }
  };

  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.singleBannerContainer}
          activeOpacity={0.9}
          onPress={() => handleBannerPress(banner)}
        >
          <LazyImage
            source={{ uri: banner.imageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    startAutoScroll();
    return () => {
      stopAutoScroll();
    };
  }, [banners.length]);

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const bannerWidth = SCREEN_WIDTH - (spacing.lg * 2);
    const index = Math.round(offsetX / bannerWidth);
    setCurrentIndex(index);
  };

  const renderBanner = ({ item, index }: { item: OfferBannerType; index: number }) => {
    return (
      <TouchableOpacity
        style={styles.bannerContainer}
        activeOpacity={0.9}
        onPress={() => handleBannerPress(item)}
      >
        <LazyImage
          source={{ uri: item.imageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => {
          const bannerWidth = SCREEN_WIDTH - (spacing.lg * 2);
          const inputRange = [
            (index - 1) * bannerWidth,
            index * bannerWidth,
            (index + 1) * bannerWidth,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 20, 6],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        getItemLayout={(_, index) => {
          const totalItemWidth = SCREEN_WIDTH;
          return {
            length: totalItemWidth,
            offset: totalItemWidth * index,
            index,
          };
        }}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
      />
      {renderPaginationDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  singleBannerContainer: {
    width: SCREEN_WIDTH - (spacing.lg * 2),
    height: BANNER_HEIGHT,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerContainer: {
    width: SCREEN_WIDTH - (spacing.lg * 2),
    height: BANNER_HEIGHT,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  paginationDot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: RED_PRIMARY,
  },
});
