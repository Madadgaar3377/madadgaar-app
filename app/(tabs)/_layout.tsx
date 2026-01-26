import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { HomeIcon, RequestsIcon, ProfileIcon, DashboardIcon, InstallmentsIcon, PropertyIcon, LoanIcon } from '@/components/icons';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <>
      <StatusBar style="light" />
      {Platform.OS === 'android' && (
        <View style={[styles.statusBarBackground, { height: insets.top }]} />
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // Hide default tab bar
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <HomeIcon size={24} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="installments"
          options={{
            title: 'Installments',
            tabBarIcon: ({ color, focused }) => (
              <InstallmentsIcon size={24} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="properties"
          options={{
            title: 'Properties',
            tabBarIcon: ({ color, focused }) => (
              <PropertyIcon size={24} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="loans"
          options={{
            title: 'Loans',
            tabBarIcon: ({ color, focused }) => (
              <LoanIcon size={24} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <ProfileIcon size={24} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
      {/* Floating Navigation Bar */}
      <FloatingTabBar />
    </>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
});
