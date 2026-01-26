import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Modal, Pressable } from 'react-native';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  getPropertyById, 
  Property,
  getPropertyTitle,
  getPropertyLocation,
  getPropertyPrice,
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
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
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
        
        // Only render if value is truthy (true boolean or non-empty string)
        return (
            <View key={label} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={RED_PRIMARY} />
                <Text style={styles.amenityText}>{label}</Text>
            </View>
        );
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
                        <Text style={styles.mainPriceLabel}>
                            {(() => {
                                const transaction = getPropertyTransaction(property);
                                if (transaction?.type === 'Rent') return 'Monthly Rent';
                                if (transaction?.type === 'Installment') return 'Price';
                                return 'Price';
                            })()}
                        </Text>
                        <Text style={styles.mainPrice}>
                            PKR {getPropertyPrice(property)?.toLocaleString() || 
                                  getPropertyMonthlyRent(property)?.toLocaleString() || 
                                  'N/A'}
                        </Text>
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
                                <Text style={styles.sectionTitle}>Highlights</Text>
                                <View style={styles.highlightsContainer}>
                                    {getPropertyHighlights(property).map((highlight, index) => (
                                        <View key={index} style={styles.highlightItem}>
                                            <Ionicons name="star" size={14} color={RED_PRIMARY} />
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

                {/* Amenities */}
                {(() => {
                    const amenities = getPropertyAmenities(property);
                    if (!amenities) return null;
                    
                    const hasAmenities = Object.values(amenities).some(v => v === true);
                    if (!hasAmenities) return null;
                    
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Amenities</Text>
                            <View style={styles.amenitiesGrid}>
                                {renderAmenity('Security', amenities.security)}
                                {renderAmenity('CCTV', amenities.cctv)}
                                {renderAmenity('Fire Safety', amenities.fireSafety)}
                                {renderAmenity('Parks', amenities.parks)}
                                {renderAmenity('Playground', amenities.playground)}
                                {renderAmenity('Clubhouse', amenities.clubhouse)}
                                {renderAmenity('Gym', amenities.gym)}
                                {renderAmenity('Swimming Pool', amenities.swimmingPool)}
                                {renderAmenity('Mosque', amenities.mosque)}
                                {renderAmenity('School', amenities.school)}
                                {renderAmenity('Medical', amenities.medical)}
                                {renderAmenity('Parking', amenities.parking)}
                                {renderAmenity('EV Charging', amenities.evCharging)}
                                {renderAmenity('Waste Management', amenities.wasteManagement)}
                                {renderAmenity('Elevator', amenities.elevator)}
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
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{getPropertyDescription(property)}</Text>
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

            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => {
                        const contact = getPropertyContact(property);
                        const hasPhone = contact?.number || property.mobile || property.commonForm?.mobile;
                        const hasWhatsApp = contact?.whatsapp || property.commonForm?.whatsApp;
                        
                        if (!hasPhone && !hasWhatsApp) {
                            Toast.show({
                                type: 'error',
                                text1: 'No Contact Number',
                                text2: 'Contact number is not available for this property',
                                position: 'top',
                                visibilityTime: 2500,
                            });
                            return;
                        }
                        
                        setShowContactModal(true);
                    }}
                >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Contact</Text>
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
                                        
                                        {!phoneNumber && !whatsappNumber && (
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
    highlightText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        flex: 1,
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
});

