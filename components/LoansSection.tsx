import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllLoans, LoanPlan } from '@/services/loan.api';
import { spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F8F9FA';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';

interface LoansSectionProps {
  limit?: number;
}

export const LoansSection: React.FC<LoansSectionProps> = ({ limit = 5 }) => {
  const router = useRouter();
  const [loans, setLoans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const response = await getAllLoans();
        if (response.success && response.data) {
          setLoans(response.data.slice(0, limit));
        } else {
          setLoans([]);
        }
      } catch (error) {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [limit]);

  const handleSeeMore = () => {
    router.push('/(tabs)/loans');
  };

  const handleLoanPress = (loan: LoanPlan) => {
    if (loan.planId) {
      router.push(`/loan-details/${loan.planId}` as any);
    } else {
      router.push('/(tabs)/loans');
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Featured Loans</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <CardSkeleton count={3} />
        </ScrollView>
      </View>
    );
  }

  if (loans.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Featured Loans</Text>
        <TouchableOpacity onPress={handleSeeMore} style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={RED_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loans.map((loan) => (
          <TouchableOpacity
            key={loan.planId || Math.random()}
            style={styles.card}
            onPress={() => handleLoanPress(loan)}
            activeOpacity={0.9}
          >
            {loan.planImage ? (
              <LazyImage
                source={{ uri: loan.planImage }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Ionicons name="business-outline" size={28} color={TEXT_TERTIARY} />
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {loan.productName || 'Loan Plan'}
              </Text>

              {loan.bankName && (
                <View style={styles.bankRow}>
                  <Ionicons name="business-outline" size={12} color={TEXT_SECONDARY} />
                  <Text style={styles.bankText} numberOfLines={1}>
                    {loan.bankName}
                  </Text>
                </View>
              )}

              <View style={styles.amountRow}>
                {loan.minFinancingAmount !== undefined && loan.maxFinancingAmount !== undefined ? (
                  <Text style={styles.amountValue}>
                    PKR {formatAmount(loan.minFinancingAmount)} - {formatAmount(loan.maxFinancingAmount)}
                  </Text>
                ) : loan.minFinancingAmount !== undefined ? (
                  <Text style={styles.amountValue}>
                    From PKR {formatAmount(loan.minFinancingAmount)}
                  </Text>
                ) : loan.maxFinancingAmount !== undefined ? (
                  <Text style={styles.amountValue}>
                    Up to PKR {formatAmount(loan.maxFinancingAmount)}
                  </Text>
                ) : (
                  <Text style={styles.amountValue}>Amount on request</Text>
                )}
              </View>

              {loan.indicativeRate && (
                <View style={styles.rateRow}>
                  <Ionicons name="trending-up-outline" size={12} color={TEXT_SECONDARY} />
                  <Text style={styles.rateText}>{loan.indicativeRate}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: RED_PRIMARY,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  card: {
    width: 280,
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: GRAY_LIGHT,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  bankText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '400',
    flex: 1,
  },
  amountRow: {
    marginBottom: spacing.sm,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: RED_PRIMARY,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  rateText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
});
