import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLoanById, LoanPlan } from '@/services/loan.api';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';

const RED_PRIMARY = '#D32F2F';
const RED_LIGHT = '#FFEBEE';

export default function LoanDetailScreen() {
  const { planId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loan, setLoan] = useState<LoanPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoan();
  }, [planId]);

  const loadLoan = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const data = await getLoanById(planId as string);
      setLoan(data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load loan details',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(0)}K`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatTenure = (min: number, max: number, unit: string): string => {
    if (unit === 'Years') {
      return `${min} - ${max} Years`;
    }
    return `${min} - ${max} Months`;
  };

  const renderDetailRow = (label: string, value: string | number | undefined, icon?: string) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
      <View style={styles.detailRow} key={label}>
        {icon && <Ionicons name={icon as any} size={18} color="#666" style={{ marginRight: 8 }} />}
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{String(value)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <DetailPageSkeleton />
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loan not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Loan Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Loan Image */}
        {loan.planImage && (
          <View style={styles.imageContainer}>
            <LazyImage
              source={{ uri: loan.planImage }}
              style={styles.loanImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Title and Bank */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{loan.productName}</Text>
            {loan.financingType === 'Islamic' && (
              <View style={styles.islamicBadge}>
                <Ionicons name="star" size={14} color={RED_PRIMARY} />
                <Text style={styles.islamicBadgeText}>Islamic</Text>
              </View>
            )}
          </View>
          <View style={styles.bankRow}>
            <Ionicons name="business" size={20} color={RED_PRIMARY} />
            <Text style={styles.bankName}>{loan.bankName}</Text>
          </View>
        </View>

        {/* Key Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Information</Text>
          <View style={styles.infoGrid}>
            {renderDetailRow('Category', loan.majorCategory, 'pricetag-outline')}
            {renderDetailRow('Sub Category', loan.subCategory, 'folder-outline')}
            {renderDetailRow('Financing Type', loan.financingType, 'card-outline')}
            {renderDetailRow('Rate Type', loan.rateType, 'trending-up-outline')}
          </View>
        </View>

        {/* Financing Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financing Amount</Text>
          <View style={styles.amountCard}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Minimum</Text>
              <Text style={styles.amountValue}>{formatAmount(loan.minFinancingAmount)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Maximum</Text>
              <Text style={styles.amountValue}>{formatAmount(loan.maxFinancingAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Tenure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenure</Text>
          <View style={styles.tenureCard}>
            <Ionicons name="calendar" size={24} color={RED_PRIMARY} />
            <View style={styles.tenureContent}>
              <Text style={styles.tenureValue}>
                {formatTenure(loan.minTenure, loan.maxTenure, loan.tenureUnit)}
              </Text>
              <Text style={styles.tenureUnit}>{loan.tenureUnit}</Text>
            </View>
          </View>
        </View>

        {/* Interest Rate */}
        {loan.indicativeRate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interest Rate</Text>
            <View style={styles.rateCard}>
              <Ionicons name="trending-up" size={24} color={RED_PRIMARY} />
              <Text style={styles.rateValue}>{loan.indicativeRate}</Text>
            </View>
          </View>
        )}

        {/* Eligibility Criteria */}
        {loan.eligibility && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
            <View style={styles.infoGrid}>
              {renderDetailRow('Minimum Age', loan.eligibility.minAge?.toString(), 'person-outline')}
              {renderDetailRow('Maximum Age', loan.eligibility.maxAge?.toString(), 'person-outline')}
              {renderDetailRow('Minimum Income', loan.eligibility.minIncome ? formatAmount(loan.eligibility.minIncome) : undefined, 'cash-outline')}
              {loan.eligibility.employmentType && loan.eligibility.employmentType.length > 0 && (
                <View style={styles.detailRow}>
                  <Ionicons name="briefcase-outline" size={18} color="#666" style={{ marginRight: 8 }} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Employment Type</Text>
                    <Text style={styles.detailValue}>{loan.eligibility.employmentType.join(', ')}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Required Documents */}
        {loan.eligibility?.requiredDocuments && loan.eligibility.requiredDocuments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <View style={styles.documentsList}>
              {loan.eligibility.requiredDocuments.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Ionicons name="document-text" size={16} color={RED_PRIMARY} />
                  <Text style={styles.documentText}>{doc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Target Audience */}
        {loan.targetAudience && loan.targetAudience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Audience</Text>
            <View style={styles.audienceList}>
              {loan.targetAudience.map((audience, index) => (
                <View key={index} style={styles.audienceItem}>
                  <Text style={styles.audienceText}>{audience}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {loan.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{loan.description}</Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => {
            router.push({
              pathname: '/apply-loan',
              params: { planId: loan.planId }
            } as any);
          }}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: RED_PRIMARY,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  loanImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  islamicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  islamicBadgeText: {
    color: RED_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: RED_PRIMARY,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  amountCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  tenureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tenureContent: {
    flex: 1,
  },
  tenureValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  tenureUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  documentsList: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    gap: 8,
  },
  documentText: {
    fontSize: 14,
    color: '#333',
  },
  audienceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceItem: {
    backgroundColor: RED_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  audienceText: {
    fontSize: 12,
    color: RED_PRIMARY,
    fontWeight: '600',
  },
  descriptionText: {
    lineHeight: 22,
    color: '#444',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 20,
  },
  applyButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

