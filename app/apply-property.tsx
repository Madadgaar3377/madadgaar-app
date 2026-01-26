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
import { applyProperty, ApplyPropertyUserInfo } from '@/services/applyProperty.api';
import { 
  getPropertyById, 
  Property,
  getPropertyTitle,
  getPropertyLocation,
  getPropertyPrice,
  getPropertyId,
} from '@/services/property.api';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing } from '@/theme';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import Toast from 'react-native-toast-message';

const RED_PRIMARY = '#D32F2F';

export default function ApplyPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { name, email, userProfile, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // No automatic redirect - show auth buttons instead

  // Form fields
  const [formData, setFormData] = useState<ApplyPropertyUserInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    whatsApp: '',
    cnic: '',
    reference: '',
  });

  const [applicationNote, setApplicationNote] = useState('');

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    // Pre-fill form with user data
    if (name) setFormData((prev) => ({ ...prev, name }));
    if (email) setFormData((prev) => ({ ...prev, email }));
    if (userProfile?.phoneNumber) setFormData((prev) => ({ ...prev, phone: userProfile.phoneNumber }));
    if (userProfile?.Address) setFormData((prev) => ({ ...prev, address: userProfile.Address }));
    if (userProfile?.WhatsappNumber) setFormData((prev) => ({ ...prev, whatsApp: userProfile.WhatsappNumber }));
    if (userProfile?.cnicNumber) setFormData((prev) => ({ ...prev, cnic: userProfile.cnicNumber }));
  }, [name, email, userProfile]);

  const loadProperty = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getPropertyById(id as string);
      setProperty(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load property details',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ApplyPropertyUserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields: (keyof ApplyPropertyUserInfo)[] = ['name', 'email', 'phone'];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field]?.trim() === '') {
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
      ? `/apply-property?id=${id}`
      : '/apply-property';
    
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="Apply for Property"
          message="Login or signup to submit your property application"
          redirectPath={redirectPath}
        />
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!property) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Property information is missing',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Get property type and propertyId from schema
    const propertyType = property.type || 'Individual'; // Default to Individual if type is not set
    const propertyId = getPropertyId(property);
    
    if (!propertyId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Property ID is missing',
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    try {
      setSubmitting(true);

      // Transform form data to match backend schema
      const commonForm = [{
        name: formData.name || '',
        email: formData.email || '',
        number: formData.phone || '',
        whatsApp: formData.whatsApp || '',
        cnic: formData.cnic || '',
        city: formData.city || '',
        area: formData.address || '',
        reference: formData.reference || '',
      }];

      const payload = {
        data: {
          type: propertyType as 'Project' | 'Individual',
          propertyId: propertyId,
          applicationNote: applicationNote.trim() || undefined,
          commonForm: commonForm,
        },
      };

      const response = await applyProperty(payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Application Submitted',
          text2: 'Your property application has been submitted successfully. We will review it and get back to you soon.',
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

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
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
          <Text style={styles.headerTitle}>Apply for Property</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.propertyTitle}>{getPropertyTitle(property)}</Text>
              {getPropertyPrice(property) && (
                <Text style={styles.propertyPrice}>PKR {getPropertyPrice(property)?.toLocaleString()}</Text>
              )}
              {getPropertyLocation(property) && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.locationText}>{getPropertyLocation(property)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Input
              label="Full Name *"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter your full name"
            />

            <Input
              label="Email Address *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
            />

            <Input
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="WhatsApp Number"
              value={formData.whatsApp}
              onChangeText={(value) => updateField('whatsApp', value)}
              placeholder="Enter your WhatsApp number (optional)"
              keyboardType="phone-pad"
            />

            <Input
              label="CNIC Number"
              value={formData.cnic}
              onChangeText={(value) => updateField('cnic', value)}
              placeholder="Enter your CNIC number (optional)"
            />
          </View>

          {/* Address Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            <Input
              label="Address"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Enter your address"
              multiline
            />

            <Input
              label="City"
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="Enter your city"
            />

            <Input
              label="State"
              value={formData.state}
              onChangeText={(value) => updateField('state', value)}
              placeholder="Enter your state"
            />

            <Input
              label="ZIP Code"
              value={formData.zip}
              onChangeText={(value) => updateField('zip', value)}
              placeholder="Enter your ZIP code"
              keyboardType="numeric"
            />

            <Input
              label="Country"
              value={formData.country}
              onChangeText={(value) => updateField('country', value)}
              placeholder="Enter your country"
            />
          </View>

          {/* Reference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reference Information</Text>
            <Input
              label="Reference"
              value={formData.reference || ''}
              onChangeText={(value) => updateField('reference', value)}
              placeholder="How did you hear about us? (optional)"
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
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: RED_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
});

