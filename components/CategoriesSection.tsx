import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryCard } from './CategoryCard';
import { spacing } from '@/theme';

const TEXT_PRIMARY = '#1A1A1A';

export interface Category {
  id: string;
  icon: string;
  title: string;
  description?: string;
  route?: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'installments',
    icon: 'card',
    title: 'Installments',
    description: 'Payment plans',
    route: '/(tabs)/installments',
  },
  {
    id: 'loans',
    icon: 'wallet',
    title: 'Loans',
    description: 'Apply for loans',
    route: '/(tabs)/loans',
  },
  {
    id: 'properties',
    icon: 'home',
    title: 'Properties',
    description: 'Browse properties',
    route: '/(tabs)/properties',
  },
  {
    id: 'insurance',
    icon: 'shield-checkmark',
    title: 'Insurance',
    description: 'Get insured',
    route: '/(tabs)/insurance',
  },
];

export const CategoriesSection: React.FC = () => {
  const router = useRouter();

  const handleCategoryPress = (category: Category) => {
    if (category.route) {
      router.push(category.route as any);
    } else {
      const routeMap: Record<string, string> = {
        installments: '/(tabs)/installments',
        loans: '/(tabs)/loans',
        properties: '/(tabs)/properties',
        insurance: '/(tabs)/insurance',
      };
      const route = routeMap[category.id] || '/(tabs)/index';
      router.push(route as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            description={category.description}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
