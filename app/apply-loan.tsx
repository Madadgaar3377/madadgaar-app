import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DatePicker } from '@/components/common/DatePicker';
import { applyLoan, ApplyLoanPayload } from '@/services/loan.api';
import { getLoanById, LoanPlan } from '@/services/loan.api';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing } from '@/theme';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import Toast from 'react-native-toast-message';

const RED_PRIMARY = '#D32F2F';

export default function ApplyLoanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const { name, email, userProfile, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [loan, setLoan] = useState<LoanPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [applicantInfo, setApplicantInfo] = useState({
    fullName: '',
    fatherOrHusbandName: '',
    cnicNumber: '',
    cnicExpiryDate: '',
    dateOfBirth: '',
    maritalStatus: 'Single' as 'Single' | 'Married',
    numberOfDependents: '',
  });

  const [contactInfo, setContactInfo] = useState({
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    currentAddress: '',
    city: '',
    residenceType: 'Owned' as 'Owned' | 'Rented' | 'Family',
  });

  const [incomeDetails, setIncomeDetails] = useState({
    incomeType: 'Salaried' as 'Salaried' | 'Business' | 'Self-Employed',
    employerName: '',
    designation: '',
    jobStatus: 'Permanent' as 'Permanent' | 'Contract',
    monthlyNetSalary: '',
    businessName: '',
    natureOfBusiness: '',
    yearsInBusiness: '',
    ntnAvailable: false,
    approxMonthlyIncome: '',
  });

  const [bankingDetails, setBankingDetails] = useState({
    bankNames: '',
    accountType: 'Saving' as 'Saving' | 'Current',
    existingLoanType: '',
    existingLoanBank: '',
    existingLoanInstallment: '',
  });

  const [loanRequirement, setLoanRequirement] = useState({
    loanType: 'Home' as 'Home' | 'Business' | 'Auto' | 'Personal',
    requiredAmount: '',
    preferredTenure: '',
    financingPreference: 'Either' as 'Conventional' | 'Islamic' | 'Either',
  });

  const [islamicFinancing, setIslamicFinancing] = useState({
    preferredMode: 'Not Sure' as 'Murabaha' | 'Musharakah' | 'Diminishing Musharakah' | 'Ijarah' | 'Salam' | 'Istisna' | 'Not Sure',
    shariahTermsAccepted: true,
  });

  const [security, setSecurity] = useState({
    securityOffered: 'None' as 'Property' | 'Vehicle' | 'Guarantee' | 'None',
    estimatedValue: '',
  });

  const [declarations, setDeclarations] = useState({
    creditCheckConsent: true,
    informationConfirmed: true,
    applicantSignature: '',
  });

  const [applicationNote, setApplicationNote] = useState('');

  useEffect(() => {
    loadLoan();
  }, [planId]);

  useEffect(() => {
    // Pre-fill form with user data
    if (name) setApplicantInfo((prev) => ({ ...prev, fullName: name }));
    if (email) setContactInfo((prev) => ({ ...prev, email }));
    if (userProfile?.phoneNumber) setContactInfo((prev) => ({ ...prev, mobileNumber: userProfile.phoneNumber }));
    if (userProfile?.WhatsappNumber) setContactInfo((prev) => ({ ...prev, whatsappNumber: userProfile.WhatsappNumber }));
    if (userProfile?.Address) setContactInfo((prev) => ({ ...prev, currentAddress: userProfile.Address }));
    if (userProfile?.cnicNumber) setApplicantInfo((prev) => ({ ...prev, cnicNumber: userProfile.cnicNumber }));
  }, [name, email, userProfile]);

  const loadLoan = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const data = await getLoanById(planId as string);
      setLoan(data);
      if (data) {
        // Pre-fill loan requirement based on loan plan
        setLoanRequirement((prev) => ({
          ...prev,
          financingPreference: data.financingType === 'Islamic' ? 'Islamic' : 'Either',
        }));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load loan details',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Required fields validation
    if (!applicantInfo.fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Full name is required',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    if (!applicantInfo.cnicNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'CNIC number is required',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    if (!contactInfo.mobileNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Mobile number is required',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    if (!loanRequirement.requiredAmount.trim() || isNaN(Number(loanRequirement.requiredAmount))) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Valid required amount is needed',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    if (!declarations.creditCheckConsent || !declarations.informationConfirmed) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please accept all declarations',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    if (!declarations.applicantSignature.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Applicant signature is required',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!loan || !planId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Loan information is missing',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload: ApplyLoanPayload = {
        planId: planId as string,
        applicantInfo: {
          fullName: applicantInfo.fullName,
          fatherOrHusbandName: applicantInfo.fatherOrHusbandName || undefined,
          cnicNumber: applicantInfo.cnicNumber,
          cnicExpiryDate: applicantInfo.cnicExpiryDate || undefined,
          dateOfBirth: applicantInfo.dateOfBirth || undefined,
          maritalStatus: applicantInfo.maritalStatus,
          numberOfDependents: applicantInfo.numberOfDependents ? Number(applicantInfo.numberOfDependents) : undefined,
        },
        contactInfo: {
          mobileNumber: contactInfo.mobileNumber,
          whatsappNumber: contactInfo.whatsappNumber || undefined,
          email: contactInfo.email || undefined,
          currentAddress: contactInfo.currentAddress || undefined,
          city: contactInfo.city || undefined,
          residenceType: contactInfo.residenceType,
        },
        incomeDetails: {
          incomeType: incomeDetails.incomeType,
          employerName: incomeDetails.employerName || undefined,
          designation: incomeDetails.designation || undefined,
          jobStatus: incomeDetails.jobStatus,
          monthlyNetSalary: incomeDetails.monthlyNetSalary ? Number(incomeDetails.monthlyNetSalary) : undefined,
          businessName: incomeDetails.businessName || undefined,
          natureOfBusiness: incomeDetails.natureOfBusiness || undefined,
          yearsInBusiness: incomeDetails.yearsInBusiness ? Number(incomeDetails.yearsInBusiness) : undefined,
          ntnAvailable: incomeDetails.ntnAvailable,
          approxMonthlyIncome: incomeDetails.approxMonthlyIncome ? Number(incomeDetails.approxMonthlyIncome) : undefined,
        },
        bankingDetails: {
          bankNames: bankingDetails.bankNames ? bankingDetails.bankNames.split(',').map(b => b.trim()) : undefined,
          accountType: bankingDetails.accountType,
          existingLoan: bankingDetails.existingLoanType ? {
            loanType: bankingDetails.existingLoanType,
            bankName: bankingDetails.existingLoanBank || undefined,
            monthlyInstallment: bankingDetails.existingLoanInstallment ? Number(bankingDetails.existingLoanInstallment) : undefined,
          } : undefined,
        },
        loanRequirement: {
          loanType: loanRequirement.loanType,
          requiredAmount: Number(loanRequirement.requiredAmount),
          preferredTenure: loanRequirement.preferredTenure ? Number(loanRequirement.preferredTenure) : undefined,
          financingPreference: loanRequirement.financingPreference,
        },
        islamicFinancing: loanRequirement.financingPreference === 'Islamic' ? {
          preferredMode: islamicFinancing.preferredMode,
          shariahTermsAccepted: islamicFinancing.shariahTermsAccepted,
        } : undefined,
        security: security.securityOffered !== 'None' ? {
          securityOffered: security.securityOffered,
          estimatedValue: security.estimatedValue ? Number(security.estimatedValue) : undefined,
        } : undefined,
        declarations: {
          creditCheckConsent: declarations.creditCheckConsent,
          informationConfirmed: declarations.informationConfirmed,
          applicantSignature: declarations.applicantSignature,
          signedAt: new Date().toISOString(),
        },
        applicationNote: applicationNote.trim() || undefined,
      };

      const response = await applyLoan(payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Application Submitted',
          text2: 'Your loan application has been submitted successfully. We will review it and get back to you soon.',
          position: 'top',
          visibilityTime: 2500,
          onHide: () => {
            router.back();
          },
        });
      } else {
        throw new Error(response.message || 'Failed to submit application');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message || 'Failed to submit application. Please try again.',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="Apply for Loan"
          message="Login or signup to submit your loan application"
          redirectPath={`/apply-loan${planId ? `?planId=${planId}` : ''}`}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DetailPageSkeleton />
      </SafeAreaView>
    );
  }

  if (!loan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loan not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Loan</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Loan Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.loanTitle}>{loan.productName}</Text>
              <Text style={styles.bankName}>{loan.bankName}</Text>
              <Text style={styles.categoryText}>{loan.majorCategory}</Text>
            </View>
          </View>

          {/* Applicant Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applicant Information</Text>
            <Input
              label="Full Name *"
              value={applicantInfo.fullName}
              onChangeText={(value) => setApplicantInfo((prev) => ({ ...prev, fullName: value }))}
              placeholder="Enter your full name"
            />
            <Input
              label="Father/Husband Name"
              value={applicantInfo.fatherOrHusbandName}
              onChangeText={(value) => setApplicantInfo((prev) => ({ ...prev, fatherOrHusbandName: value }))}
              placeholder="Enter father or husband name"
            />
            <Input
              label="CNIC Number *"
              value={applicantInfo.cnicNumber}
              onChangeText={(value) => setApplicantInfo((prev) => ({ ...prev, cnicNumber: value }))}
              placeholder="42101-1234567-1"
            />
            <DatePicker
              label="CNIC Expiry Date"
              value={applicantInfo.cnicExpiryDate}
              onChange={(value) => setApplicantInfo((prev) => ({ ...prev, cnicExpiryDate: value }))}
              placeholder="Select CNIC expiry date"
            />
            <DatePicker
              label="Date of Birth"
              value={applicantInfo.dateOfBirth}
              onChange={(value) => setApplicantInfo((prev) => ({ ...prev, dateOfBirth: value }))}
              placeholder="Select date of birth"
              maximumDate={new Date()}
            />
            <View style={styles.row}>
              <Text style={styles.label}>Marital Status</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioOption, applicantInfo.maritalStatus === 'Single' && styles.radioOptionActive]}
                  onPress={() => setApplicantInfo((prev) => ({ ...prev, maritalStatus: 'Single' }))}
                >
                  <Text style={[styles.radioText, applicantInfo.maritalStatus === 'Single' && styles.radioTextActive]}>Single</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioOption, applicantInfo.maritalStatus === 'Married' && styles.radioOptionActive]}
                  onPress={() => setApplicantInfo((prev) => ({ ...prev, maritalStatus: 'Married' }))}
                >
                  <Text style={[styles.radioText, applicantInfo.maritalStatus === 'Married' && styles.radioTextActive]}>Married</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Input
              label="Number of Dependents"
              value={applicantInfo.numberOfDependents}
              onChangeText={(value) => setApplicantInfo((prev) => ({ ...prev, numberOfDependents: value }))}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Input
              label="Mobile Number *"
              value={contactInfo.mobileNumber}
              onChangeText={(value) => setContactInfo((prev) => ({ ...prev, mobileNumber: value }))}
              placeholder="03001234567"
              keyboardType="phone-pad"
            />
            <Input
              label="WhatsApp Number"
              value={contactInfo.whatsappNumber}
              onChangeText={(value) => setContactInfo((prev) => ({ ...prev, whatsappNumber: value }))}
              placeholder="03001234567"
              keyboardType="phone-pad"
            />
            <Input
              label="Email"
              value={contactInfo.email}
              onChangeText={(value) => setContactInfo((prev) => ({ ...prev, email: value }))}
              placeholder="email@example.com"
              keyboardType="email-address"
            />
            <Input
              label="Current Address"
              value={contactInfo.currentAddress}
              onChangeText={(value) => setContactInfo((prev) => ({ ...prev, currentAddress: value }))}
              placeholder="House #123, Street 5, Block A"
              multiline
            />
            <Input
              label="City"
              value={contactInfo.city}
              onChangeText={(value) => setContactInfo((prev) => ({ ...prev, city: value }))}
              placeholder="Lahore"
            />
            <View style={styles.row}>
              <Text style={styles.label}>Residence Type</Text>
              <View style={styles.radioGroup}>
                {['Owned', 'Rented', 'Family'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, contactInfo.residenceType === type && styles.radioOptionActive]}
                    onPress={() => setContactInfo((prev) => ({ ...prev, residenceType: type as any }))}
                  >
                    <Text style={[styles.radioText, contactInfo.residenceType === type && styles.radioTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Income Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Income Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Income Type</Text>
              <View style={styles.radioGroup}>
                {['Salaried', 'Business', 'Self-Employed'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, incomeDetails.incomeType === type && styles.radioOptionActive]}
                    onPress={() => setIncomeDetails((prev) => ({ ...prev, incomeType: type as any }))}
                  >
                    <Text style={[styles.radioText, incomeDetails.incomeType === type && styles.radioTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {incomeDetails.incomeType === 'Salaried' && (
              <>
                <Input
                  label="Employer Name"
                  value={incomeDetails.employerName}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, employerName: value }))}
                  placeholder="ABC Corporation"
                />
                <Input
                  label="Designation"
                  value={incomeDetails.designation}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, designation: value }))}
                  placeholder="Senior Manager"
                />
                <View style={styles.row}>
                  <Text style={styles.label}>Job Status</Text>
                  <View style={styles.radioGroup}>
                    {['Permanent', 'Contract'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.radioOption, incomeDetails.jobStatus === status && styles.radioOptionActive]}
                        onPress={() => setIncomeDetails((prev) => ({ ...prev, jobStatus: status as any }))}
                      >
                        <Text style={[styles.radioText, incomeDetails.jobStatus === status && styles.radioTextActive]}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Input
                  label="Monthly Net Salary"
                  value={incomeDetails.monthlyNetSalary}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, monthlyNetSalary: value }))}
                  placeholder="150000"
                  keyboardType="numeric"
                />
              </>
            )}

            {(incomeDetails.incomeType === 'Business' || incomeDetails.incomeType === 'Self-Employed') && (
              <>
                <Input
                  label="Business Name"
                  value={incomeDetails.businessName}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, businessName: value }))}
                  placeholder="Business Name"
                />
                <Input
                  label="Nature of Business"
                  value={incomeDetails.natureOfBusiness}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, natureOfBusiness: value }))}
                  placeholder="Retail, Manufacturing, etc."
                />
                <Input
                  label="Years in Business"
                  value={incomeDetails.yearsInBusiness}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, yearsInBusiness: value }))}
                  placeholder="5"
                  keyboardType="numeric"
                />
                <View style={styles.switchRow}>
                  <Text style={styles.label}>NTN Available</Text>
                  <Switch
                    value={incomeDetails.ntnAvailable}
                    onValueChange={(value) => setIncomeDetails((prev) => ({ ...prev, ntnAvailable: value }))}
                    trackColor={{ false: '#ccc', true: RED_PRIMARY }}
                  />
                </View>
                <Input
                  label="Approximate Monthly Income"
                  value={incomeDetails.approxMonthlyIncome}
                  onChangeText={(value) => setIncomeDetails((prev) => ({ ...prev, approxMonthlyIncome: value }))}
                  placeholder="200000"
                  keyboardType="numeric"
                />
              </>
            )}
          </View>

          {/* Banking Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking Details</Text>
            <Input
              label="Bank Names (comma separated)"
              value={bankingDetails.bankNames}
              onChangeText={(value) => setBankingDetails((prev) => ({ ...prev, bankNames: value }))}
              placeholder="HBL, MCB"
            />
            <View style={styles.row}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.radioGroup}>
                {['Saving', 'Current'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, bankingDetails.accountType === type && styles.radioOptionActive]}
                    onPress={() => setBankingDetails((prev) => ({ ...prev, accountType: type as any }))}
                  >
                    <Text style={[styles.radioText, bankingDetails.accountType === type && styles.radioTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Input
              label="Existing Loan Type (if any)"
              value={bankingDetails.existingLoanType}
              onChangeText={(value) => setBankingDetails((prev) => ({ ...prev, existingLoanType: value }))}
              placeholder="Car Loan"
            />
            <Input
              label="Existing Loan Bank"
              value={bankingDetails.existingLoanBank}
              onChangeText={(value) => setBankingDetails((prev) => ({ ...prev, existingLoanBank: value }))}
              placeholder="HBL"
            />
            <Input
              label="Monthly Installment"
              value={bankingDetails.existingLoanInstallment}
              onChangeText={(value) => setBankingDetails((prev) => ({ ...prev, existingLoanInstallment: value }))}
              placeholder="25000"
              keyboardType="numeric"
            />
          </View>

          {/* Loan Requirement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan Requirement</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Loan Type</Text>
              <View style={styles.radioGroup}>
                {['Home', 'Business', 'Auto', 'Personal'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, loanRequirement.loanType === type && styles.radioOptionActive]}
                    onPress={() => setLoanRequirement((prev) => ({ ...prev, loanType: type as any }))}
                  >
                    <Text style={[styles.radioText, loanRequirement.loanType === type && styles.radioTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Input
              label="Required Amount *"
              value={loanRequirement.requiredAmount}
              onChangeText={(value) => setLoanRequirement((prev) => ({ ...prev, requiredAmount: value }))}
              placeholder="5000000"
              keyboardType="numeric"
            />
            <Input
              label="Preferred Tenure (Months)"
              value={loanRequirement.preferredTenure}
              onChangeText={(value) => setLoanRequirement((prev) => ({ ...prev, preferredTenure: value }))}
              placeholder="180"
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <Text style={styles.label}>Financing Preference</Text>
              <View style={styles.radioGroup}>
                {['Conventional', 'Islamic', 'Either'].map((pref) => (
                  <TouchableOpacity
                    key={pref}
                    style={[styles.radioOption, loanRequirement.financingPreference === pref && styles.radioOptionActive]}
                    onPress={() => setLoanRequirement((prev) => ({ ...prev, financingPreference: pref as any }))}
                  >
                    <Text style={[styles.radioText, loanRequirement.financingPreference === pref && styles.radioTextActive]}>{pref}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Islamic Financing (if applicable) */}
          {loanRequirement.financingPreference === 'Islamic' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Islamic Financing</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Preferred Mode</Text>
                <View style={styles.selectContainer}>
                  {['Murabaha', 'Musharakah', 'Diminishing Musharakah', 'Ijarah', 'Salam', 'Istisna', 'Not Sure'].map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.selectOption, islamicFinancing.preferredMode === mode && styles.selectOptionActive]}
                      onPress={() => setIslamicFinancing((prev) => ({ ...prev, preferredMode: mode as any }))}
                    >
                      <Text style={[styles.selectText, islamicFinancing.preferredMode === mode && styles.selectTextActive]}>{mode}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Shariah Terms Accepted</Text>
                <Switch
                  value={islamicFinancing.shariahTermsAccepted}
                  onValueChange={(value) => setIslamicFinancing((prev) => ({ ...prev, shariahTermsAccepted: value }))}
                  trackColor={{ false: '#ccc', true: RED_PRIMARY }}
                />
              </View>
            </View>
          )}

          {/* Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Security Offered</Text>
              <View style={styles.radioGroup}>
                {['Property', 'Vehicle', 'Guarantee', 'None'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, security.securityOffered === type && styles.radioOptionActive]}
                    onPress={() => setSecurity((prev) => ({ ...prev, securityOffered: type as any }))}
                  >
                    <Text style={[styles.radioText, security.securityOffered === type && styles.radioTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {security.securityOffered !== 'None' && (
              <Input
                label="Estimated Value"
                value={security.estimatedValue}
                onChangeText={(value) => setSecurity((prev) => ({ ...prev, estimatedValue: value }))}
                placeholder="8000000"
                keyboardType="numeric"
              />
            )}
          </View>

          {/* Declarations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Declarations</Text>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Credit Check Consent *</Text>
              <Switch
                value={declarations.creditCheckConsent}
                onValueChange={(value) => setDeclarations((prev) => ({ ...prev, creditCheckConsent: value }))}
                trackColor={{ false: '#ccc', true: RED_PRIMARY }}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Information Confirmed *</Text>
              <Switch
                value={declarations.informationConfirmed}
                onValueChange={(value) => setDeclarations((prev) => ({ ...prev, informationConfirmed: value }))}
                trackColor={{ false: '#ccc', true: RED_PRIMARY }}
              />
            </View>
            <Input
              label="Applicant Signature *"
              value={declarations.applicantSignature}
              onChangeText={(value) => setDeclarations((prev) => ({ ...prev, applicantSignature: value }))}
              placeholder="Enter your full name as signature"
            />
          </View>

          {/* Application Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Input
              label="Application Note (Optional)"
              value={applicationNote}
              onChangeText={setApplicationNote}
              placeholder="Any additional information you'd like to provide"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title="Submit Application"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: RED_PRIMARY,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  radioOptionActive: {
    backgroundColor: RED_PRIMARY,
    borderColor: RED_PRIMARY,
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectOptionActive: {
    backgroundColor: RED_PRIMARY,
    borderColor: RED_PRIMARY,
  },
  selectText: {
    fontSize: 12,
    color: '#666',
  },
  selectTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  submitContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
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
});

