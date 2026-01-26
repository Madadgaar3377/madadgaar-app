import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllInstallments, Installment } from '@/services/installment.api';
import { spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F8F9FA';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';

interface InstallmentsSectionProps {
  limit?: number;
}

export const InstallmentsSection: React.FC<InstallmentsSectionProps> = ({ limit = 5 }) => {
  const router = useRouter();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        setLoading(true);
        const data = await getAllInstallments();
        setInstallments(data.slice(0, limit));
      } catch (error) {
        setInstallments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, [limit]);

  const handleSeeMore = () => {
    router.push('/(tabs)/installments');
  };

  const handleInstallmentPress = (installment: Installment) => {
    if (installment.id) {
      router.push(`/product-details/${installment.id}` as any);
    } else {
      router.push('/(tabs)/installments');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Featured Installments</Text>
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

  if (installments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Featured Installments</Text>
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
        {installments.map((installment) => (
          <TouchableOpacity
            key={installment.id || Math.random()}
            style={styles.card}
            onPress={() => handleInstallmentPress(installment)}
            activeOpacity={0.9}
          >
            {installment.imageUrl || (installment.images && installment.images.length > 0) ? (
              <LazyImage
                source={{ uri: installment.imageUrl || installment.images?.[0] }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Ionicons name="card-outline" size={28} color={TEXT_TERTIARY} />
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {installment.title || 'Installment Plan'}
              </Text>

              <View style={styles.priceRow}>
                {installment.monthlyPayment ? (
                  <Text style={styles.priceValue}>
                    PKR {installment.monthlyPayment.toLocaleString()}
                  </Text>
                ) : installment.totalAmount ? (
                  <Text style={styles.priceValue}>
                    PKR {installment.totalAmount.toLocaleString()}
                  </Text>
                ) : (
                  <Text style={styles.priceValue}>Price on request</Text>
                )}
                <Text style={styles.priceLabel}>/month</Text>
              </View>

              {installment.tenure && (
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={12} color={TEXT_SECONDARY} />
                  <Text style={styles.metaText}>{installment.tenure} Months</Text>
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    gap: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: RED_PRIMARY,
  },
  priceLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
});
