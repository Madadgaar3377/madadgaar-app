import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Modal, Pressable, TextInput } from 'react-native';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Try to import WebView, fallback to null if not available
let WebView: any = null;
try {
    WebView = require('react-native-webview').WebView;
} catch (e) {
    // WebView not available, will use text fallback
}
import { 
  getPropertyById,
  getAllProperties,
  Property,
  getPropertyTitle,
  getPropertyLocation,
  getPropertyPrice,
  getPropertyPriceRange,
  getPropertyMonthlyRent,
  getPropertyAreaSize,
  getPropertyBedrooms,
  getPropertyBathrooms,
  getPropertyImages,
  getPropertyDescription,
  getPropertyHighlights,
  getPropertyUtilities,
  getPropertyAmenities,
  getPropertyTransaction,
  getPropertyContact,
  getPropertyNearbyLandmarks,
  getPropertyProjectType,
  getPropertyFurnishingStatus,
  getPropertyPossessionStatus,
  getPropertyFloor,
  getPropertyTotalFloors,
  getPropertyKitchenType,
  getPropertyZoningType,
  getPropertyTotalUnits,
  getPropertyTotalLandArea,
  getPropertyTypicalUnitSizes,
  getPropertyProjectStage,
  getPropertyExpectedCompletionDate,
} from '@/services/property.api';
import { colors, spacing } from '@/theme';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const RED_PRIMARY = '#D32F2F';

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [property, setProperty] = useState<Property | null>(null);
    const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [contactFormData, setContactFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [submittingContact, setSubmittingContact] = useState(false);
    const imageScrollRef = useRef<ScrollView>(null);
    const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isUserScrollingRef = useRef(false);

    useEffect(() => {
        loadProperty();
        return () => {
            if (autoScrollTimerRef.current) {
                clearInterval(autoScrollTimerRef.current);
            }
        };
    }, [id]);

    // Auto-scroll images
    useEffect(() => {
        if (property?.images && property.images.length > 1) {
            if (autoScrollTimerRef.current) {
                clearInterval(autoScrollTimerRef.current);
            }

            const startAutoScroll = () => {
                if (autoScrollTimerRef.current) {
                    clearInterval(autoScrollTimerRef.current);
                }

                autoScrollTimerRef.current = setInterval(() => {
                    if (isUserScrollingRef.current) return;

                    setActiveImageIndex((prevIndex) => {
                        const nextIndex = (prevIndex + 1) % property.images!.length;
                        
                        if (imageScrollRef.current) {
                            imageScrollRef.current.scrollTo({
                                x: nextIndex * width,
                                animated: true,
                            });
                        }
                        
                        return nextIndex;
                    });
                }, 3000);
            };

            const initialDelay = setTimeout(() => {
                startAutoScroll();
            }, 2000);

            return () => {
                if (autoScrollTimerRef.current) {
                    clearInterval(autoScrollTimerRef.current);
                }
                clearTimeout(initialDelay);
            };
        }
    }, [property?.images]);

    const loadProperty = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getPropertyById(id as string);
            setProperty(data);
            
            // Load related properties
            if (data) {
                try {
                    const allProperties = await getAllProperties();
                    const currentCity = data.type === 'Project' 
                        ? data.project?.city 
                        : data.individualProperty?.city;
                    const currentPropertyType = data.type === 'Project'
                        ? data.project?.projectType
                        : data.individualProperty?.propertyType;
                    
                    const related = allProperties
                        .filter(p => {
                            if (p._id === id || p.id === id) return false;
                            const propCity = p.type === 'Project' 
                                ? p.project?.city 
                                : p.individualProperty?.city;
                            const propType = p.type === 'Project'
                                ? p.project?.projectType
                                : p.individualProperty?.propertyType;
                            return propCity === currentCity || propType === currentPropertyType;
                        })
                        .slice(0, 6);
                    
                    setRelatedProperties(related);
                } catch (err) {
                    console.error('Error loading related properties:', err);
                }
            }
        } catch (error) {
            // Error loading property
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <DetailPageSkeleton />
            </View>
        );
    }

    if (!property) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Property not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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

    const getAmenityIcon = (label: string): string => {
        const iconMap: { [key: string]: string } = {
            'Security': 'shield-checkmark',
            'CCTV': 'videocam',
            'Fire Safety': 'flame',
            'Parks': 'leaf',
            'Playground': 'football',
            'Clubhouse': 'home',
            'Gym': 'barbell',
            'Swimming Pool': 'water',
            'Mosque': 'business',
            'School': 'school',
            'Medical Facility': 'medical',
            'Parking': 'car',
            'EV Charging': 'flash',
            'Waste Management': 'trash',
            'Elevator': 'arrow-up-circle',
            'Electricity': 'flash',
            'Water': 'water',
            'Gas': 'flame',
            'Internet': 'wifi',
            'Sewage': 'water',
            'Underground Electricity': 'flash',
            'Water Supply': 'water',
            'Sewerage System': 'water',
            'Drainage System': 'water',
            'Backup Power': 'battery-charging',
            'Community Center': 'people',
            'Commercial Zone': 'storefront',
            'Garden': 'flower',
            'Jogging Track': 'walk',
            'Sports Courts': 'football',
            'Water Features': 'water',
            'Pet Park': 'paw',
            'Servant Quarters': 'home',
            'Drawing Room': 'home',
            'Dining Room': 'restaurant',
            'Study Room': 'book',
            'Prayer Room': 'business',
            'Lounge': 'cafe',
            'Store Room': 'archive',
            'Laundry Room': 'shirt',
            'Steam Room': 'water',
            'Balcony': 'square',
            'Terrace': 'square',
            'Reception Area': 'business',
            'Meeting Room': 'people',
            'Public Transport Access': 'bus',
            'Common Area WiFi': 'wifi',
            'Air Conditioning': 'snow',
            'Branding Space': 'megaphone',
            'Retail Shops': 'storefront',
            'Loading/Unloading Area': 'car',
            'Cafeteria': 'restaurant',
            'Laundry Service': 'shirt',
        };
        return iconMap[label] || 'checkmark-circle';
    };

    const renderAmenity = (label: string, value: boolean | string | undefined | null) => {
        // Handle null/undefined
        if (value === undefined || value === null) return null;
        
        // Handle boolean false
        if (value === false) return null;
        
        // Handle string values
        if (typeof value === 'string') {
            const strValue = value.trim();
            if (strValue === '' || strValue.toLowerCase() === 'no' || strValue === 'N/A') {
                return null;
            }
        }
        
        const iconName = getAmenityIcon(label);
        
        // Only render if value is truthy (true boolean or non-empty string)
        return (
            <View key={label} style={styles.amenityItem}>
                <Ionicons name={iconName as any} size={18} color={RED_PRIMARY} />
                <Text style={styles.amenityText}>{label}</Text>
            </View>
        );
    };

    const handleContactFormSubmit = async () => {
        if (!contactFormData.name || !contactFormData.email || !contactFormData.message) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please fill in all required fields',
                position: 'top',
                visibilityTime: 2500,
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactFormData.email)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address',
                position: 'top',
                visibilityTime: 2500,
            });
            return;
        }

        try {
            setSubmittingContact(true);
            const response = await fetch('https://api.madadgaar.com.pk/api/submitContactForm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: contactFormData.name.trim(),
                    email: contactFormData.email.trim().toLowerCase(),
                    subject: `Inquiry about ${getPropertyTitle(property)}`,
                    body: contactFormData.message.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to submit contact form');
            }

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: data.message || 'Contact form submitted successfully. We will get back to you soon!',
                position: 'top',
                visibilityTime: 3000,
            });

            // Reset form
            setContactFormData({
                name: '',
                email: '',
                phone: '',
                message: '',
            });

            setShowContactForm(false);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to submit contact form. Please try again.',
                position: 'top',
                visibilityTime: 2500,
            });
        } finally {
            setSubmittingContact(false);
        }
    };

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>Property Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Image Carousel */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        ref={imageScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScrollBeginDrag={() => {
                            isUserScrollingRef.current = true;
                            if (autoScrollTimerRef.current) {
                                clearInterval(autoScrollTimerRef.current);
                            }
                        }}
                        onScrollEndDrag={() => {
                            setTimeout(() => {
                                isUserScrollingRef.current = false;
                                const images = property ? getPropertyImages(property) : [];
                                if (images.length > 1) {
                                    if (autoScrollTimerRef.current) {
                                        clearInterval(autoScrollTimerRef.current);
                                    }
                                    autoScrollTimerRef.current = setInterval(() => {
                                        if (isUserScrollingRef.current) return;
                                        setActiveImageIndex((prevIndex) => {
                                            const nextIndex = (prevIndex + 1) % images.length;
                                            if (imageScrollRef.current) {
                                                imageScrollRef.current.scrollTo({
                                                    x: nextIndex * width,
                                                    animated: true,
                                                });
                                            }
                                            return nextIndex;
                                        });
                                    }, 3000);
                                }
                            }, 3000);
                        }}
                        onScroll={(e) => {
                            const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                            if (slide !== activeImageIndex) {
                                setActiveImageIndex(slide);
                            }
                        }}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={(e) => {
                            const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                            setActiveImageIndex(slide);
                        }}
                    >
                        {(() => {
                            const images = getPropertyImages(property);
                            if (images.length > 0) {
                                return images.map((img, index) => (
                                    <LazyImage
                                        key={index}
                                        source={{ uri: img }}
                                        style={styles.propertyImage}
                                        resizeMode="cover"
                                    />
                                ));
                            }
                            return (
                                <View style={[styles.propertyImage, styles.placeholderImage]}>
                                    <Ionicons name="home-outline" size={64} color="#ccc" />
                                </View>
                            );
                        })()}
                    </ScrollView>

                    {/* Pagination Dots */}
                    {(() => {
                        const images = getPropertyImages(property);
                        return images.length > 1 && (
                            <View style={styles.pagination}>
                                {images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.paginationDot,
                                            index === activeImageIndex && styles.paginationDotActive
                                        ]}
                                    />
                                ))}
                            </View>
                        );
                    })()}
                </View>

                {/* Title and Price */}
                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{getPropertyTitle(property)}</Text>
                        {property.purpose && (
                            <View style={styles.purposeBadge}>
                                <Text style={styles.purposeBadgeText}>{property.purpose}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.priceRow}>
                        {(() => {
                            const transaction = getPropertyTransaction(property);
                            if (transaction?.type === 'Rent') {
                                const monthlyRent = getPropertyMonthlyRent(property);
                                if (monthlyRent) {
                                    return (
                                        <>
                                            <Text style={styles.mainPriceLabel}>Monthly Rent</Text>
                                            <Text style={styles.mainPrice}>
                                                PKR {monthlyRent.toLocaleString()}
                                            </Text>
                                        </>
                                    );
                                }
                            } else if (transaction?.type === 'Installment') {
                                const price = getPropertyPrice(property);
                                const monthlyInstallment = getPropertyMonthlyRent(property);
                                if (price || monthlyInstallment) {
                                    return (
                                        <>
                                            <Text style={styles.mainPriceLabel}>Price</Text>
                                            <Text style={styles.mainPrice}>
                                                PKR {price ? price.toLocaleString() : 'N/A'}
                                            </Text>
                                            {monthlyInstallment && (
                                                <Text style={styles.monthlyInstallmentText}>
                                                    PKR {monthlyInstallment.toLocaleString()}/month
                                                </Text>
                                            )}
                                        </>
                                    );
                                }
                            } else {
                                // Sale or default - check for priceRange first (for Projects)
                                const priceRange = getPropertyPriceRange(property);
                                if (priceRange) {
                                    return (
                                        <>
                                            <Text style={styles.mainPriceLabel}>Price</Text>
                                            <Text style={styles.mainPrice}>
                                                {priceRange}
                                            </Text>
                                        </>
                                    );
                                }
                                // Fallback to single price
                                const price = getPropertyPrice(property);
                                if (price) {
                                    return (
                                        <>
                                            <Text style={styles.mainPriceLabel}>Price</Text>
                                            <Text style={styles.mainPrice}>
                                                PKR {price.toLocaleString()}
                                            </Text>
                                        </>
                                    );
                                }
                            }
                            return (
                                <>
                                    <Text style={styles.mainPriceLabel}>Price</Text>
                                    <Text style={styles.mainPrice}>Contact for Price</Text>
                                </>
                            );
                        })()}
                    </View>
                    {getPropertyLocation(property) && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.locationText}>{getPropertyLocation(property)}</Text>
                        </View>
                    )}
                </View>

                {/* Project Specific Information */}
                {property.type === 'Project' && property.project && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Project Information</Text>
                            <View style={styles.infoGrid}>
                                {renderDetailRow('Project Type', property.project.projectType, 'business-outline')}
                                {renderDetailRow('Development Type', property.project.developmentType, 'construct-outline')}
                                {renderDetailRow('Infrastructure Status', property.project.infrastructureStatus, 'settings-outline')}
                                {renderDetailRow('Project Stage', getPropertyProjectStage(property), 'flag-outline')}
                                {renderDetailRow('Expected Completion', getPropertyExpectedCompletionDate(property), 'calendar-outline')}
                                {renderDetailRow('Total Land Area', getPropertyTotalLandArea(property), 'resize-outline')}
                                {renderDetailRow('Total Units', getPropertyTotalUnits(property)?.toString(), 'home-outline')}
                                {renderDetailRow('Typical Unit Sizes', getPropertyTypicalUnitSizes(property), 'expand-outline')}
                                {renderDetailRow('District', property.project.district, 'location-outline')}
                                {renderDetailRow('Tehsil', property.project.tehsil, 'location-outline')}
                                {renderDetailRow('Area', property.project.area, 'location-outline')}
                                {renderDetailRow('Street', property.project.street, 'location-outline')}
                            </View>
                        </View>

                        {getPropertyHighlights(property).length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Key Highlights</Text>
                                <View style={styles.highlightsContainer}>
                                    {getPropertyHighlights(property).map((highlight, index) => (
                                        <View key={index} style={styles.highlightItem}>
                                            <View style={styles.highlightNumber}>
                                                <Text style={styles.highlightNumberText}>{index + 1}</Text>
                                            </View>
                                            <Text style={styles.highlightText}>{highlight}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Individual Property Specific Information */}
                {property.type === 'Individual' && property.individualProperty && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Property Details</Text>
                            <View style={styles.infoGrid}>
                                {renderDetailRow('Property Type', getPropertyProjectType(property), 'home-outline')}
                                {renderDetailRow('Area Size', getPropertyAreaSize(property), 'resize-outline')}
                                {renderDetailRow('City', property.individualProperty.city, 'location-outline')}
                                {renderDetailRow('Location', property.individualProperty.location, 'location-outline')}
                                {renderDetailRow('Bedrooms', getPropertyBedrooms(property)?.toString(), 'bed-outline')}
                                {renderDetailRow('Bathrooms', getPropertyBathrooms(property)?.toString(), 'water-outline')}
                                {renderDetailRow('Kitchen Type', getPropertyKitchenType(property), 'restaurant-outline')}
                                {renderDetailRow('Furnishing Status', getPropertyFurnishingStatus(property), 'cube-outline')}
                                {renderDetailRow('Floor', getPropertyFloor(property)?.toString(), 'layers-outline')}
                                {renderDetailRow('Total Floors', getPropertyTotalFloors(property)?.toString(), 'layers-outline')}
                                {renderDetailRow('Possession Status', getPropertyPossessionStatus(property), 'checkmark-circle-outline')}
                                {renderDetailRow('Zoning Type', getPropertyZoningType(property), 'map-outline')}
                            </View>
                        </View>

                        {getPropertyHighlights(property).length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Key Highlights</Text>
                                <View style={styles.highlightsContainer}>
                                    {getPropertyHighlights(property).map((highlight, index) => (
                                        <View key={index} style={styles.highlightItem}>
                                            <View style={styles.highlightNumber}>
                                                <Text style={styles.highlightNumberText}>{index + 1}</Text>
                                            </View>
                                            <Text style={styles.highlightText}>{highlight}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Transaction Information */}
                {(() => {
                    const transaction = getPropertyTransaction(property);
                    if (!transaction) return null;
                    
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Transaction Details</Text>
                            <View style={styles.paymentCard}>
                                {transaction.type && (
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabel}>Transaction Type</Text>
                                        <Text style={[styles.paymentValue, { color: RED_PRIMARY, fontWeight: '700' }]}>
                                            {transaction.type}
                                        </Text>
                                    </View>
                                )}
                                
                                {/* Sale Fields */}
                                {transaction.type === 'Sale' && transaction.price && (
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabel}>Price</Text>
                                        <Text style={styles.paymentValue}>
                                            PKR {transaction.price.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                                
                                {/* Rent Fields */}
                                {transaction.type === 'Rent' && (
                                    <>
                                        {transaction.monthlyRent && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Monthly Rent</Text>
                                                <Text style={styles.paymentValue}>
                                                    PKR {transaction.monthlyRent.toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        {transaction.advanceAmount && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Advance Amount</Text>
                                                <Text style={styles.paymentValue}>
                                                    PKR {transaction.advanceAmount.toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        {transaction.contractDuration && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Contract Duration</Text>
                                                <Text style={styles.paymentValue}>{transaction.contractDuration}</Text>
                                            </View>
                                        )}
                                    </>
                                )}
                                
                                {/* Installment Fields */}
                                {transaction.type === 'Installment' && (
                                    <>
                                        {transaction.bookingAmount && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Booking Amount</Text>
                                                <Text style={styles.paymentValue}>
                                                    PKR {transaction.bookingAmount.toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        {transaction.downPayment && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Down Payment</Text>
                                                <Text style={styles.paymentValue}>
                                                    PKR {transaction.downPayment.toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        {transaction.monthlyInstallment && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Monthly Installment</Text>
                                                <Text style={styles.paymentValue}>
                                                    PKR {transaction.monthlyInstallment.toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                        {transaction.tenure && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Tenure</Text>
                                                <Text style={styles.paymentValue}>{transaction.tenure}</Text>
                                            </View>
                                        )}
                                        {transaction.totalPayable && (
                                            <View style={styles.paymentRow}>
                                                <Text style={styles.paymentLabel}>Total Payable</Text>
                                                <Text style={styles.paymentValue}>
                                                    PKR {transaction.totalPayable.toLocaleString()}
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                )}
                                
                                {transaction.additionalInfo && (
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.paymentLabel}>Additional Info</Text>
                                        <Text style={styles.paymentValue}>{transaction.additionalInfo}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })()}

                {/* Utilities */}
                {(() => {
                    const utilities = getPropertyUtilities(property);
                    if (!utilities) return null;
                    
                    const hasUtilities = Object.values(utilities).some(v => v === true);
                    if (!hasUtilities) return null;
                    
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Utilities</Text>
                            <View style={styles.amenitiesGrid}>
                                {renderAmenity('Electricity', utilities.electricity)}
                                {renderAmenity('Water', utilities.water)}
                                {renderAmenity('Gas', utilities.gas)}
                                {renderAmenity('Internet', utilities.internet)}
                                {renderAmenity('Sewage', utilities.sewage)}
                            </View>
                        </View>
                    );
                })()}

                {/* Features & Amenities */}
                {(() => {
                    const amenities = getPropertyAmenities(property);
                    if (!amenities) return null;
                    
                    const hasAmenities = Object.values(amenities).some(v => v === true);
                    if (!hasAmenities) return null;
                    
                    // Organize amenities by category
                    const infrastructureUtilities = [
                        { key: 'undergroundElectricity', label: 'Underground Electricity' },
                        { key: 'waterSupply', label: 'Water Supply' },
                        { key: 'sewerageSystem', label: 'Sewerage System' },
                        { key: 'drainageSystem', label: 'Drainage System' },
                        { key: 'backupPower', label: 'Backup Power' },
                    ];
                    
                    const religiousCommunity = [
                        { key: 'mosque', label: 'Mosque' },
                        { key: 'communityCenter', label: 'Community Center' },
                    ];
                    
                    const educationHealth = [
                        { key: 'school', label: 'School' },
                        { key: 'medicalFacility', label: 'Medical Facility' },
                        { key: 'commercialZone', label: 'Commercial Zone' },
                    ];
                    
                    const recreational = [
                        { key: 'parks', label: 'Parks' },
                        { key: 'playground', label: 'Playground' },
                        { key: 'garden', label: 'Garden' },
                        { key: 'swimmingPool', label: 'Swimming Pool' },
                        { key: 'clubhouse', label: 'Clubhouse' },
                        { key: 'joggingTrack', label: 'Jogging Track' },
                        { key: 'sportsCourts', label: 'Sports Courts' },
                        { key: 'waterFeatures', label: 'Water Features' },
                        { key: 'petPark', label: 'Pet Park' },
                    ];
                    
                    const residentialInterior = [
                        { key: 'servantQuarters', label: 'Servant Quarters' },
                        { key: 'drawingRoom', label: 'Drawing Room' },
                        { key: 'diningRoom', label: 'Dining Room' },
                        { key: 'studyRoom', label: 'Study Room' },
                        { key: 'prayerRoom', label: 'Prayer Room' },
                        { key: 'lounge', label: 'Lounge' },
                        { key: 'storeRoom', label: 'Store Room' },
                        { key: 'laundryRoom', label: 'Laundry Room' },
                        { key: 'gym', label: 'Gym' },
                        { key: 'steamRoom', label: 'Steam Room' },
                    ];
                    
                    const buildingFeatures = [
                        { key: 'parking', label: 'Parking' },
                        { key: 'balcony', label: 'Balcony' },
                        { key: 'terrace', label: 'Terrace' },
                        { key: 'elevator', label: 'Elevator' },
                        { key: 'receptionArea', label: 'Reception Area' },
                        { key: 'meetingRoom', label: 'Meeting Room' },
                        { key: 'publicTransportAccess', label: 'Public Transport Access' },
                        { key: 'commonAreaWifi', label: 'Common Area WiFi' },
                    ];
                    
                    const securitySystems = [
                        { key: 'security', label: 'Security' },
                        { key: 'cctv', label: 'CCTV' },
                        { key: 'fireSafety', label: 'Fire Safety' },
                        { key: 'airConditioning', label: 'Air Conditioning' },
                    ];
                    
                    const commercialMisc = [
                        { key: 'brandingSpace', label: 'Branding Space' },
                        { key: 'retailShops', label: 'Retail Shops' },
                        { key: 'loadingUnloadingArea', label: 'Loading/Unloading Area' },
                        { key: 'cafeteria', label: 'Cafeteria' },
                        { key: 'laundryService', label: 'Laundry Service' },
                        { key: 'evCharging', label: 'EV Charging' },
                        { key: 'wasteManagement', label: 'Waste Management' },
                    ];
                    
                    const renderCategory = (title: string, items: { key: string; label: string }[]) => {
                        const activeItems = items.filter(item => amenities[item.key as keyof typeof amenities] === true);
                        if (activeItems.length === 0) return null;
                        
                        return (
                            <View key={title} style={styles.amenityCategory}>
                                <Text style={styles.amenityCategoryTitle}>{title}</Text>
                                <View style={styles.amenitiesGrid}>
                                    {activeItems.map(item => renderAmenity(item.label, true))}
                                </View>
                            </View>
                        );
                    };
                    
                    return (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Features & Amenities</Text>
                                <Ionicons name="star-outline" size={20} color={RED_PRIMARY} />
                            </View>
                            <View style={styles.amenitiesContainer}>
                                {renderCategory('Infrastructure & Utilities', infrastructureUtilities)}
                                {renderCategory('Religious & Community', religiousCommunity)}
                                {renderCategory('Education, Health & Commercial', educationHealth)}
                                {renderCategory('Recreational & Outdoor', recreational)}
                                {renderCategory('Residential Interior', residentialInterior)}
                                {renderCategory('Building & Property Features', buildingFeatures)}
                                {renderCategory('Security & Building Systems', securitySystems)}
                                {renderCategory('Commercial & Miscellaneous', commercialMisc)}
                            </View>
                        </View>
                    );
                })()}

                {/* Nearby Landmarks */}
                {getPropertyNearbyLandmarks(property) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Nearby Landmarks</Text>
                        <Text style={styles.descriptionText}>{getPropertyNearbyLandmarks(property)}</Text>
                    </View>
                )}

                {/* Description */}
                {getPropertyDescription(property) && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Ionicons name="document-text-outline" size={20} color={RED_PRIMARY} />
                        </View>
                        <View style={styles.descriptionContainer}>
                            {showFullDescription ? (
                                <>
                                    {WebView ? (
                                        <WebView
                                            source={{ html: `
                                                <!DOCTYPE html>
                                                <html>
                                                    <head>
                                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                        <style>
                                                            body {
                                                                margin: 0;
                                                                padding: 12px;
                                                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                                                font-size: 15px;
                                                                line-height: 1.6;
                                                                color: #333;
                                                            }
                                                            p {
                                                                margin: 0 0 12px 0;
                                                            }
                                                            h1, h2, h3, h4, h5, h6 {
                                                                margin: 16px 0 8px 0;
                                                                font-weight: 700;
                                                                color: #1A1A1A;
                                                            }
                                                            h1 { font-size: 24px; }
                                                            h2 { font-size: 20px; }
                                                            h3 { font-size: 18px; }
                                                            ul, ol {
                                                                margin: 8px 0;
                                                                padding-left: 24px;
                                                            }
                                                            li {
                                                                margin: 4px 0;
                                                            }
                                                            strong {
                                                                font-weight: 700;
                                                            }
                                                            em {
                                                                font-style: italic;
                                                            }
                                                            a {
                                                                color: #D32F2F;
                                                                text-decoration: none;
                                                            }
                                                            img {
                                                                max-width: 100%;
                                                                height: auto;
                                                                border-radius: 8px;
                                                                margin: 12px 0;
                                                            }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        ${getPropertyDescription(property)}
                                                    </body>
                                                </html>
                                            ` }}
                                            style={styles.webView}
                                            scrollEnabled={false}
                                            showsVerticalScrollIndicator={false}
                                            onMessage={() => {}}
                                        />
                                    ) : (
                                        <Text style={styles.descriptionText}>
                                            {getPropertyDescription(property).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                                        </Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.viewMoreButton}
                                        onPress={() => setShowFullDescription(false)}
                                    >
                                        <Text style={styles.viewMoreText}>Show Less</Text>
                                        <Ionicons name="chevron-up" size={16} color={RED_PRIMARY} />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.descriptionPreview} numberOfLines={3}>
                                        {getPropertyDescription(property).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.viewMoreButton}
                                        onPress={() => setShowFullDescription(true)}
                                    >
                                        <Text style={styles.viewMoreText}>View More</Text>
                                        <Ionicons name="chevron-down" size={16} color={RED_PRIMARY} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Contact Information */}
                {(() => {
                    const contact = getPropertyContact(property);
                    if (!contact) return null;
                    
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <View style={styles.contactCard}>
                                {contact.name && renderDetailRow('Name', contact.name, 'person-outline')}
                                {contact.email && renderDetailRow('Email', contact.email, 'mail-outline')}
                                {contact.number && renderDetailRow('Phone', contact.number, 'call-outline')}
                                {contact.whatsapp && renderDetailRow('WhatsApp', contact.whatsapp, 'logo-whatsapp')}
                                {contact.cnic && renderDetailRow('CNIC', contact.cnic, 'id-card-outline')}
                                {contact.city && renderDetailRow('City', contact.city, 'location-outline')}
                                {contact.area && renderDetailRow('Area', contact.area, 'map-outline')}
                            </View>
                        </View>
                    );
                })()}

                {/* Related Properties */}
                {relatedProperties.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Related Properties</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.relatedPropertiesContainer}
                        >
                            {relatedProperties.map((relatedProp) => {
                                const images = getPropertyImages(relatedProp);
                                const title = getPropertyTitle(relatedProp);
                                const location = getPropertyLocation(relatedProp);
                                const transaction = getPropertyTransaction(relatedProp);
                                
                                return (
                                    <TouchableOpacity
                                        key={relatedProp._id || relatedProp.id}
                                        style={styles.relatedPropertyCard}
                                        onPress={() => {
                                            router.push(`/property-details/${relatedProp._id || relatedProp.id}` as any);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        {images && images.length > 0 ? (
                                            <LazyImage
                                                source={{ uri: images[0] }}
                                                style={styles.relatedPropertyImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.relatedPropertyImage, styles.relatedPropertyPlaceholder]}>
                                                <Ionicons name="home-outline" size={32} color="#ccc" />
                                            </View>
                                        )}
                                        <View style={styles.relatedPropertyContent}>
                                            <Text style={styles.relatedPropertyTitle} numberOfLines={2}>
                                                {title}
                                            </Text>
                                            {location && (
                                                <View style={styles.relatedPropertyLocation}>
                                                    <Ionicons name="location-outline" size={12} color="#999" />
                                                    <Text style={styles.relatedPropertyLocationText} numberOfLines={1}>
                                                        {location}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.relatedPropertyPrice}>
                                                {(() => {
                                                    if (transaction?.type === 'Rent') {
                                                        const rent = getPropertyMonthlyRent(relatedProp);
                                                        return rent ? (
                                                            <Text style={styles.relatedPropertyPriceText}>
                                                                PKR {rent.toLocaleString()}/mo
                                                            </Text>
                                                        ) : (
                                                            <Text style={styles.relatedPropertyPriceText}>Contact for Price</Text>
                                                        );
                                                    } else {
                                                        // Check for priceRange first (for Projects)
                                                        const priceRange = getPropertyPriceRange(relatedProp);
                                                        if (priceRange) {
                                                            return (
                                                                <Text style={styles.relatedPropertyPriceText}>
                                                                    {priceRange}
                                                                </Text>
                                                            );
                                                        }
                                                        // Fallback to single price
                                                        const price = getPropertyPrice(relatedProp);
                                                        return price ? (
                                                            <Text style={styles.relatedPropertyPriceText}>
                                                                PKR {price.toLocaleString()}
                                                            </Text>
                                                        ) : (
                                                            <Text style={styles.relatedPropertyPriceText}>Contact for Price</Text>
                                                        );
                                                    }
                                                })()}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => setShowContactModal(true)}
                >
                    <Ionicons name="call-outline" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Contact Us</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={() => {
                        // Navigate to apply property form
                        router.push({
                            pathname: '/apply-property',
                            params: { id: property._id || property.id }
                        } as any);
                    }}
                >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
            </View>

            {/* Contact Options Modal */}
            <Modal
                visible={showContactModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowContactModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowContactModal(false)}
                >
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Contact Method</Text>
                            <TouchableOpacity 
                                onPress={() => setShowContactModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalOptions}>
                            {(() => {
                                const contact = getPropertyContact(property);
                                const phoneNumber = contact?.number || property.mobile || property.commonForm?.mobile;
                                const whatsappNumber = contact?.whatsapp || property.commonForm?.whatsApp;
                                const emailAddress = contact?.email || property.email || property.commonForm?.email;
                                
                                const handlePhoneCall = () => {
                                    if (!phoneNumber) return;
                                    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
                                    Linking.openURL(`tel:${cleanNumber}`).catch((err) => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Error',
                                            text2: 'Unable to open phone dialer',
                                            position: 'top',
                                            visibilityTime: 2500,
                                        });
                                    });
                                    setShowContactModal(false);
                                };
                                
                                const handleWhatsApp = () => {
                                    if (!whatsappNumber) return;
                                    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
                                    // Remove leading + or 0 if present, add country code if needed
                                    let formattedNumber = cleanNumber;
                                    if (formattedNumber.startsWith('0')) {
                                        formattedNumber = '92' + formattedNumber.substring(1);
                                    } else if (!formattedNumber.startsWith('92')) {
                                        formattedNumber = '92' + formattedNumber;
                                    }
                                    Linking.openURL(`https://wa.me/${formattedNumber}`).catch((err) => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Error',
                                            text2: 'Unable to open WhatsApp',
                                            position: 'top',
                                            visibilityTime: 2500,
                                        });
                                    });
                                    setShowContactModal(false);
                                };
                                
                                const handleEmail = () => {
                                    if (!emailAddress) return;
                                    const subject = encodeURIComponent(`Inquiry about ${getPropertyTitle(property)}`);
                                    const body = encodeURIComponent(`Hello,\n\nI am interested in the property: ${getPropertyTitle(property)}\n\nPlease provide more information.\n\nThank you.`);
                                    Linking.openURL(`mailto:${emailAddress}?subject=${subject}&body=${body}`).catch((err) => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Error',
                                            text2: 'Unable to open email client',
                                            position: 'top',
                                            visibilityTime: 2500,
                                        });
                                    });
                                    setShowContactModal(false);
                                };
                                
                                const hasContact = phoneNumber || whatsappNumber || emailAddress;
                                
                                return (
                                    <>
                                        {phoneNumber && (
                                            <TouchableOpacity 
                                                style={styles.contactOption}
                                                onPress={handlePhoneCall}
                                            >
                                                <View style={[styles.contactOptionIcon, { backgroundColor: '#2196F3' + '20' }]}>
                                                    <Ionicons name="call" size={24} color="#2196F3" />
                                                </View>
                                                <View style={styles.contactOptionText}>
                                                    <Text style={styles.contactOptionTitle}>Phone Call</Text>
                                                    <Text style={styles.contactOptionSubtitle}>{phoneNumber}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#999" />
                                            </TouchableOpacity>
                                        )}
                                        
                                        {whatsappNumber && (
                                            <TouchableOpacity 
                                                style={styles.contactOption}
                                                onPress={handleWhatsApp}
                                            >
                                                <View style={[styles.contactOptionIcon, { backgroundColor: '#25D366' + '20' }]}>
                                                    <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                                                </View>
                                                <View style={styles.contactOptionText}>
                                                    <Text style={styles.contactOptionTitle}>WhatsApp</Text>
                                                    <Text style={styles.contactOptionSubtitle}>{whatsappNumber}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#999" />
                                            </TouchableOpacity>
                                        )}
                                        
                                        {emailAddress && (
                                            <TouchableOpacity 
                                                style={styles.contactOption}
                                                onPress={handleEmail}
                                            >
                                                <View style={[styles.contactOptionIcon, { backgroundColor: '#D32F2F' + '20' }]}>
                                                    <Ionicons name="mail" size={24} color="#D32F2F" />
                                                </View>
                                                <View style={styles.contactOptionText}>
                                                    <Text style={styles.contactOptionTitle}>Email</Text>
                                                    <Text style={styles.contactOptionSubtitle}>{emailAddress}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#999" />
                                            </TouchableOpacity>
                                        )}
                                        
                                        {!hasContact && (
                                            <View style={styles.noContactOption}>
                                                <Ionicons name="information-circle-outline" size={48} color="#999" />
                                                <Text style={styles.noContactText}>No contact information available</Text>
                                            </View>
                                        )}
                                    </>
                                );
                            })()}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Contact Form Modal */}
            <Modal
                visible={showContactForm}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowContactForm(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowContactForm(false)}
                >
                    <Pressable style={styles.contactFormModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Contact Us</Text>
                            <TouchableOpacity 
                                onPress={() => setShowContactForm(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.contactFormScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.contactFormContainer}>
                                <Text style={styles.contactFormLabel}>Name *</Text>
                                <TextInput
                                    style={styles.contactFormInput}
                                    placeholder="Enter your name"
                                    value={contactFormData.name}
                                    onChangeText={(text) => setContactFormData({ ...contactFormData, name: text })}
                                    placeholderTextColor="#999"
                                />
                                
                                <Text style={styles.contactFormLabel}>Email *</Text>
                                <TextInput
                                    style={styles.contactFormInput}
                                    placeholder="Enter your email"
                                    value={contactFormData.email}
                                    onChangeText={(text) => setContactFormData({ ...contactFormData, email: text })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                                
                                <Text style={styles.contactFormLabel}>Phone (Optional)</Text>
                                <TextInput
                                    style={styles.contactFormInput}
                                    placeholder="Enter your phone number"
                                    value={contactFormData.phone}
                                    onChangeText={(text) => setContactFormData({ ...contactFormData, phone: text })}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#999"
                                />
                                
                                <Text style={styles.contactFormLabel}>Message *</Text>
                                <TextInput
                                    style={[styles.contactFormInput, styles.contactFormTextArea]}
                                    placeholder="Enter your message"
                                    value={contactFormData.message}
                                    onChangeText={(text) => setContactFormData({ ...contactFormData, message: text })}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    placeholderTextColor="#999"
                                />
                                
                                <TouchableOpacity
                                    style={[styles.contactFormSubmitButton, submittingContact && styles.contactFormSubmitButtonDisabled]}
                                    onPress={handleContactFormSubmit}
                                    disabled={submittingContact}
                                >
                                    {submittingContact ? (
                                        <Text style={styles.contactFormSubmitText}>Submitting...</Text>
                                    ) : (
                                        <>
                                            <Text style={styles.contactFormSubmitText}>Submit</Text>
                                            <Ionicons name="send" size={18} color="#fff" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

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
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerButton: {
        padding: 4,
    },
    imageContainer: {
        height: 300,
        backgroundColor: '#F9F9F9',
        position: 'relative',
    },
    propertyImage: {
        width: width,
        height: 300,
        backgroundColor: '#F5F5F5',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: colors.accent,
        width: 20,
    },
    section: {
        padding: 20,
        borderBottomWidth: 8,
        borderBottomColor: '#F5F5F5',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        marginRight: 12,
    },
    purposeBadge: {
        backgroundColor: RED_PRIMARY + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    purposeBadgeText: {
        color: RED_PRIMARY,
        fontSize: 12,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    mainPriceLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    mainPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.accent,
    },
    monthlyInstallmentText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        color: '#666',
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        color: '#1A1A1A',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    descriptionPreview: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 12,
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    viewMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: RED_PRIMARY,
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
    paymentCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    paymentLabel: {
        fontSize: 14,
        color: '#666',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 8,
    },
    amenityText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    amenityTextNo: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    descriptionText: {
        lineHeight: 22,
        color: '#444',
    },
    highlightsContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    highlightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: RED_PRIMARY,
    },
    highlightNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: RED_PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    highlightNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    highlightText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    amenitiesContainer: {
        flexDirection: 'column',
        gap: 20,
    },
    amenityCategory: {
        marginBottom: 16,
    },
    amenityCategoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    descriptionContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 100,
    },
    webView: {
        backgroundColor: 'transparent',
        minHeight: 100,
    },
    contactCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
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
        flexDirection: 'row',
        gap: 12,
    },
    contactButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    applyButton: {
        flex: 1,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalOptions: {
        padding: 12,
    },
    contactOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        marginBottom: 12,
    },
    contactOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactOptionText: {
        flex: 1,
    },
    contactOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    contactOptionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    noContactOption: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noContactText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
        textAlign: 'center',
    },
    relatedPropertiesContainer: {
        paddingRight: 20,
    },
    relatedPropertyCard: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    relatedPropertyImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F9F9F9',
    },
    relatedPropertyPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    relatedPropertyContent: {
        padding: 12,
    },
    relatedPropertyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
        minHeight: 40,
    },
    relatedPropertyLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    relatedPropertyLocationText: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    relatedPropertyPrice: {
        marginTop: 4,
    },
    relatedPropertyPriceText: {
        fontSize: 16,
        fontWeight: '700',
        color: RED_PRIMARY,
    },
    contactFormModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
        padding: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    contactFormScroll: {
        maxHeight: 500,
    },
    contactFormContainer: {
        padding: 20,
    },
    contactFormLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    contactFormInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        backgroundColor: '#F9F9F9',
    },
    contactFormTextArea: {
        minHeight: 120,
        paddingTop: 12,
    },
    contactFormSubmitButton: {
        backgroundColor: RED_PRIMARY,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    contactFormSubmitButtonDisabled: {
        opacity: 0.6,
    },
    contactFormSubmitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

