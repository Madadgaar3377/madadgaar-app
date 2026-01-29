import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F8F9FA';
const GRAY_BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

interface CheckboxItem {
  id: string;
  label: string;
  required: boolean;
}

const checkboxSections: { title: string; items: CheckboxItem[] }[] = [
  {
    title: 'A. Mandatory Acceptance – General (All Users)',
    items: [
      { id: 'a1', label: 'I confirm that I am legally eligible to use the Madadgaar platform', required: true },
      { id: 'a2', label: 'I agree to provide accurate, complete, and truthful information', required: true },
      { id: 'a3', label: 'I understand that Madadgaar is a facilitation platform, not a direct service provider', required: true },
      { id: 'a4', label: 'I agree to comply with all applicable laws, regulations, and platform policies', required: true },
      { id: 'a5', label: 'I accept that Madadgaar may suspend or terminate my account for violations', required: true },
    ],
  },
  {
    title: 'B. Partner Company Eligibility Declaration',
    items: [
      { id: 'b1', label: 'I confirm that my company is legally registered', required: true },
      { id: 'b2', label: 'I confirm that my company operates in Property / Financial / Installment / Insurance services', required: true },
      { id: 'b3', label: 'I confirm that I am authorized to register and represent this company', required: true },
      { id: 'b4', label: 'I agree to submit valid registration and verification documents', required: true },
      { id: 'b5', label: 'I understand that approval is subject to Admin verification', required: true },
    ],
  },
  {
    title: 'C. Agent (Expert Partner) Declaration',
    items: [
      { id: 'c1', label: 'I confirm that I am personally authorized or officially associated with a registered company', required: true },
      { id: 'c2', label: 'I agree to handle all leads professionally and ethically', required: true },
      { id: 'c3', label: 'I will not misrepresent pricing, ownership, or authority', required: true },
      { id: 'c4', label: 'I agree not to share user data outside the platform', required: true },
      { id: 'c5', label: 'I understand that commissions are paid only after verified deal completion', required: true },
    ],
  },
  {
    title: 'D. Listings & Deal Responsibility (Agents & Companies)',
    items: [
      { id: 'd1', label: 'I confirm that all listings, prices, and terms are accurate and up to date', required: true },
      { id: 'd2', label: 'I understand that I am fully responsible for the services or properties I list', required: true },
      { id: 'd3', label: 'I agree to handle disputes directly with clients, if required', required: true },
      { id: 'd4', label: 'I accept Madadgaar\'s deal lifecycle and verification rules', required: true },
    ],
  },
  {
    title: 'E. Commission & Payments Acknowledgment',
    items: [
      { id: 'e1', label: 'I understand that commission is locked after verification', required: true },
      { id: 'e2', label: 'I understand that payout is processed only after deal is marked as PAID', required: true },
      { id: 'e3', label: 'I accept the commission structure approved by Admin', required: true },
      { id: 'e4', label: 'I understand that disputes may delay or suspend payouts', required: true },
    ],
  },
  {
    title: 'F. Privacy & Data Protection Consent',
    items: [
      { id: 'f1', label: 'I consent to the collection and use of my data for platform operations', required: true },
      { id: 'f2', label: 'I consent to data sharing only for service delivery and compliance', required: true },
      { id: 'f3', label: 'I understand my data will be stored securely', required: true },
      { id: 'f4', label: 'I understand that Madadgaar does not sell personal data', required: true },
      { id: 'f5', label: 'I have read and agree to the Privacy & Data Protection Policy', required: true },
    ],
  },
  {
    title: 'G. Final Confirmation (Required to Proceed)',
    items: [
      { id: 'g1', label: 'I have read, understood, and agree to the Terms & Conditions', required: true },
      { id: 'g2', label: 'I have read and agree to the Privacy Policy & Data Protection Policy', required: true },
    ],
  },
];

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheckbox = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allRequiredChecked = () => {
    return checkboxSections.every((section) =>
      section.items.every((item) => !item.required || checkedItems[item.id])
    );
  };

  const handleContinue = () => {
    if (allRequiredChecked()) {
      // Navigate back or to next screen
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={RED_PRIMARY} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.subtitle}>Madadgaar Expert Partner Platform</Text>
          <Text style={styles.effectiveDate}>Effective Date: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Terms Content */}
        <View style={styles.section}>
          <Text style={styles.contentTitle}>1. Introduction</Text>
          <Text style={styles.contentText}>
            Madadgaar Expert Partner ("Madadgaar", "Platform", "We", "Us") operates a digital commission-based marketplace that connects Clients (End Users), Madadgaar Expert Partners (Agents), and Partner Companies offering services in:
          </Text>
          <Text style={styles.bulletPoint}>• Property & Real Estate</Text>
          <Text style={styles.bulletPoint}>• Installment Products</Text>
          <Text style={styles.bulletPoint}>• Financial & Loan Services</Text>
          <Text style={styles.bulletPoint}>• Insurance & Insurance Claim Services</Text>
          <Text style={styles.contentText}>
            By accessing, registering, or using the Platform, you agree to be legally bound by these Terms & Conditions.
          </Text>
        </View>

        {/* More sections would go here - abbreviated for space */}
        <View style={styles.section}>
          <Text style={styles.contentTitle}>2. Definitions</Text>
          <Text style={styles.contentText}>
            • Platform: Madadgaar website, mobile application, and related systems{'\n'}
            • User / Client: Any individual requesting services{'\n'}
            • Agent / Expert Partner: An individual registered to assist users and earn commission{'\n'}
            • Partner Company: A legally registered business entity listing services or products{'\n'}
            • Deal: A transaction initiated through the Platform{'\n'}
            • Commission: Payment earned by Agents upon successful deal completion
          </Text>
        </View>

        {/* Checkboxes Section */}
        <View style={styles.checkboxesSection}>
          <Text style={styles.checkboxesTitle}>
            Checkbox of the Terms, Privacy, and Role-Based Declarations
          </Text>

          {checkboxSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.checkboxSection}>
              <Text style={styles.checkboxSectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.checkboxItem}
                  onPress={() => toggleCheckbox(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        checkedItems[item.id] && styles.checkboxChecked,
                      ]}
                    >
                      {checkedItems[item.id] && (
                        <Ionicons name="checkmark" size={16} color={WHITE} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{item.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Full Terms - Additional sections can be added here */}
        <View style={styles.section}>
          <Text style={styles.contentTitle}>3. Eligibility</Text>
          <Text style={styles.contentSubtitle}>3.1 General Eligibility</Text>
          <Text style={styles.contentText}>You must:</Text>
          <Text style={styles.bulletPoint}>• Be legally capable of entering a binding agreement</Text>
          <Text style={styles.bulletPoint}>• Provide accurate and truthful information</Text>
          <Text style={styles.bulletPoint}>• Comply with applicable laws and regulations</Text>
          
          <Text style={styles.contentSubtitle}>3.2 Partner Company Eligibility</Text>
          <Text style={styles.contentText}>
            Only legally registered companies, or duly authorized professionals operating in Property, Financial, Installment, or Insurance sectors may register as Partner Companies. Madadgaar reserves the right to approve, reject, or suspend any registration.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.contentTitle}>4. Platform Role & Limitation of Liability</Text>
          <Text style={styles.contentText}>
            Madadgaar acts solely as a facilitation and marketplace platform. Madadgaar does not own, sell, lease, finance, or insure any product or property. Madadgaar is not a party to transactions between Users, Agents, or Companies. Madadgaar does not guarantee approvals, pricing, timelines, or outcomes. All transactions are conducted directly between Users and Partner Companies.
          </Text>
        </View>

        {/* Continue with other sections... */}
        <View style={styles.section}>
          <Text style={styles.contentTitle}>17. Contact Information</Text>
          <Text style={styles.contentText}>
            For legal or support inquiries:{'\n'}
            📧 support@madadgaar.com.pk
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.contentTitle}>18. Acceptance</Text>
          <Text style={styles.contentText}>
            By registering or using the Platform, you confirm that you have:
          </Text>
          <Text style={styles.bulletPoint}>• Read and understood these Terms & Conditions</Text>
          <Text style={styles.bulletPoint}>• Agreed to comply with all policies</Text>
          <Text style={styles.bulletPoint}>• Accepted the legal obligations herein</Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !allRequiredChecked() && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!allRequiredChecked()}
        >
          <Text style={styles.continueButtonText}>
            {allRequiredChecked() ? 'Register / Continue' : 'Please Accept All Terms'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RED_PRIMARY,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: spacing.xs,
  },
  effectiveDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  contentSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  contentText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  checkboxesSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 12,
    padding: spacing.md,
  },
  checkboxesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing.lg,
  },
  checkboxSection: {
    marginBottom: spacing.lg,
  },
  checkboxSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing.md,
  },
  checkboxItem: {
    marginBottom: spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: GRAY_BORDER,
    backgroundColor: WHITE,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: RED_PRIMARY,
    borderColor: RED_PRIMARY,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: GRAY_BORDER,
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
});
