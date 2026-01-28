import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { InstallmentsIcon, LoanIcon, ProfileIcon } from '@/components/icons';

// Optional haptics import
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';
const GRAY_INACTIVE = '#9CA3AF';
const GRAY_BORDER = '#E5E7EB';

// Pure white background
const NAVBAR_BG = WHITE;

interface TabItem {
  name: string;
  route: string;
  icon?: React.ComponentType<{ size?: number; color?: string; filled?: boolean }>;
  iconName?: string; // For Ionicons
  label: string;
}

const TABS: TabItem[] = [
  {
    name: 'installments',
    route: '/(tabs)/installments',
    icon: InstallmentsIcon,
    label: 'Installments',
  },
  {
    name: 'properties',
    route: '/(tabs)/properties',
    iconName: 'business-outline',
    label: 'Properties',
  },
  {
    name: 'home',
    route: '/(tabs)',
    iconName: 'home',
    label: 'Home',
  },
  {
    name: 'loans',
    route: '/(tabs)/loans',
    icon: LoanIcon,
    label: 'Loans',
  },
  {
    name: 'profile',
    route: '/(tabs)/profile',
    icon: ProfileIcon,
    label: 'Profile',
  },
];

export const FloatingTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const homeButtonScale = useRef(new Animated.Value(1)).current;
  const homeButtonOpacity = useRef(new Animated.Value(1)).current;
  const iconScales = useRef(TABS.map(() => new Animated.Value(1))).current;
  const iconOpacities = useRef(TABS.map(() => new Animated.Value(1))).current;

  // Determine active tab
  const getActiveTab = () => {
    if (pathname === '/(tabs)' || pathname === '/(tabs)/') {
      return 'home';
    }
    return pathname.split('/').pop() || 'home';
  };

  const activeTab = getActiveTab();

  const handleTabPress = (tab: TabItem, index: number) => {
    // Haptic feedback (optional)
    if (Platform.OS === 'ios' && Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }

    // Animation for regular icons
    const scaleAnim = iconScales[index];
    const opacityAnim = iconOpacities[index];
    
    if (tab.name !== 'home') {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    // Special animation for home button (scale + fade)
    if (tab.name === 'home') {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(homeButtonScale, {
            toValue: 1.1,
            useNativeDriver: true,
            tension: 200,
            friction: 6,
          }),
          Animated.spring(homeButtonScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 6,
          }),
        ]),
        Animated.sequence([
          Animated.timing(homeButtonOpacity, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(homeButtonOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    // Navigate
    router.push(tab.route as any);
  };

  const isActive = (tabName: string) => {
    if (tabName === 'home') {
      return pathname === '/(tabs)' || pathname === '/(tabs)/';
    }
    return pathname.includes(`/${tabName}`);
  };

  const renderTab = (tab: TabItem, index: number) => {
    const IconComponent = tab.icon;
    const active = isActive(tab.name);
    const isHome = tab.name === 'home';

    if (isHome) {
      // Home button - elevated above the navbar
      return (
        <Animated.View
          key={tab.name}
          style={[
            styles.homeButtonContainer,
            {
              transform: [{ scale: homeButtonScale }, { translateY: -20 }], // Elevated by 20px
              opacity: homeButtonOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => handleTabPress(tab, index)}
            activeOpacity={0.85}
          >
            <Ionicons name="home" size={26} color={WHITE} />
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // Regular tab icons
    return (
      <Animated.View
        key={tab.name}
        style={[
          styles.tabContainer,
          {
            transform: [{ scale: iconScales[index] }],
            opacity: iconOpacities[index],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(tab, index)}
          activeOpacity={0.7}
        >
          {tab.iconName ? (
            <Ionicons
              name={tab.iconName as any}
              size={22}
              color={active ? RED_PRIMARY : GRAY_INACTIVE}
            />
          ) : (
            IconComponent && (
              <IconComponent
                size={22}
                color={active ? RED_PRIMARY : GRAY_INACTIVE}
                filled={active}
              />
            )
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Calculate safe area bottom padding
  const safeAreaBottom = Math.max(insets.bottom, 0);

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: 0,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* White background container that covers navbar */}
      <View
        style={[
          styles.whiteBackground,
          {
            height: 58,
            bottom: 0,
          },
        ]}
      />
      <View
        style={[
          styles.container,
          {
            bottom: 0,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.navBar}>
          {/* All tabs in a single row with equal spacing */}
          {TABS.map((tab, index) => renderTab(tab, index))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  whiteBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: WHITE,
    width: '100%',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Equal spacing between all items
    backgroundColor: NAVBAR_BG,
    borderRadius: 0,
    width: SCREEN_WIDTH,
    height: 58,
    paddingHorizontal: 8,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    overflow: 'visible', // Allow home button to be visible
    borderWidth: 0,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  homeButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    zIndex: 10, // Ensure it appears above other elements
  },
  homeButton: {
    width: 56, // Larger elevated button
    height: 56,
    borderRadius: 28,
    backgroundColor: RED_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: WHITE, // White border for better separation
  },
});
