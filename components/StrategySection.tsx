import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F8F9FA';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

interface StrategyItem {
  icon: string;
  title: string;
  description: string;
}

const strategyItems: StrategyItem[] = [
  {
    icon: 'stats-chart',
    title: 'Marketplace Optimization',
    description: 'Continuously improve the platform for seamless comparison of property, insurance, loans, and installment options.',
  },
  {
    icon: 'people',
    title: 'Partner Network Expansion',
    description: 'Onboard and maintain strong relationships with top service providers to ensure quality and variety.',
  },
  {
    icon: 'person-circle',
    title: 'Customer-Centric Approach',
    description: 'Offer expert guidance, transparent information, and responsive support to build trust and loyalty.',
  },
  {
    icon: 'phone-portrait',
    title: 'Digital Marketing & Outreach',
    description: 'Leverage online channels, social media, and targeted campaigns to reach a wide audience.',
  },
  {
    icon: 'trending-up',
    title: 'Data-Driven Decisions',
    description: 'Use analytics to understand user behavior, identify trends, and enhance service offerings.',
  },
  {
    icon: 'bulb',
    title: 'Innovation & Technology',
    description: 'Integrate advanced tools like mobile apps, AI recommendations, and smart comparison features.',
  },
];

export const StrategySection: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'properties':
        router.push('/(tabs)/properties');
        break;
      case 'loans':
        router.push('/(tabs)/loans');
        break;
      case 'installments':
        router.push('/(tabs)/installments');
        break;
      case 'insurance':
        // Navigate to insurance if available, otherwise show a message
        router.push('/(tabs)/installments'); // Placeholder - update when insurance page is available
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Our Strategy to Achieve Our Goals</Text>
        <Text style={styles.subtitle}>
          Strategic approaches that drive our success and ensure quality service delivery
        </Text>
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinksContainer}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => handleNavigation('properties')}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={18} color={RED_PRIMARY} />
          <Text style={styles.quickLinkText}>Compare Properties</Text>
          <Ionicons name="chevron-forward" size={16} color={RED_PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => handleNavigation('loans')}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={18} color={RED_PRIMARY} />
          <Text style={styles.quickLinkText}>Explore Loans</Text>
          <Ionicons name="chevron-forward" size={16} color={RED_PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => handleNavigation('installments')}
          activeOpacity={0.7}
        >
          <Ionicons name="card-outline" size={18} color={RED_PRIMARY} />
          <Text style={styles.quickLinkText}>View Installments</Text>
          <Ionicons name="chevron-forward" size={16} color={RED_PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => handleNavigation('insurance')}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={RED_PRIMARY} />
          <Text style={styles.quickLinkText}>Insurance Support</Text>
          <Ionicons name="chevron-forward" size={16} color={RED_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Strategy Items */}
      <View style={styles.strategyGrid}>
        {strategyItems.map((item, index) => (
          <View key={index} style={styles.strategyCard}>
            <View style={styles.strategyIconContainer}>
              <Ionicons name={item.icon as any} size={28} color={RED_PRIMARY} />
            </View>
            <Text style={styles.strategyTitle}>{item.title}</Text>
            <Text style={styles.strategyDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: WHITE,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  quickLinksContainer: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_LIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  strategyGrid: {
    gap: spacing.md,
  },
  strategyCard: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 16,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: RED_PRIMARY,
  },
  strategyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing.xs,
  },
  strategyDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
});
