import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { InstallmentApplication, PropertyApplication, LoanApplication, getUserDashboard } from '@/services/dashboard.api';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme';
import Toast from 'react-native-toast-message';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import { getPropertyTitle, getPropertyLocation, getPropertyPrice, getPropertyMonthlyRent, getPropertyImages } from '@/services/property.api';

const RED_PRIMARY = '#D32F2F';

export default function ApplicationDetailsScreen() {
  const router = useRouter();
  const { type, applicationId, data } = useLocalSearchParams();
  const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Try to parse data if provided, otherwise fetch by applicationId
  useEffect(() => {
    if (data) {
      try {
        setApplication(JSON.parse(data as string));
      } catch (e) {
        // If parsing fails, fetch by applicationId
        if (applicationId) {
          loadApplication();
        }
      }
    } else if (applicationId) {
      loadApplication();
    }
  }, [applicationId, data]);

  const loadApplication = async () => {
    if (!applicationId || !type) return;
    
    try {
      setLoading(true);
      const response = await getUserDashboard();
      
      if (response.success && response.data) {
        let foundApp: any = null;
        
        if (type === 'installment') {
          foundApp = response.data.installnments?.find(
            (app: InstallmentApplication) => app._id === applicationId || app.applicationId === applicationId
          );
        } else if (type === 'property') {
          foundApp = response.data.properties?.find(
            (app: PropertyApplication) => app._id === applicationId || app.applicationId === applicationId
          );
        } else if (type === 'loan') {
          foundApp = response.data.loans?.find(
            (app: LoanApplication) => app._id === applicationId || app.applicationId === applicationId
          );
        }
        
        if (foundApp) {
          setApplication(foundApp);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Application not found',
            position: 'top',
            visibilityTime: 2500,
          });
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load application details',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  // No automatic redirect - show auth buttons instead

  // Show auth required screen if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="View Application Details"
          message="Login or signup to view detailed information about your application"
          redirectPath={router.asPath || '/(tabs)/dashboard'}
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

  if (!application) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Application not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return '#4CAF50';
      case 'pending':
      case 'in_progress':
        return '#FF9800';
      case 'rejected':
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderInstallmentDetails = (app: InstallmentApplication) => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '15', borderColor: getStatusColor(app.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
            {app.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
        <Text style={styles.applicationId}>
          Application ID: {app.applicationId || app._id || 'N/A'}
        </Text>
        <Text style={styles.dateText}>Applied on: {formatDate(app.createdAt)}</Text>
      </View>

      {/* Plan Information */}
      {app.PlanInfo && app.PlanInfo.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Information</Text>
          <View style={styles.infoCard}>
            {app.PlanInfo[0]?.planType && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan Type</Text>
                <Text style={styles.infoValue}>{app.PlanInfo[0].planType}</Text>
              </View>
            )}
            {app.PlanInfo[0]?.planPrice && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan Price</Text>
                <Text style={styles.infoValue}>PKR {app.PlanInfo[0].planPrice.toLocaleString()}</Text>
              </View>
            )}
            {app.PlanInfo[0]?.downPayment !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Down Payment</Text>
                <Text style={styles.infoValue}>PKR {app.PlanInfo[0].downPayment.toLocaleString()}</Text>
              </View>
            )}
            {app.PlanInfo[0]?.monthlyInstallment !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Installment</Text>
                <Text style={styles.infoValue}>PKR {app.PlanInfo[0].monthlyInstallment.toLocaleString()}</Text>
              </View>
            )}
            {app.PlanInfo[0]?.tenureMonths && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tenure</Text>
                <Text style={styles.infoValue}>{app.PlanInfo[0].tenureMonths} Months</Text>
              </View>
            )}
            {app.PlanInfo[0]?.interestRatePercent !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Interest Rate</Text>
                <Text style={styles.infoValue}>{app.PlanInfo[0].interestRatePercent}%</Text>
              </View>
            )}
            {app.PlanInfo[0]?.interestType && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Interest Type</Text>
                <Text style={styles.infoValue}>{app.PlanInfo[0].interestType}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* User Information */}
      {app.UserInfo && app.UserInfo.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            {app.UserInfo[0].name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].name}</Text>
              </View>
            )}
            {app.UserInfo[0].email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].email}</Text>
              </View>
            )}
            {app.UserInfo[0].phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].phone}</Text>
              </View>
            )}
            {app.UserInfo[0].address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].address}</Text>
              </View>
            )}
            {app.UserInfo[0].city && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].city}</Text>
              </View>
            )}
            {app.UserInfo[0].state && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>State</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].state}</Text>
              </View>
            )}
            {app.UserInfo[0].zip && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ZIP Code</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].zip}</Text>
              </View>
            )}
            {app.UserInfo[0].country && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].country}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Employment Information */}
      {app.UserInfo && app.UserInfo.length > 0 && app.UserInfo[0].occupation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Information</Text>
          <View style={styles.infoCard}>
            {app.UserInfo[0].occupation && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Occupation</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].occupation}</Text>
              </View>
            )}
            {app.UserInfo[0].employerName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employer Name</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].employerName}</Text>
              </View>
            )}
            {app.UserInfo[0].employerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employer Address</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].employerAddress}</Text>
              </View>
            )}
            {app.UserInfo[0].jobTitle && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Job Title</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].jobTitle}</Text>
              </View>
            )}
            {app.UserInfo[0].monthlyIncome && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Income</Text>
                <Text style={styles.infoValue}>PKR {app.UserInfo[0].monthlyIncome}</Text>
              </View>
            )}
            {app.UserInfo[0].otherIncomeSources && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Other Income Sources</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].otherIncomeSources}</Text>
              </View>
            )}
            {app.UserInfo[0].workContactNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Work Contact</Text>
                <Text style={styles.infoValue}>{app.UserInfo[0].workContactNumber}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Application Note */}
      {app.applicationNote && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Note</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{app.applicationNote}</Text>
          </View>
        </View>
      )}

      {/* Additional Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <View style={styles.infoCard}>
          {app.assigenAgent && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned Agent</Text>
              <Text style={styles.infoValue}>{app.assigenAgent}</Text>
            </View>
          )}
          {app.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{formatDate(app.updatedAt)}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderPropertyDetails = (app: PropertyApplication) => {
    const appAny = app as any;
    
    // Extract property data from propertyDetails (new schema) or PropertyInfo (old schema)
    let propertyData: any = null;
    if (appAny.propertyDetails && Array.isArray(appAny.propertyDetails) && appAny.propertyDetails.length > 0) {
      propertyData = appAny.propertyDetails[0];
    } else if (app.PropertyInfo && app.PropertyInfo.length > 0) {
      propertyData = app.PropertyInfo[0];
    }
    
    // Extract property details
    let propertyTitle = propertyData?.title || propertyData?.name || propertyData?.projectName || 'Property';
    let propertyLocation = propertyData?.location || propertyData?.city || '';
    let propertyPrice: number | null = propertyData?.transaction?.price || 
                                       propertyData?.transaction?.advanceAmount || 
                                       propertyData?.transaction?.bookingAmount || null;
    let propertyMonthlyRent: number | null = propertyData?.transaction?.monthlyRent || 
                                             propertyData?.transaction?.monthlyInstallment || null;
    
    // Try helper functions if propertyData has the old structure
    if (propertyData && !appAny.propertyDetails) {
      try {
        propertyTitle = getPropertyTitle(propertyData as any) || propertyTitle;
        propertyLocation = getPropertyLocation(propertyData as any) || propertyLocation;
        propertyPrice = getPropertyPrice(propertyData as any) || propertyPrice;
        propertyMonthlyRent = getPropertyMonthlyRent(propertyData as any) || propertyMonthlyRent;
      } catch (e) {
        // Use direct access values already set
      }
    }
    
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Application</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '15', borderColor: getStatusColor(app.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
              {app.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
          <Text style={styles.applicationId}>
            Application ID: {app.applicationId || app._id || 'N/A'}
          </Text>
          <Text style={styles.dateText}>Applied on: {formatDate(app.createdAt)}</Text>
        </View>

        {/* Property Information */}
        {propertyData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Information</Text>
            <View style={styles.infoCard}>
              {propertyTitle && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Property Name</Text>
                  <Text style={styles.infoValue}>{propertyTitle}</Text>
                </View>
              )}
              {propertyData.description && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{propertyData.description}</Text>
                </View>
              )}
              {propertyLocation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{propertyLocation}</Text>
                </View>
              )}
              {propertyData.city && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>City</Text>
                  <Text style={styles.infoValue}>{propertyData.city}</Text>
                </View>
              )}
              {propertyData.propertyType && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Property Type</Text>
                  <Text style={styles.infoValue}>{propertyData.propertyType}</Text>
                </View>
              )}
              {propertyData.areaSize && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Area Size</Text>
                  <Text style={styles.infoValue}>
                    {propertyData.areaSize} {propertyData.areaUnit || ''}
                  </Text>
                </View>
              )}
              {propertyData.bedrooms !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bedrooms</Text>
                  <Text style={styles.infoValue}>{propertyData.bedrooms}</Text>
                </View>
              )}
              {propertyData.bathrooms !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bathrooms</Text>
                  <Text style={styles.infoValue}>{propertyData.bathrooms}</Text>
                </View>
              )}
              {propertyData.kitchenType && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kitchen Type</Text>
                  <Text style={styles.infoValue}>{propertyData.kitchenType}</Text>
                </View>
              )}
              {propertyData.furnishingStatus && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Furnishing Status</Text>
                  <Text style={styles.infoValue}>{propertyData.furnishingStatus}</Text>
                </View>
              )}
              {propertyData.floor !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Floor</Text>
                  <Text style={styles.infoValue}>{propertyData.floor}</Text>
                </View>
              )}
              {propertyData.totalFloors !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Floors</Text>
                  <Text style={styles.infoValue}>{propertyData.totalFloors}</Text>
                </View>
              )}
              {propertyData.possessionStatus && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Possession Status</Text>
                  <Text style={styles.infoValue}>{propertyData.possessionStatus}</Text>
                </View>
              )}
              {propertyData.zoningType && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Zoning Type</Text>
                  <Text style={styles.infoValue}>{propertyData.zoningType}</Text>
                </View>
              )}
              {propertyData.nearbyLandmarks && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nearby Landmarks</Text>
                  <Text style={styles.infoValue}>{propertyData.nearbyLandmarks}</Text>
                </View>
              )}
              {propertyPrice && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={styles.infoValue}>PKR {propertyPrice.toLocaleString()}</Text>
                </View>
              )}
              {propertyData.transaction?.advanceAmount && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Advance Amount</Text>
                  <Text style={styles.infoValue}>PKR {propertyData.transaction.advanceAmount.toLocaleString()}</Text>
                </View>
              )}
              {propertyMonthlyRent && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Monthly Rent</Text>
                  <Text style={styles.infoValue}>PKR {propertyMonthlyRent.toLocaleString()}</Text>
                </View>
              )}
              {propertyData.transaction?.type && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Transaction Type</Text>
                  <Text style={styles.infoValue}>{propertyData.transaction.type}</Text>
                </View>
              )}
              {propertyData.transaction?.additionalInfo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Additional Info</Text>
                  <Text style={styles.infoValue}>{propertyData.transaction.additionalInfo}</Text>
                </View>
              )}
              {/* Utilities */}
              {propertyData.utilities && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Utilities</Text>
                  <Text style={styles.infoValue}>
                    {Object.entries(propertyData.utilities)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => key)
                      .join(', ')}
                  </Text>
                </View>
              )}
              {/* Amenities */}
              {propertyData.amenities && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Amenities</Text>
                  <Text style={styles.infoValue}>
                    {Object.entries(propertyData.amenities)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => key)
                      .join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

      {/* Contact Information */}
      {propertyData?.contact && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            {propertyData.contact.name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{propertyData.contact.name}</Text>
              </View>
            )}
            {propertyData.contact.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{propertyData.contact.email}</Text>
              </View>
            )}
            {propertyData.contact.number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{propertyData.contact.number}</Text>
              </View>
            )}
            {propertyData.contact.whatsapp && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>WhatsApp</Text>
                <Text style={styles.infoValue}>{propertyData.contact.whatsapp}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* User Information */}
      {app.UserInfo && app.UserInfo.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          <View style={styles.infoCard}>
            {Object.entries(app.UserInfo[0] || {}).map(([key, value]) => (
              value && key !== '_id' && (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.infoValue}>{String(value)}</Text>
                </View>
              )
            ))}
          </View>
        </View>
      )}

      {/* Application Note */}
      {app.applicationNote && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Note</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{app.applicationNote}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
  };

  const renderLoanDetails = (app: LoanApplication) => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Application</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '15', borderColor: getStatusColor(app.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
            {app.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
        <Text style={styles.applicationId}>
          Application ID: {app.applicationId || app._id || 'N/A'}
        </Text>
        <Text style={styles.dateText}>Applied on: {formatDate(app.createdAt)}</Text>
      </View>

      {/* Applicant Information */}
      {app.applicantInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          <View style={styles.infoCard}>
            {Object.entries(app.applicantInfo).map(([key, value]) => (
              value && (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.infoValue}>{String(value)}</Text>
                </View>
              )
            ))}
          </View>
        </View>
      )}

      {/* Contact Information */}
      {app.contactInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            {Object.entries(app.contactInfo).map(([key, value]) => (
              value && (
                <View key={key} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.infoValue}>{String(value)}</Text>
                </View>
              )
            ))}
          </View>
        </View>
      )}

      {/* Loan Requirement */}
      {app.loanRequirement && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Requirement</Text>
          <View style={styles.infoCard}>
            {app.loanRequirement.requiredAmount && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Required Amount</Text>
                <Text style={styles.infoValue}>PKR {Number(app.loanRequirement.requiredAmount).toLocaleString()}</Text>
              </View>
            )}
            {app.loanRequirement.loanType && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loan Type</Text>
                <Text style={styles.infoValue}>{app.loanRequirement.loanType}</Text>
              </View>
            )}
            {app.loanRequirement.preferredTenure && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Preferred Tenure</Text>
                <Text style={styles.infoValue}>{app.loanRequirement.preferredTenure} Months</Text>
              </View>
            )}
            {app.loanRequirement.financingPreference && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Financing Preference</Text>
                <Text style={styles.infoValue}>{app.loanRequirement.financingPreference}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Application Note */}
      {app.applicationNote && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Note</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{app.applicationNote}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  // Determine which render function to use
  const renderContent = () => {
    if (!application) return null;
    
    if (type === 'installment') {
      return renderInstallmentDetails(application as InstallmentApplication);
    } else if (type === 'loan') {
      return renderLoanDetails(application as LoanApplication);
    } else if (type === 'property') {
      return renderPropertyDetails(application as PropertyApplication);
    }
    
    // Default fallback
    return renderPropertyDetails(application as PropertyApplication);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  applicationId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'right',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: RED_PRIMARY,
    fontWeight: '600',
  },
});

