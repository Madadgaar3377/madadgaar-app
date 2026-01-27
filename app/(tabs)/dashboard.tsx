import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserDashboard, InstallmentApplication, PropertyApplication, LoanApplication } from '@/services/dashboard.api';
import { InstallmentCardIcon, PropertyCardIcon, LoanCardIcon, InsuranceCardIcon } from '@/components/icons/ApplicationCardIcons';
import { getPropertyTitle, getPropertyLocation, getPropertyImages } from '@/services/property.api';
import { getInstallmentById, Installment } from '@/services/installment.api';
import { useAppSelector } from '@/store/hooks';
import Toast from 'react-native-toast-message';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { colors, spacing } from '@/theme';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_IMAGE_URL = 'https://api.madadgaar.com.pk/';

type Category = 'installments' | 'loans' | 'properties' | 'insurance';

export default function DashboardScreen() {
  const router = useRouter();
  const { name, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('installments');
  const [installmentPlansCache, setInstallmentPlansCache] = useState<Record<string, Installment>>({});
  const [loanPlansCache, setLoanPlansCache] = useState<Record<string, any>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      fadeAnim.setValue(0);
      const response = await getUserDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load dashboard');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load dashboard data',
        position: 'top',
        visibilityTime: 2500,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return colors.accent;
      case 'pending':
      case 'in_progress':
        return '#FF6B6B';
      case 'rejected':
      case 'cancelled':
        return colors.textTertiary;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const fetchInstallmentPlan = useCallback(async (installmentPlanId: string) => {
    // Only try to fetch if we have a valid installmentPlanId
    // Skip if it looks like a MongoDB ObjectId (24 hex chars) as backend prefers installmentPlanId
    if (!installmentPlanId || 
        loadingImages.has(installmentPlanId) || 
        installmentPlansCache[installmentPlanId] ||
        /^[0-9a-fA-F]{24}$/.test(installmentPlanId)) {
      return;
    }

    try {
      setLoadingImages(prev => new Set(prev).add(installmentPlanId));
      const plan = await getInstallmentById(installmentPlanId);
      if (plan) {
        setInstallmentPlansCache(prev => ({ ...prev, [installmentPlanId]: plan }));
      }
    } catch (error) {
      console.error('Failed to fetch installment plan:', error);
      // Silently fail - we'll use PlanInfo data instead
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(installmentPlanId);
        return newSet;
      });
    }
  }, [loadingImages, installmentPlansCache]);

  const getInstallmentProductImage = (app: InstallmentApplication): string | null => {
    const appAny = app as any;
    const normalizeImage = (img: string | null | undefined): string | null => {
      if (!img || typeof img !== 'string') return null;
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
        return img;
      }
      const cleanPath = img.replace(/^[\/\\]+/, '');
      return `${BASE_IMAGE_URL}${cleanPath}`;
    };

    // Check cached installment plan first
    if (app.installmentPlanId && installmentPlansCache[app.installmentPlanId]) {
      const cachedPlan = installmentPlansCache[app.installmentPlanId];
      if (cachedPlan.productImages && cachedPlan.productImages.length > 0) {
        return normalizeImage(cachedPlan.productImages[0]);
      }
      if (cachedPlan.imageUrl) return normalizeImage(cachedPlan.imageUrl);
    }

    // Try to fetch from API if we have installmentPlanId but no image
    if (app.installmentPlanId && !loadingImages.has(app.installmentPlanId) && !installmentPlansCache[app.installmentPlanId]) {
      fetchInstallmentPlan(app.installmentPlanId);
    }

    if (appAny.planImageUrl) return normalizeImage(appAny.planImageUrl);
    if (appAny.productImageUrl) return normalizeImage(appAny.productImageUrl);
    if (appAny.imageUrl) return normalizeImage(appAny.imageUrl);
    if (appAny.image) return normalizeImage(appAny.image);
    
    if (appAny.productImages && Array.isArray(appAny.productImages) && appAny.productImages.length > 0) {
      return normalizeImage(appAny.productImages[0]);
    }
    
    if (app.PlanInfo && app.PlanInfo.length > 0) {
      const plan = app.PlanInfo[0] as any;
      // Check planpic field first (stored by backend when application is created)
      if (plan.planpic) {
        if (Array.isArray(plan.planpic) && plan.planpic.length > 0) {
          return normalizeImage(plan.planpic[0]);
        }
        if (typeof plan.planpic === 'string') {
          return normalizeImage(plan.planpic);
        }
      }
      // Check other image fields in PlanInfo
      if (plan.productImages && Array.isArray(plan.productImages) && plan.productImages.length > 0) {
        return normalizeImage(plan.productImages[0]);
      }
      if (plan.imageUrl) return normalizeImage(plan.imageUrl);
      if (plan.image) return normalizeImage(plan.image);
      if (plan.productImageUrl) return normalizeImage(plan.productImageUrl);
    }
    
    if (appAny.InstallmentInfo && Array.isArray(appAny.InstallmentInfo) && appAny.InstallmentInfo.length > 0) {
      const info = appAny.InstallmentInfo[0];
      if (info.productImages && Array.isArray(info.productImages) && info.productImages.length > 0) {
        return normalizeImage(info.productImages[0]);
      }
      if (info.imageUrl) return normalizeImage(info.imageUrl);
      if (info.image) return normalizeImage(info.image);
      if (info.productImageUrl) return normalizeImage(info.productImageUrl);
    }
    
    // Check nested installmentPlan object
    if (appAny.installmentPlan) {
      if (appAny.installmentPlan.productImages && Array.isArray(appAny.installmentPlan.productImages) && appAny.installmentPlan.productImages.length > 0) {
        return normalizeImage(appAny.installmentPlan.productImages[0]);
      }
      if (appAny.installmentPlan.imageUrl) return normalizeImage(appAny.installmentPlan.imageUrl);
      if (appAny.installmentPlan.image) return normalizeImage(appAny.installmentPlan.image);
    }

    // Check planDetails (if populated by backend in some endpoints)
    if (appAny.planDetails) {
      if (appAny.planDetails.productImages && Array.isArray(appAny.planDetails.productImages) && appAny.planDetails.productImages.length > 0) {
        return normalizeImage(appAny.planDetails.productImages[0]);
      }
      if (appAny.planDetails.imageUrl) return normalizeImage(appAny.planDetails.imageUrl);
      if (appAny.planDetails.image) return normalizeImage(appAny.planDetails.image);
    }
    
    return null;
  };

  const getInstallmentProductName = (app: InstallmentApplication): string => {
    // Try to get from InstallmentInfo first
    if ((app as any).InstallmentInfo && Array.isArray((app as any).InstallmentInfo) && (app as any).InstallmentInfo.length > 0) {
      const info = (app as any).InstallmentInfo[0];
      if (info.productName) return info.productName;
      if (info.productTitle) return info.productTitle;
      if (info.title) return info.title;
      if (info.name) return info.name;
    }
    // Try direct fields
    if ((app as any).productName) return (app as any).productName;
    if ((app as any).productTitle) return (app as any).productTitle;
    if ((app as any).title) return (app as any).title;
    if ((app as any).name) return (app as any).name;
    // Try PlanInfo
    if (app.PlanInfo && app.PlanInfo.length > 0) {
      const plan = app.PlanInfo[0] as any;
      if (plan.productName) return plan.productName;
      if (plan.productTitle) return plan.productTitle;
      if (plan.title) return plan.title;
      if (plan.name) return plan.name;
      if (plan.planType) return plan.planType;
    }
    return 'Installment Plan';
  };

  const getInstallmentDetails = (app: InstallmentApplication) => {
    const planInfo = app.PlanInfo && app.PlanInfo.length > 0 ? app.PlanInfo[0] : null;
    const installmentInfo = (app as any).InstallmentInfo && Array.isArray((app as any).InstallmentInfo) && (app as any).InstallmentInfo.length > 0 
      ? (app as any).InstallmentInfo[0] 
      : null;
    
    // Check cached installment plan for complete details
    let cachedPlan = null;
    if (app.installmentPlanId && installmentPlansCache[app.installmentPlanId]) {
      cachedPlan = installmentPlansCache[app.installmentPlanId];
    }
    
    return {
      monthlyPayment: planInfo?.monthlyInstallment || installmentInfo?.monthlyInstallment || cachedPlan?.monthlyPayment || (app as any).monthlyPayment || null,
      tenure: planInfo?.tenureMonths || installmentInfo?.tenureMonths || cachedPlan?.duration || (app as any).tenure || null,
      downPayment: planInfo?.downPayment || installmentInfo?.downPayment || cachedPlan?.downPayment || (app as any).downPayment || null,
      totalAmount: planInfo?.planPrice || installmentInfo?.planPrice || cachedPlan?.totalAmount || (app as any).totalAmount || null,
    };
  };

  const getPropertyImage = (app: PropertyApplication): string | null => {
    const appAny = app as any;
    const normalizeImage = (img: string | null | undefined): string | null => {
      if (!img || typeof img !== 'string') return null;
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
        return img;
      }
      const cleanPath = img.replace(/^[\/\\]+/, '');
      return `${BASE_IMAGE_URL}${cleanPath}`;
    };

    // Check propertyDetails first (new schema)
    if (appAny.propertyDetails && Array.isArray(appAny.propertyDetails) && appAny.propertyDetails.length > 0) {
      const propDetails = appAny.propertyDetails[0];
      if (propDetails.images && Array.isArray(propDetails.images) && propDetails.images.length > 0) {
        return normalizeImage(propDetails.images[0]);
      }
      if (propDetails.imageUrl) return normalizeImage(propDetails.imageUrl);
      if (propDetails.image) return normalizeImage(propDetails.image);
    }

    // Fallback to PropertyInfo (old schema)
    if (app.PropertyInfo && app.PropertyInfo.length > 0) {
      const propInfo = app.PropertyInfo[0] as any;
      if (propInfo.type === 'Project' && propInfo.project?.images) {
        const images = propInfo.project.images;
        if (Array.isArray(images) && images.length > 0) {
          return normalizeImage(images[0]);
        }
      } else if (propInfo.type === 'Individual' && propInfo.individualProperty?.images) {
        const images = propInfo.individualProperty.images;
        if (Array.isArray(images) && images.length > 0) {
          return normalizeImage(images[0]);
        }
      }
      if (propInfo.images && Array.isArray(propInfo.images) && propInfo.images.length > 0) {
        return normalizeImage(propInfo.images[0]);
      }
      if (propInfo.imageUrl) return normalizeImage(propInfo.imageUrl);
      if (propInfo.image) return normalizeImage(propInfo.image);
    }
    
    if (appAny.propertyImageUrl) return normalizeImage(appAny.propertyImageUrl);
    if (appAny.imageUrl) return normalizeImage(appAny.imageUrl);
    if (appAny.image) return normalizeImage(appAny.image);
    
    if (appAny.images && Array.isArray(appAny.images) && appAny.images.length > 0) {
      return normalizeImage(appAny.images[0]);
    }
    
    return null;
  };

  const getPropertyName = (app: PropertyApplication): string => {
    const appAny = app as any;
    
    // Check propertyDetails first (new schema)
    if (appAny.propertyDetails && Array.isArray(appAny.propertyDetails) && appAny.propertyDetails.length > 0) {
      const propDetails = appAny.propertyDetails[0];
      if (propDetails.title) return propDetails.title;
      if (propDetails.name) return propDetails.name;
      if (propDetails.projectName) return propDetails.projectName;
    }
    
    // Fallback to PropertyInfo (old schema)
    if (app.PropertyInfo && app.PropertyInfo.length > 0) {
      const propInfo = app.PropertyInfo[0] as any;
      if (propInfo.type === 'Project' && propInfo.project) {
        return propInfo.project.projectName || propInfo.project.name || 'Project';
      } else if (propInfo.type === 'Individual' && propInfo.individualProperty) {
        return propInfo.individualProperty.title || propInfo.individualProperty.name || 'Property';
      }
      if (propInfo.name) return propInfo.name;
      if (propInfo.title) return propInfo.title;
    }
    
    if (appAny.propertyName) return appAny.propertyName;
    if (appAny.propertyTitle) return appAny.propertyTitle;
    if (appAny.name) return appAny.name;
    if (appAny.title) return appAny.title;
    return 'Property';
  };

  const getPropertyDetails = (app: PropertyApplication) => {
    const appAny = app as any;
    let location = '';
    let price = null;
    let monthlyRent = null;
    
    // Check propertyDetails first (new schema)
    if (appAny.propertyDetails && Array.isArray(appAny.propertyDetails) && appAny.propertyDetails.length > 0) {
      const propDetails = appAny.propertyDetails[0];
      location = propDetails.location || propDetails.city || '';
      if (propDetails.transaction) {
        price = propDetails.transaction.price || 
                propDetails.transaction.advanceAmount || 
                propDetails.transaction.bookingAmount || null;
        monthlyRent = propDetails.transaction.monthlyRent || 
                      propDetails.transaction.monthlyInstallment || null;
      }
      return { location, price, monthlyRent };
    }
    
    // Fallback to PropertyInfo (old schema)
    if (app.PropertyInfo && app.PropertyInfo.length > 0) {
      const propInfo = app.PropertyInfo[0] as any;
      if (propInfo.type === 'Project' && propInfo.project) {
        location = [
          propInfo.project.street,
          propInfo.project.area,
          propInfo.project.city,
        ].filter(Boolean).join(', ') || propInfo.project.locationGPS || '';
        price = propInfo.project.transaction?.price || 
                propInfo.project.transaction?.bookingAmount || 
                propInfo.project.transaction?.downPayment || null;
        monthlyRent = propInfo.project.transaction?.monthlyRent || 
                     propInfo.project.transaction?.monthlyInstallment || null;
      } else if (propInfo.type === 'Individual' && propInfo.individualProperty) {
        location = propInfo.individualProperty.location || 
                  propInfo.individualProperty.city || '';
        price = propInfo.individualProperty.transaction?.price || 
                propInfo.individualProperty.transaction?.advanceAmount || 
                propInfo.individualProperty.transaction?.bookingAmount || null;
        monthlyRent = propInfo.individualProperty.transaction?.monthlyRent || 
                     propInfo.individualProperty.transaction?.monthlyInstallment || null;
      }
      
      return { location, price, monthlyRent };
    }
    return { location: '', price: null, monthlyRent: null };
  };

  // Fetch loan plan by planId
  const fetchLoanPlan = useCallback(async (planId: string) => {
    if (!planId || loanPlansCache[planId]) return;
    
    try {
      const { getLoanById } = await import('@/services/loan.api');
      const plan = await getLoanById(planId);
      if (plan) {
        setLoanPlansCache(prev => ({ ...prev, [planId]: plan }));
      }
    } catch (error) {
      console.error('Failed to fetch loan plan:', error);
    }
  }, [loanPlansCache]);

  // Helper functions for loan applications
  const getLoanProductName = (app: LoanApplication): string => {
    const appAny = app as any;
    const planId = appAny.planId;
    
    // Try to get from cached loan plan
    if (planId && loanPlansCache[planId]) {
      return loanPlansCache[planId].productName || loanPlansCache[planId].bankName + ' Loan';
    }
    
    // Fallback to application data
    if (appAny.loanRequirement?.loanType) return appAny.loanRequirement.loanType + ' Loan';
    if (appAny.productName) return appAny.productName;
    if (appAny.planName) return appAny.planName;
    if (appAny.bankName) return `${appAny.bankName} Loan`;
    return 'Loan Application';
  };

  const getLoanProductImage = (app: LoanApplication): string | null => {
    const appAny = app as any;
    const planId = appAny.planId;
    
    const normalizeImage = (img: string | null | undefined): string | null => {
      if (!img || typeof img !== 'string') return null;
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
        return img;
      }
      const cleanPath = img.replace(/^[\/\\]+/, '');
      return `${BASE_IMAGE_URL}${cleanPath}`;
    };

    // Try to get from cached loan plan
    if (planId && loanPlansCache[planId]?.planImage) {
      return normalizeImage(loanPlansCache[planId].planImage);
    }
    
    // Fallback to application data
    if (appAny.planImage) return normalizeImage(appAny.planImage);
    if (appAny.productImage) return normalizeImage(appAny.productImage);
    if (appAny.imageUrl) return normalizeImage(appAny.imageUrl);
    if (appAny.image) return normalizeImage(appAny.image);
    return null;
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="View Your Dashboard"
          message="Login or signup to see your applications and track their status"
          redirectPath="/(tabs)/dashboard"
        />
      </SafeAreaView>
    );
  }

  if (loading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
          </View>
        </View>
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {['installments', 'properties', 'loans', 'insurance'].map((category, index) => (
              <View key={category} style={[styles.tab, { opacity: 0.5 }]}>
                <SkeletonLoader width={80} height={40} borderRadius={20} />
              </View>
            ))}
          </ScrollView>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.gridCardSkeleton}>
                <SkeletonLoader width="100%" height={100} borderRadius={0} />
                <View style={styles.skeletonContent}>
                  <SkeletonLoader width="80%" height={14} borderRadius={4} style={{ marginBottom: spacing.xs }} />
                  <SkeletonLoader width="60%" height={12} borderRadius={4} style={{ marginBottom: spacing.xs }} />
                  <SkeletonLoader width="70%" height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const installments = dashboardData?.installnments || [];
  const properties = dashboardData?.properties || [];
  const loans = dashboardData?.loans || [];
  const insurance: any[] = []; // Insurance applications not yet available

  const getApplicationsForCategory = (category: Category) => {
    switch (category) {
      case 'installments':
        return installments;
      case 'properties':
        return properties;
      case 'loans':
        return loans;
      case 'insurance':
        return insurance;
      default:
        return [];
    }
  };

  const applications = getApplicationsForCategory(selectedCategory);

  const renderApplicationCard = (app: any, index: number) => {
    if (selectedCategory === 'installments') {
      const productImageUrl = getInstallmentProductImage(app);
      const productName = getInstallmentProductName(app);
      const statusColor = getStatusColor(app.status);
      const details = getInstallmentDetails(app);
      
      return (
        <TouchableOpacity
          key={app._id || app.applicationId || index}
          style={styles.applicationCard}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/application-details',
              params: {
                type: 'installment',
                applicationId: app._id || app.applicationId,
              },
            } as any);
          }}
        >
          {productImageUrl ? (
            <LazyImage
              source={{ uri: productImageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <InstallmentCardIcon size={56} color={colors.accent} />
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {productName}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '15', borderColor: statusColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel(app.status)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Details Section */}
            <View style={styles.cardDetails}>
              {details.totalAmount && (
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag-outline" size={14} color={colors.accent} />
                  <Text style={[styles.detailText, styles.priceText]}>
                    PKR {details.totalAmount.toLocaleString()}
                  </Text>
                </View>
              )}
              {details.monthlyPayment && (
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    PKR {details.monthlyPayment.toLocaleString()}/month
                  </Text>
                </View>
              )}
              {details.tenure && (
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{details.tenure} Months</Text>
                </View>
              )}
              {details.downPayment && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Down: PKR {details.downPayment.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Ionicons name="document-text-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.cardMetaText}>
                  {app.applicationId || app._id || 'N/A'}
                </Text>
                <Text style={styles.cardMetaText}>•</Text>
                <Text style={styles.cardMetaText}>{formatDate(app.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  router.push({
                    pathname: '/application-details',
                    params: {
                      type: 'installment',
                      applicationId: app._id || app.applicationId,
                    },
                  } as any);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (selectedCategory === 'properties') {
      const propertyImageUrl = getPropertyImage(app);
      const propertyName = getPropertyName(app);
      const statusColor = getStatusColor(app.status);
      const details = getPropertyDetails(app);
      
      return (
        <TouchableOpacity
          key={app._id || app.applicationId || index}
          style={styles.applicationCard}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/application-details',
              params: {
                type: 'property',
                applicationId: app._id || app.applicationId,
              },
            } as any);
          }}
        >
          {propertyImageUrl ? (
            <LazyImage
              source={{ uri: propertyImageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <PropertyCardIcon size={56} color={colors.accent} />
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {propertyName}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '15', borderColor: statusColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel(app.status)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Details Section */}
            <View style={styles.cardDetails}>
              {details.location && (
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText} numberOfLines={1}>{details.location}</Text>
                </View>
              )}
              {details.price && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    PKR {details.price.toLocaleString()}
                  </Text>
                </View>
              )}
              {details.monthlyRent && (
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    PKR {details.monthlyRent.toLocaleString()}/month
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Ionicons name="document-text-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.cardMetaText}>
                  {app.applicationId || app._id || 'N/A'}
                </Text>
                <Text style={styles.cardMetaText}>•</Text>
                <Text style={styles.cardMetaText}>{formatDate(app.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  router.push({
                    pathname: '/application-details',
                    params: {
                      type: 'property',
                      applicationId: app._id || app.applicationId,
                    },
                  } as any);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (selectedCategory === 'loans') {
      const loanApp = app as LoanApplication;
      const planId = (loanApp as any).planId;
      
      // Fetch loan plan if we have planId and haven't cached it yet
      if (planId && !loanPlansCache[planId]) {
        fetchLoanPlan(planId);
      }
      
      const loanName = getLoanProductName(loanApp);
      const bankName = (loanApp as any).bankName || loanPlansCache[planId]?.bankName || '';
      const loanImageUrl = getLoanProductImage(loanApp);
      const statusColor = getStatusColor(loanApp.status);
      
      return (
        <TouchableOpacity
          key={loanApp._id || loanApp.applicationId || index}
          style={styles.applicationCard}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/application-details',
              params: {
                type: 'loan',
                applicationId: loanApp._id || loanApp.applicationId,
              },
            } as any);
          }}
        >
          {loanImageUrl ? (
            <LazyImage
              source={{ uri: loanImageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <LoanCardIcon size={56} color={colors.accent} />
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardTitleWrapper}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {loanName} Loan
                  </Text>
                  {bankName && (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {bankName}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '15', borderColor: statusColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel(loanApp.status)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Details Section */}
            <View style={styles.cardDetails}>
              {(loanApp as any).loanRequirement?.requiredAmount && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    PKR {Number((loanApp as any).loanRequirement.requiredAmount).toLocaleString()}
                  </Text>
                </View>
              )}
              {(loanApp as any).loanRequirement?.preferredTenure && (
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{(loanApp as any).loanRequirement.preferredTenure} Months</Text>
                </View>
              )}
              {(loanApp as any).loanRequirement?.financingPreference && (
                <View style={styles.detailItem}>
                  <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{(loanApp as any).loanRequirement.financingPreference}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Ionicons name="document-text-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.cardMetaText}>
                  {loanApp.applicationId || loanApp._id || 'N/A'}
                </Text>
                <Text style={styles.cardMetaText}>•</Text>
                <Text style={styles.cardMetaText}>{formatDate(loanApp.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  router.push({
                    pathname: '/application-details',
                    params: {
                      type: 'loan',
                      applicationId: loanApp._id || loanApp.applicationId,
                    },
                  } as any);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (selectedCategory === 'insurance') {
      const insuranceApp = app as any;
      const insuranceName = insuranceApp.insuranceType || 
                           insuranceApp.planName || 
                           insuranceApp.productName || 
                           'Insurance Application';
      const statusColor = getStatusColor(insuranceApp.status);
      
      return (
        <TouchableOpacity
          key={insuranceApp._id || insuranceApp.applicationId || index}
          style={styles.applicationCard}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/application-details',
              params: {
                type: 'insurance',
                applicationId: insuranceApp._id || insuranceApp.applicationId,
              },
            } as any);
          }}
        >
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <InsuranceCardIcon size={56} color={colors.accent} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {insuranceName}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '15', borderColor: statusColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel(insuranceApp.status)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Details Section */}
            <View style={styles.cardDetails}>
              {insuranceApp.coverageAmount && (
                <View style={styles.detailItem}>
                  <Ionicons name="shield-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Coverage: PKR {Number(insuranceApp.coverageAmount).toLocaleString()}
                  </Text>
                </View>
              )}
              {insuranceApp.premium && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Premium: PKR {Number(insuranceApp.premium).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Ionicons name="document-text-outline" size={12} color={colors.textTertiary} />
                <Text style={styles.cardMetaText}>
                  {insuranceApp.applicationId || insuranceApp._id || 'N/A'}
                </Text>
                <Text style={styles.cardMetaText}>•</Text>
                <Text style={styles.cardMetaText}>{formatDate(insuranceApp.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  router.push({
                    pathname: '/application-details',
                    params: {
                      type: 'insurance',
                      applicationId: insuranceApp._id || insuranceApp.applicationId,
                    },
                  } as any);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderEmptyState = () => {
    const categoryLabels: Record<Category, { title: string; description: string; icon: string }> = {
      installments: {
        title: 'No Installment Applications',
        description: 'Start by applying for an installment plan',
        icon: 'card-outline',
      },
      properties: {
        title: 'No Property Applications',
        description: 'Start by applying for a property',
        icon: 'home-outline',
      },
      loans: {
        title: 'No Loan Applications',
        description: 'Start by applying for a loan',
        icon: 'wallet-outline',
      },
      insurance: {
        title: 'No Insurance Applications',
        description: 'Start by applying for insurance',
        icon: 'shield-outline',
      },
    };

    const empty = categoryLabels[selectedCategory];

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name={empty.icon as any} size={64} color={colors.gray300} />
        </View>
        <Text style={styles.emptyTitle}>{empty.title}</Text>
        <Text style={styles.emptyDescription}>{empty.description}</Text>
      </View>
    );
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'installments':
        return 'card-outline';
      case 'properties':
        return 'home-outline';
      case 'loans':
        return 'wallet-outline';
      case 'insurance':
        return 'shield-outline';
      default:
        return 'grid-outline';
    }
  };

  const getCategoryCount = (category: Category) => {
    return getApplicationsForCategory(category).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {getCategoryCount(selectedCategory)} {selectedCategory === 'installments' ? 'applications' : selectedCategory === 'properties' ? 'applications' : 'applications'}
            </Text>
          </View>
        </View>
      </View>

      {/* Enhanced Category Tabs with Icons */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {(['installments', 'properties', 'loans', 'insurance'] as Category[]).map((category) => {
            const isActive = selectedCategory === category;
            const count = getCategoryCount(category);
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconContainer, isActive && styles.tabIconContainerActive]}>
                  <Ionicons
                    name={getCategoryIcon(category) as any}
                    size={20}
                    color={isActive ? colors.white : colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Applications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.gridContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.gridCardSkeleton}>
                <SkeletonLoader width="100%" height={100} borderRadius={0} />
                <View style={styles.skeletonContent}>
                  <SkeletonLoader width="80%" height={14} borderRadius={4} style={{ marginBottom: spacing.xs }} />
                  <SkeletonLoader width="60%" height={12} borderRadius={4} style={{ marginBottom: spacing.xs }} />
                  <SkeletonLoader width="70%" height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {applications.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.gridContainer}>
                {applications.map((app, index) => (
                  <View key={app._id || app.applicationId || index} style={styles.gridItem}>
                    {renderApplicationCard(app, index)}
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabsWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tabsContainer: {
    backgroundColor: colors.white,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
    gap: spacing.xs,
    minHeight: 44,
  },
  tabActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80, // Space for floating nav bar
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gridItem: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
  },
  applicationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 0,
  },
  gridCardSkeleton: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.sm,
  },
  skeletonContent: {
    padding: spacing.sm,
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardImagePlaceholder: {
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.sm,
    minHeight: 140,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 18,
  },
  cardTitleWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDetails: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  cardFooter: {
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: 6,
  },
  cardMetaText: {
    fontSize: 9,
    color: colors.textTertiary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
