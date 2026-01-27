import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { PropertyCardSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getAllLoans, LoanPlan } from '@/services/loan.api';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';
const WHITE = '#FFFFFF';
const GRAY_DARK = '#424242';

export default function LoansScreen() {
  const router = useRouter();
  const [loans, setLoans] = useState<LoanPlan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [searchQuery, loans]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await getAllLoans();
      if (response.success && response.data) {
        setLoans(response.data);
        setFilteredLoans(response.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to load loans',
          position: 'top',
          visibilityTime: 2500,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load loans',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const filterLoans = () => {
    if (!searchQuery.trim()) {
      setFilteredLoans(loans);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = loans.filter((loan) => {
      return (
        loan.productName?.toLowerCase().includes(query) ||
        loan.bankName?.toLowerCase().includes(query) ||
        loan.majorCategory?.toLowerCase().includes(query) ||
        loan.subCategory?.toLowerCase().includes(query)
      );
    });
    setFilteredLoans(filtered);
  };

  const formatAmount = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'PKR N/A';
    }
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(0)}K`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatTenure = (min: number | undefined | null, max: number | undefined | null, unit: string | undefined): string => {
    const minVal = min ?? 0;
    const maxVal = max ?? 0;
    if (unit === 'Years') {
      return `${minVal} - ${maxVal} Years`;
    }
    return `${minVal} - ${maxVal} Months`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Loans</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.loanCard}>
                <PropertyCardSkeleton />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loans</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search loans by bank, product, or category..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredLoans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No loans found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Check back later for new loan plans'}
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredLoans.map((loan) => (
              <TouchableOpacity
                key={loan.planId}
                style={styles.loanCard}
                onPress={() => router.push(`/loan-details/${loan.planId}` as any)}
                activeOpacity={0.7}
              >
                {/* Bank Logo / Image */}
                {loan.planImage ? (
                  <LazyImage
                    source={{ uri: loan.planImage }}
                    style={styles.loanImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.loanImage, styles.placeholderImage]}>
                    <Ionicons name="business-outline" size={24} color="#ccc" />
                  </View>
                )}

                <View style={styles.loanContent}>
                  {/* Bank Name */}
                  <View style={styles.bankRow}>
                    <Text style={styles.bankName} numberOfLines={1}>{loan.bankName}</Text>
                    {loan.financingType === 'Islamic' && (
                      <View style={styles.islamicBadge}>
                        <Ionicons name="star" size={10} color={RED_PRIMARY} />
                        <Text style={styles.islamicBadgeText}>Islamic</Text>
                      </View>
                    )}
                  </View>

                  {/* Product Name */}
                  <Text style={styles.productName} numberOfLines={2}>
                    {loan.productName}
                  </Text>

                  {/* Category */}
                  {loan.majorCategory && (
                    <View style={styles.categoryRow}>
                      <Ionicons name="pricetag-outline" size={12} color="#666" />
                      <Text style={styles.categoryText} numberOfLines={1}>
                        {loan.majorCategory}
                      </Text>
                    </View>
                  )}

                  {/* Financing Amount */}
                  {(loan.minFinancingAmount !== undefined || loan.maxFinancingAmount !== undefined) && (
                    <View style={styles.amountRow}>
                      <Ionicons name="cash-outline" size={14} color={RED_PRIMARY} />
                      <Text style={styles.amountText} numberOfLines={1}>
                        {loan.minFinancingAmount !== undefined && loan.maxFinancingAmount !== undefined
                          ? `${formatAmount(loan.minFinancingAmount)} - ${formatAmount(loan.maxFinancingAmount)}`
                          : loan.minFinancingAmount !== undefined
                          ? `From ${formatAmount(loan.minFinancingAmount)}`
                          : loan.maxFinancingAmount !== undefined
                          ? `Up to ${formatAmount(loan.maxFinancingAmount)}`
                          : 'N/A'}
                      </Text>
                    </View>
                  )}

                  {/* View Details Button */}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => router.push(`/loan-details/${loan.planId}` as any)}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: GRAY_DARK,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loanImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loanContent: {
    padding: spacing.sm,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: 4,
  },
  bankName: {
    fontSize: 13,
    fontWeight: '700',
    color: RED_PRIMARY,
    flex: 1,
  },
  islamicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED_LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  islamicBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: RED_PRIMARY,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY_DARK,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: 4,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_DARK,
    flex: 1,
  },
  tenureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: 4,
  },
  tenureText: {
    fontSize: 11,
    color: '#666',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
  },
  rateText: {
    fontSize: 11,
    color: '#666',
  },
  viewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: RED_LIGHT,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: RED_PRIMARY,
  },
});

