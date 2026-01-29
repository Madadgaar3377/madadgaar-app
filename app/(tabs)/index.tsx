import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { BannerSkeleton } from '@/components/common/SkeletonLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { SearchBar } from '@/components/common/SearchBar';
import { ProfileIcon } from '@/components/common/ProfileIcon';
import { OfferBanner } from '@/components/OfferBanner';
import { CategoriesSection } from '@/components/CategoriesSection';
import { InstallmentsSection } from '@/components/InstallmentsSection';
import { PropertiesSection } from '@/components/PropertiesSection';
import { LoansSection } from '@/components/LoansSection';
import { StrategySection } from '@/components/StrategySection';
import { Footer } from '@/components/common/Footer';
import { NoInternet } from '@/components/common/NoInternet';
import { getAllOffers, OfferBanner as OfferBannerType } from '@/services/banner.api';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const WHITE = '#FFFFFF';
const TEXT_PRIMARY = '#1A1A1A';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: WHITE,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: WHITE,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: -spacing.xs,
    marginBottom: -spacing.xs,
  },
  homeLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  profileButton: {
    marginLeft: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RED_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginRight: spacing.xs, // Add spacing between chat and profile
  },
  userIconButton: {
    marginLeft: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RED_LIGHT,
    borderWidth: 1.5,
    borderColor: RED_PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for floating nav bar
    paddingTop: 0,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  sectionContainer: {
    marginBottom: spacing.sm,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const { name, profileImageUrl, userProfile, isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [banners, setBanners] = useState<OfferBannerType[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Check if user is logged in (either isAuthenticated or has token/user)
  const isLoggedIn = isAuthenticated || !!token || !!user;

  const getInitials = () => {
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Check internet connectivity
  useEffect(() => {
    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      // Only fetch if connected
      if (isConnected === false) {
        setLoadingBanners(false);
        return;
      }

      try {
        setLoadingBanners(true);
        const fetchedBanners = await getAllOffers();
        setBanners(fetchedBanners);
      } catch (error) {
        setBanners([]);
      } finally {
        setLoadingBanners(false);
      }
    };

    if (isConnected !== null) {
      fetchBanners();
    }
  }, [isConnected]);

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleLoginPress = () => {
    router.push('/(tabs)/profile');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRetry = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
  };

  // Show no internet screen if not connected
  if (isConnected === false) {
    return (
      <View style={styles.mainContainer}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <NoInternet onRetry={handleRetry} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <LazyImage
                source={require('@/assets/home_logo.png')}
                style={styles.homeLogo}
                resizeMode="contain"
                transparent={true}
              />
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Chat Button - Shows when user is logged in */}
            {isLoggedIn && (
              <TouchableOpacity
                onPress={() => {
                  console.log('Chat button pressed, isLoggedIn:', isLoggedIn);
                  router.push('/chat');
                }}
                style={styles.chatButton}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color={WHITE} />
              </TouchableOpacity>
            )}
            
            {/* Profile or Login Button */}
            {isLoggedIn ? (
              <TouchableOpacity
                onPress={handleProfilePress}
                style={styles.profileButton}
                activeOpacity={0.8}
              >
                <ProfileIcon
                  imageUri={profileImageUrl || userProfile?.profilePic || null}
                  initials={getInitials()}
                  onPress={handleProfilePress}
                  size={40}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleLoginPress}
                style={styles.userIconButton}
                activeOpacity={0.7}
              >
                <View style={styles.userIconContainer}>
                  <Ionicons name="person-outline" size={20} color={RED_PRIMARY} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <Animated.View
            style={[styles.searchContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <SearchBar
              placeholder="Search services, products..."
              onSearch={handleSearch}
            />
          </Animated.View>

          {/* Offer Banners */}
          {loadingBanners ? (
            <Animated.View
              style={[styles.sectionContainer, {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }]}
            >
              <BannerSkeleton />
            </Animated.View>
          ) : banners.length > 0 ? (
            <Animated.View
              style={[styles.sectionContainer, {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }]}
            >
              <OfferBanner banners={banners} />
            </Animated.View>
          ) : null}

          {/* Categories Section */}
          <Animated.View
            style={[styles.sectionContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <CategoriesSection />
          </Animated.View>

          {/* Installments Section */}
          <Animated.View
            style={[styles.sectionContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <InstallmentsSection limit={5} />
          </Animated.View>

          {/* Loans Section */}
          <Animated.View
            style={[styles.sectionContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <LoansSection limit={5} />
          </Animated.View>

          {/* Properties Section */}
          <Animated.View
            style={[styles.sectionContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <PropertiesSection limit={5} />
          </Animated.View>

          {/* Strategy Section */}
          <Animated.View
            style={[styles.sectionContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <StrategySection />
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }]}
          >
            <Footer />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
