import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Text } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.cardSkeleton}>
          <SkeletonLoader width="100%" height={160} borderRadius={16} />
          <View style={styles.cardContent}>
            <SkeletonLoader width="80%" height={16} borderRadius={4} />
            <View style={styles.spacing} />
            <SkeletonLoader width="60%" height={14} borderRadius={4} />
            <View style={styles.spacing} />
            <SkeletonLoader width="70%" height={18} borderRadius={4} />
          </View>
        </View>
      ))}
    </>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <View style={styles.bannerSkeleton}>
      <SkeletonLoader width="100%" height={180} borderRadius={20} />
    </View>
  );
};

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <View style={styles.productSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.productCardSkeleton}>
          <View style={styles.productImageWrapper}>
            <SkeletonLoader width="100%" height={200} borderRadius={12} />
          </View>
          <View style={styles.productCardContent}>
            <SkeletonLoader width="90%" height={18} borderRadius={4} />
            <View style={styles.spacing} />
            <SkeletonLoader width="70%" height={14} borderRadius={4} />
            <View style={styles.spacing} />
            <View style={styles.productPriceRow}>
              <SkeletonLoader width={100} height={20} borderRadius={4} />
              <SkeletonLoader width={80} height={16} borderRadius={4} />
            </View>
            <View style={styles.spacing} />
            <View style={styles.productDetailsRow}>
              <SkeletonLoader width={60} height={12} borderRadius={4} />
              <SkeletonLoader width={60} height={12} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

interface PropertyCardSkeletonProps {
  count?: number;
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <View style={styles.propertySkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.propertyCardSkeleton}>
          <View style={styles.propertyImageSection}>
            <SkeletonLoader width="100%" height={220} borderRadius={0} />
          </View>
          <View style={styles.propertyCardContent}>
            <View style={styles.propertyTitleRow}>
              <SkeletonLoader width="75%" height={20} borderRadius={4} />
              <SkeletonLoader width={60} height={24} borderRadius={12} />
            </View>
            <View style={styles.spacing} />
            <SkeletonLoader width="85%" height={14} borderRadius={4} />
            <View style={styles.spacing} />
            <View style={styles.propertyPriceRow}>
              <SkeletonLoader width={80} height={14} borderRadius={4} />
              <SkeletonLoader width={120} height={22} borderRadius={4} />
            </View>
            <View style={styles.spacing} />
            <View style={styles.propertyDetailsRow}>
              <SkeletonLoader width={50} height={12} borderRadius={4} />
              <SkeletonLoader width={50} height={12} borderRadius={4} />
              <SkeletonLoader width={50} height={12} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

interface PropertyGridSkeletonProps {
  count?: number;
}

export const PropertyGridSkeleton: React.FC<PropertyGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <View style={styles.propertyGridSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.propertyGridCardSkeleton}>
          <View style={styles.propertyGridImageWrapper}>
            <SkeletonLoader width="100%" height={160} borderRadius={12} />
          </View>
          <View style={styles.propertyGridCardContent}>
            <SkeletonLoader width="90%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonLoader width="70%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
            <View style={styles.propertyGridPriceRow}>
              <SkeletonLoader width={80} height={18} borderRadius={4} />
              <SkeletonLoader width={100} height={14} borderRadius={4} />
            </View>
            <View style={styles.propertyGridDetailsRow}>
              <SkeletonLoader width={50} height={12} borderRadius={4} />
              <SkeletonLoader width={50} height={12} borderRadius={4} />
            </View>
            <View style={{ marginTop: 8 }}>
              <SkeletonLoader width={60} height={24} borderRadius={16} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  cardSkeleton: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  spacing: {
    height: 8,
  },
  bannerSkeleton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  productSkeletonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  productCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  productCardContent: {
    padding: 16,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  propertySkeletonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  propertyCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyImageSection: {
    width: '100%',
    height: 220,
    backgroundColor: '#F5F5F5',
  },
  propertyCardContent: {
    padding: 16,
  },
  propertyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  propertyDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  propertyGridSkeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  propertyGridCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyGridImageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#F9F9F9',
  },
  propertyGridCardContent: {
    padding: 12,
    minHeight: 120,
  },
  propertyGridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  propertyGridDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dashboardSkeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  dashboardStatsSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  dashboardStatCardSkeleton: {
    width: (Dimensions.get('window').width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 130,
    justifyContent: 'center',
  },
  dashboardApplicationsSkeleton: {
    marginTop: 16,
  },
  dashboardSectionHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashboardCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  dashboardCardContentSkeleton: {
    flexDirection: 'row',
    padding: 16,
  },
});

interface DashboardSkeletonProps {
  showStats?: boolean;
  showApplications?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ 
  showStats = true, 
  showApplications = true 
}) => {
  return (
    <View style={styles.dashboardSkeletonContainer}>
      {showStats && (
        <View style={styles.dashboardStatsSkeleton}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.dashboardStatCardSkeleton}>
              <SkeletonLoader width={60} height={60} borderRadius={30} />
              <View style={styles.spacing} />
              <SkeletonLoader width={50} height={24} borderRadius={4} />
              <View style={styles.spacing} />
              <SkeletonLoader width={70} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      )}
      {showApplications && (
        <View style={styles.dashboardApplicationsSkeleton}>
          <View style={styles.dashboardSectionHeaderSkeleton}>
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <SkeletonLoader width="60%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonLoader width="40%" height={14} borderRadius={4} />
            </View>
          </View>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.dashboardCardSkeleton}>
              <View style={styles.dashboardCardContentSkeleton}>
                <SkeletonLoader width={120} height={120} borderRadius={16} />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <SkeletonLoader width="80%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                  <SkeletonLoader width="60%" height={12} borderRadius={4} style={{ marginBottom: 12 }} />
                  <SkeletonLoader width="70%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                  <SkeletonLoader width="50%" height={14} borderRadius={4} />
                </View>
              </View>
              <SkeletonLoader width="100%" height={50} borderRadius={0} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const DetailPageSkeleton: React.FC = () => {
  return (
    <View style={styles.detailPageSkeleton}>
      {/* Image skeleton */}
      <SkeletonLoader width="100%" height={300} borderRadius={0} />
      
      {/* Content skeleton */}
      <View style={styles.detailContentSkeleton}>
        <SkeletonLoader width="85%" height={24} borderRadius={4} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="60%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="100%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="90%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="95%" height={16} borderRadius={4} style={{ marginBottom: 24 }} />
        
        {/* Details grid skeleton */}
        <View style={styles.detailGridSkeleton}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.detailGridItem}>
              <SkeletonLoader width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <SkeletonLoader width="70%" height={18} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const detailPageStyles = StyleSheet.create({
  detailPageSkeleton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailContentSkeleton: {
    padding: 20,
  },
  detailGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  detailGridItem: {
    width: '48%',
  },
});

// Merge detail page styles
Object.assign(styles, detailPageStyles);

// Profile Screen Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={profileSkeletonStyles.container}>
      {/* Profile Header Skeleton - matches exact layout */}
      <View style={profileSkeletonStyles.profileHeader}>
        <View style={profileSkeletonStyles.avatarContainer}>
          <SkeletonLoader width={120} height={120} borderRadius={60} />
        </View>
        <View style={profileSkeletonStyles.nameContainer}>
          <View style={profileSkeletonStyles.nameRow}>
            <SkeletonLoader width={150} height={24} borderRadius={4} />
            <View style={{ width: 8 }} />
            <SkeletonLoader width={24} height={24} borderRadius={12} />
          </View>
          <View style={{ height: 4 }} />
          <SkeletonLoader width={100} height={15} borderRadius={4} />
        </View>
      </View>

      {/* Menu Sections Skeleton - matches exact layout */}
      <View style={profileSkeletonStyles.menuSection}>
        <Text style={profileSkeletonStyles.sectionTitle}>ACCOUNT</Text>
        <View style={profileSkeletonStyles.menuGroup}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index}>
              <View style={profileSkeletonStyles.menuItem}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <View style={profileSkeletonStyles.menuText}>
                  <SkeletonLoader width="70%" height={16} borderRadius={4} style={{ marginBottom: 2 }} />
                  <SkeletonLoader width="50%" height={13} borderRadius={4} />
                </View>
                <SkeletonLoader width={20} height={20} borderRadius={10} />
              </View>
              {index < 3 && <View style={profileSkeletonStyles.divider} />}
            </View>
          ))}
        </View>

        <Text style={[profileSkeletonStyles.sectionTitle, { marginTop: 24 }]}>SUPPORT</Text>
        <View style={profileSkeletonStyles.menuGroup}>
          {Array.from({ length: 2 }).map((_, index) => (
            <View key={index}>
              <View style={profileSkeletonStyles.menuItem}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <View style={profileSkeletonStyles.menuText}>
                  <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginBottom: 2 }} />
                  {index === 0 && <SkeletonLoader width="50%" height={13} borderRadius={4} />}
                </View>
                {index === 0 && <SkeletonLoader width={20} height={20} borderRadius={10} />}
              </View>
              {index < 1 && <View style={profileSkeletonStyles.divider} />}
            </View>
          ))}
        </View>
      </View>

      {/* Version text skeleton */}
      <View style={profileSkeletonStyles.versionContainer}>
        <SkeletonLoader width={80} height={12} borderRadius={4} />
      </View>
    </View>
  );
};

// Dashboard Screen Skeleton
export const DashboardSkeletonNew: React.FC = () => {
  return (
    <View style={dashboardSkeletonStyles.container}>
      {/* Header Skeleton - matches exact layout */}
      <View style={dashboardSkeletonStyles.header}>
        <SkeletonLoader width={120} height={24} borderRadius={4} />
      </View>

      {/* Tabs Skeleton - matches exact layout */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={dashboardSkeletonStyles.tabsScrollContainer}
        contentContainerStyle={dashboardSkeletonStyles.tabsContent}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={dashboardSkeletonStyles.tab}>
            <SkeletonLoader width={90} height={32} borderRadius={20} />
          </View>
        ))}
      </ScrollView>

      {/* Application Cards Skeleton - matches exact layout */}
      <ScrollView
        style={dashboardSkeletonStyles.scrollView}
        contentContainerStyle={dashboardSkeletonStyles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={dashboardSkeletonStyles.card}>
            <SkeletonLoader width="100%" height={180} borderRadius={0} />
            <View style={dashboardSkeletonStyles.cardContent}>
              <View style={dashboardSkeletonStyles.cardHeader}>
                <View style={dashboardSkeletonStyles.cardTitleContainer}>
                  <SkeletonLoader width="60%" height={16} borderRadius={4} />
                  <SkeletonLoader width={70} height={24} borderRadius={12} />
                </View>
              </View>
              <View style={dashboardSkeletonStyles.cardMeta}>
                <SkeletonLoader width="40%" height={12} borderRadius={4} />
                <View style={{ width: 4 }} />
                <SkeletonLoader width="30%" height={12} borderRadius={4} />
              </View>
              <View style={dashboardSkeletonStyles.viewDetailsButton}>
                <SkeletonLoader width={100} height={14} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const profileSkeletonStyles = StyleSheet.create({
  container: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  nameContainer: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  spacing: {
    height: 12,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 68,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
});

const dashboardSkeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsScrollContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

