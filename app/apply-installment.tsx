import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { applyInstallment, ApplyInstallmentUserInfo } from '@/services/applyInstallment.api';
import { getInstallmentById, Installment } from '@/services/installment.api';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing } from '@/theme';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import Toast from 'react-native-toast-message';

const RED_PRIMARY = '#D32F2F';

export default function ApplyInstallmentScreen() {
  const router = useRouter();
  const { id, planIndex } = useLocalSearchParams();
  const { name, email, userProfile, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [product, setProduct] = useState<Installment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  // No automatic redirect - show auth buttons instead

  // Form fields
  const [formData, setFormData] = useState<ApplyInstallmentUserInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    occupation: '',
    employerName: '',
    employerAddress: '',
    jobTitle: '',
    monthlyIncome: '',
    otherIncomeSources: '',
    workContactNumber: '',
  });

  const [applicationNote, setApplicationNote] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    // Pre-fill form with user data
    if (name) setFormData((prev) => ({ ...prev, name }));
    if (email) setFormData((prev) => ({ ...prev, email }));
    if (userProfile?.phoneNumber) setFormData((prev) => ({ ...prev, phone: userProfile.phoneNumber }));
    if (userProfile?.Address) setFormData((prev) => ({ ...prev, address: userProfile.Address }));
  }, [name, email, userProfile]);

  useEffect(() => {
    if (planIndex) {
      setSelectedPlanIndex(parseInt(planIndex as string, 10));
    }
  }, [planIndex]);

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getInstallmentById(id as string);
      setProduct(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load product details',
        position: 'top',
        visibilityTime: 2500,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ApplyInstallmentUserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof ApplyInstallmentUserInfo)[] = [
      'name',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zip',
      'country',
      'occupation',
      'employerName',
      'employerAddress',
      'jobTitle',
      'monthlyIncome',
      'workContactNumber',
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          position: 'top',
          visibilityTime: 2500,
        });
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
        position: 'top',
        visibilityTime: 2500,
      });
      return false;
    }

    return true;
  };

  // Show auth required screen if not authenticated
  if (!isAuthenticated) {
    const redirectPath = id 
      ? `/apply-installment?id=${id}${planIndex ? `&planIndex=${planIndex}` : ''}`
      : '/apply-installment';
    
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="Apply for Installment"
          message="Login or signup to submit your installment application"
          redirectPath={redirectPath}
        />
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!product || !product.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Product information is missing',
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

      const payload = {
        installmentPlanId: product.id,
        applicationNote: applicationNote.trim() || undefined,
        selectedPlanIndex,
        userInfo: formData,
      };

      const response = await applyInstallment(payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Application Submitted',
          text2: 'Your installment application has been submitted successfully. We will review it and get back to you soon.',
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DetailPageSkeleton />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Installment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{product.title}</Text>
            {product.paymentPlans && product.paymentPlans.length > 0 && (
              <View style={styles.planSelector}>
                <Text style={styles.sectionLabel}>Select Payment Plan</Text>
                {product.paymentPlans.map((plan, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.planOption,
                      selectedPlanIndex === index && styles.planOptionSelected,
                    ]}
                    onPress={() => setSelectedPlanIndex(index)}
                  >
                    <View style={styles.planOptionContent}>
                      <View>
                        <Text style={styles.planOptionName}>
                          {plan.planName || `Plan ${index + 1}`}
                        </Text>
                        <Text style={styles.planOptionDetails}>
                          {plan.tenureMonths} Months • PKR {plan.monthlyInstallment?.toLocaleString()}/month
                        </Text>
                      </View>
                      {selectedPlanIndex === index && (
                        <Ionicons name="checkmark-circle" size={24} color={RED_PRIMARY} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Input
              label="Full Name *"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter your full name"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="Address *"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Enter your address"
              multiline
              numberOfLines={2}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="City *"
                  value={formData.city}
                  onChangeText={(value) => updateField('city', value)}
                  placeholder="Enter city"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="State *"
                  value={formData.state}
                  onChangeText={(value) => updateField('state', value)}
                  placeholder="Enter state"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="ZIP Code *"
                  value={formData.zip}
                  onChangeText={(value) => updateField('zip', value)}
                  placeholder="Enter ZIP code"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Country *"
                  value={formData.country}
                  onChangeText={(value) => updateField('country', value)}
                  placeholder="Enter country"
                />
              </View>
            </View>
          </View>

          {/* Employment Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employment Information</Text>

            <Input
              label="Occupation *"
              value={formData.occupation}
              onChangeText={(value) => updateField('occupation', value)}
              placeholder="Enter your occupation"
            />

            <Input
              label="Employer Name *"
              value={formData.employerName}
              onChangeText={(value) => updateField('employerName', value)}
              placeholder="Enter employer name"
            />

            <Input
              label="Employer Address *"
              value={formData.employerAddress}
              onChangeText={(value) => updateField('employerAddress', value)}
              placeholder="Enter employer address"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Job Title *"
              value={formData.jobTitle}
              onChangeText={(value) => updateField('jobTitle', value)}
              placeholder="Enter your job title"
            />

            <Input
              label="Monthly Income (PKR) *"
              value={formData.monthlyIncome}
              onChangeText={(value) => updateField('monthlyIncome', value)}
              placeholder="Enter monthly income"
              keyboardType="numeric"
            />

            <Input
              label="Other Income Sources"
              value={formData.otherIncomeSources}
              onChangeText={(value) => updateField('otherIncomeSources', value)}
              placeholder="Enter other income sources (optional)"
            />

            <Input
              label="Work Contact Number *"
              value={formData.workContactNumber}
              onChangeText={(value) => updateField('workContactNumber', value)}
              placeholder="Enter work contact number"
              keyboardType="phone-pad"
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
    borderBottomColor: '#f0f0f0',
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
    padding: 16,
    paddingBottom: 32,
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
  productInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  planSelector: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  planOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  planOptionSelected: {
    borderColor: RED_PRIMARY,
    backgroundColor: '#FFEBEE',
  },
  planOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  planOptionDetails: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
});

