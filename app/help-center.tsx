import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon?: string;
}

const FAQ_DATA: FAQ[] = [
  {
    id: '1',
    question: 'How do I apply for an installment plan?',
    answer: 'To apply for an installment plan, browse through our available products, select the one you like, and click "Apply Now". Fill in your personal and financial details, and submit the application. Our team will review and get back to you within 24-48 hours.',
    category: 'Installments',
    icon: 'card-outline',
  },
  {
    id: '2',
    question: 'What documents do I need for a loan application?',
    answer: 'For loan applications, you typically need: CNIC (front and back), salary slip or income proof, bank statements (last 3-6 months), and any additional documents specific to the loan type. All documents should be clear and valid.',
    category: 'Loans',
    icon: 'document-text-outline',
  },
  {
    id: '3',
    question: 'How long does it take to get approved?',
    answer: 'Approval times vary by application type. Installment plans are usually reviewed within 24-48 hours. Loan applications may take 3-7 business days. Property applications typically take 2-5 business days. You will receive notifications about your application status.',
    category: 'General',
    icon: 'time-outline',
  },
  {
    id: '4',
    question: 'Can I track my application status?',
    answer: 'Yes! You can track all your applications in the Dashboard section. Each application shows its current status: Pending, In Progress, Approved, or Rejected. You can also view detailed information by clicking "View Details" on any application.',
    category: 'General',
    icon: 'checkmark-circle-outline',
  },
  {
    id: '5',
    question: 'What payment methods are accepted?',
    answer: 'We accept various payment methods including bank transfers, credit/debit cards, and mobile banking. Payment options are displayed during the application process. You can also set up automatic payments for installment plans.',
    category: 'Payments',
    icon: 'wallet-outline',
  },
  {
    id: '6',
    question: 'How do I update my profile information?',
    answer: 'Go to your Profile screen, tap on "Personal Information", and you can edit your name, username, phone number, WhatsApp, CNIC, and address. Changes are saved immediately after you tap "Save Changes".',
    category: 'Account',
    icon: 'person-outline',
  },
  {
    id: '7',
    question: 'What if I forget my password?',
    answer: 'On the login screen, tap "Forgot Password?", enter your email address, and we will send you an OTP. Verify the OTP and set a new password. Make sure to use a strong password for better security.',
    category: 'Account',
    icon: 'lock-closed-outline',
  },
  {
    id: '8',
    question: 'How do I contact customer support?',
    answer: 'You can reach our customer support team through the Help Center, email us at support@madadgaar.com.pk, or call our helpline at 0800-MADADGAAR. Our support team is available Monday to Saturday, 9 AM to 6 PM.',
    category: 'Support',
    icon: 'headset-outline',
  },
  {
    id: '9',
    question: 'Can I cancel my application?',
    answer: 'Yes, you can cancel pending applications from your Dashboard. However, once an application is approved or in progress, you may need to contact support for cancellation. Refund policies vary by application type.',
    category: 'General',
    icon: 'close-circle-outline',
  },
  {
    id: '10',
    question: 'What are the eligibility criteria for loans?',
    answer: 'Eligibility criteria vary by loan type and bank. Generally, you need to be 21-65 years old, have a stable income source, valid CNIC, and meet minimum income requirements. Specific criteria are shown on each loan plan\'s details page.',
    category: 'Loans',
    icon: 'checkmark-done-outline',
  },
];

const CATEGORIES = [
  { name: 'All', icon: 'apps-outline' },
  { name: 'General', icon: 'help-circle-outline' },
  { name: 'Installments', icon: 'card-outline' },
  { name: 'Loans', icon: 'cash-outline' },
  { name: 'Properties', icon: 'home-outline' },
  { name: 'Payments', icon: 'wallet-outline' },
  { name: 'Account', icon: 'person-outline' },
  { name: 'Support', icon: 'headset-outline' },
];

const CATEGORY_COLORS: { [key: string]: string } = {
  'Installments': '#FF6B6B',
  'Loans': '#4ECDC4',
  'Properties': '#45B7D1',
  'Payments': '#FFA07A',
  'Account': '#98D8C8',
  'Support': '#F7DC6F',
  'General': '#BB8FCE',
};

export default function HelpCenterScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = CATEGORIES.find(c => c.name === categoryName);
    return category?.icon || 'help-circle-outline';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Help Center</Text>
          <Text style={styles.headerSubtitle}>We're here to help</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Search Section */}
      <View style={styles.heroSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.name;
            return (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.name)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.categoryIconContainer,
                  isActive && styles.categoryIconContainerActive,
                ]}>
                  <Ionicons
                    name={category.icon as any}
                    size={18}
                    color={isActive ? colors.white : colors.accent}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Count */}
      {filteredFAQs.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
          </Text>
        </View>
      )}

      {/* FAQs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="search-outline" size={64} color={colors.gray300} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try different keywords' : 'Try selecting a different category'}
            </Text>
            {(searchQuery || selectedCategory !== 'All') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {filteredFAQs.map((faq, index) => {
              const isExpanded = expandedFAQ === faq.id;
              const categoryColor = CATEGORY_COLORS[faq.category] || colors.accent;
              
              return (
                <TouchableOpacity
                  key={faq.id}
                  style={[
                    styles.faqCard,
                    isExpanded && styles.faqCardExpanded,
                  ]}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.faqCardContent}>
                    <View style={styles.faqHeader}>
                      <View style={[styles.faqIconContainer, { backgroundColor: `${categoryColor}15` }]}>
                        <Ionicons
                          name={faq.icon as any || 'help-circle-outline'}
                          size={22}
                          color={categoryColor}
                        />
                      </View>
                      <View style={styles.faqTextContainer}>
                        <View style={styles.faqCategoryRow}>
                          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
                            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                              {faq.category}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.faqQuestion} numberOfLines={isExpanded ? undefined : 2}>
                          {faq.question}
                        </Text>
                      </View>
                      <View style={[
                        styles.chevronContainer,
                        isExpanded && styles.chevronContainerExpanded,
                      ]}>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </View>
                    </View>
                    
                    {isExpanded && (
                      <View style={styles.faqAnswer}>
                        <View style={styles.faqAnswerDivider} />
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Contact Support Section */}
            <View style={styles.contactSection}>
              <View style={styles.contactCard}>
                <View style={styles.contactIconWrapper}>
                  <View style={styles.contactIconContainer}>
                    <Ionicons name="headset" size={32} color={colors.white} />
                  </View>
                </View>
                <Text style={styles.contactTitle}>Still need help?</Text>
                <Text style={styles.contactDescription}>
                  Our friendly support team is available to assist you with any questions or concerns.
                </Text>
                <View style={styles.contactButtonsRow}>
                  <TouchableOpacity style={styles.contactButtonSecondary} activeOpacity={0.8}>
                    <Ionicons name="call-outline" size={18} color={colors.accent} />
                    <Text style={styles.contactButtonSecondaryText}>Call Us</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButtonPrimary} activeOpacity={0.8}>
                    <Ionicons name="mail-outline" size={18} color={colors.white} />
                    <Text style={styles.contactButtonPrimaryText}>Email Us</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  heroSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.gray200,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  clearButton: {
    padding: spacing.xs,
  },
  categoriesWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.accent,
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconContainerActive: {
    backgroundColor: colors.accent,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 140,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  faqCardExpanded: {
    borderColor: colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  faqCardContent: {
    padding: spacing.lg,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  faqIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqTextContainer: {
    flex: 1,
  },
  faqCategoryRow: {
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.gray100,
    transform: [{ rotate: '0deg' }],
  },
  chevronContainerExpanded: {
    backgroundColor: '#FFEBEE',
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  faqAnswerDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginBottom: spacing.md,
  },
  faqAnswerText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  clearFiltersButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  contactSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  contactIconWrapper: {
    marginBottom: spacing.md,
  },
  contactIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  contactDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  contactButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  contactButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  contactButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  contactButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
