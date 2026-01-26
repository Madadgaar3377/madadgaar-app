import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getInstallmentById, getAllInstallments, Installment } from '@/services/installment.api';
import { colors, spacing } from '@/theme';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [product, setProduct] = useState<Installment | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [sameCategoryProducts, setSameCategoryProducts] = useState<Installment[]>([]);
    const imageScrollRef = useRef<ScrollView>(null);
    const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isUserScrollingRef = useRef(false);

    useEffect(() => {
        loadProduct();
        return () => {
            // Cleanup auto-scroll timer on unmount
            if (autoScrollTimerRef.current) {
                clearInterval(autoScrollTimerRef.current);
            }
        };
    }, [id]);

    const loadProduct = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getInstallmentById(id as string);
            setProduct(data);
            
            // Load same category products
            if (data?.category) {
                loadSameCategoryProducts(data.category, id as string);
            }
        } catch (error) {
            // Error loading product
        } finally {
            setLoading(false);
        }
    };

    const loadSameCategoryProducts = async (category: string, currentProductId: string) => {
        try {
            const allProducts = await getAllInstallments();
            const filtered = allProducts
                .filter(p => p.category === category && (p.id !== currentProductId && p._id !== currentProductId))
                .slice(0, 10); // Limit to 10 products
            setSameCategoryProducts(filtered);
        } catch (error) {
            // Error loading same category products
        }
    };

    // Auto-scroll images
    useEffect(() => {
        if (product?.productImages && product.productImages.length > 1) {
            // Clear any existing timer
            if (autoScrollTimerRef.current) {
                clearInterval(autoScrollTimerRef.current);
            }

            const startAutoScroll = () => {
                if (autoScrollTimerRef.current) {
                    clearInterval(autoScrollTimerRef.current);
                }

                autoScrollTimerRef.current = setInterval(() => {
                    // Don't auto-scroll if user is manually scrolling
                    if (isUserScrollingRef.current) return;

                    setActiveImageIndex((prevIndex) => {
                        const nextIndex = (prevIndex + 1) % product.productImages!.length;
                        
                        // Scroll to next image
                        if (imageScrollRef.current) {
                            imageScrollRef.current.scrollTo({
                                x: nextIndex * width,
                                animated: true,
                            });
                        }
                        
                        return nextIndex;
                    });
                }, 3000); // Change image every 3 seconds
            };

            // Start auto-scroll after a short delay
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
    }, [product?.productImages]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <DetailPageSkeleton />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { specifications: specs } = product;

    // Helper to check if a spec object has any valid values
    const hasValidSpecs = (specObj: any): boolean => {
        if (!specObj || typeof specObj !== 'object') return false;
        return Object.values(specObj).some(value =>
            value && value !== 'N/A' && value !== '' &&
            (typeof value === 'string' || typeof value === 'number')
        );
    };

    // Helper to render spec row
    const renderSpecRow = (label: string, value: string | undefined) => {
        if (!value || value === 'N/A' || value === '') return null;
        return (
            <View style={styles.specRow} key={label}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value}</Text>
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
                    <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
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
                            // Pause auto-scroll while user is scrolling
                            if (autoScrollTimerRef.current) {
                                clearInterval(autoScrollTimerRef.current);
                            }
                        }}
                        onScrollEndDrag={() => {
                            // Resume auto-scroll after user stops scrolling (after 3 seconds)
                            setTimeout(() => {
                                isUserScrollingRef.current = false;
                                if (product?.productImages && product.productImages.length > 1) {
                                    if (autoScrollTimerRef.current) {
                                        clearInterval(autoScrollTimerRef.current);
                                    }
                                    autoScrollTimerRef.current = setInterval(() => {
                                        if (isUserScrollingRef.current) return;
                                        setActiveImageIndex((prevIndex) => {
                                            const nextIndex = (prevIndex + 1) % product.productImages!.length;
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
                        {product.productImages && product.productImages.length > 0 ? (
                            product.productImages.map((img, index) => (
                                <LazyImage
                                    key={index}
                                    source={{ uri: img }}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                            ))
                        ) : (
                            <View style={[styles.productImage, styles.placeholderImage]}>
                                <Ionicons name="image-outline" size={64} color="#ccc" />
                            </View>
                        )}
                    </ScrollView>

                    {/* Pagination Dots */}
                    {product.productImages && product.productImages.length > 1 && (
                        <View style={styles.pagination}>
                            {product.productImages.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === activeImageIndex && styles.paginationDotActive
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Title and Price */}
                <View style={styles.section}>
                    <Text style={styles.title}>{product.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.mainPriceLabel}>Monthly starts from</Text>
                        <Text style={styles.mainPrice}>PKR {product.monthlyPayment?.toLocaleString()}</Text>
                    </View>
                    {product.city ? (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.locationText}>{product.city}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Payment Plans */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Plans</Text>
                    {product.paymentPlans && product.paymentPlans.length > 0 ? (
                        product.paymentPlans.map((plan, index) => (
                            <View key={index} style={styles.planCard}>
                                <View style={styles.planHeader}>
                                    <Text style={styles.planName}>{plan.planName || `Plan ${index + 1}`}</Text>
                                    <Text style={styles.planDuration}>{plan.tenureMonths} Months</Text>
                                </View>
                                <View style={styles.planDetails}>
                                    <View style={styles.planDetailItem}>
                                        <Text style={styles.planDetailLabel}>Down Payment</Text>
                                        <Text style={styles.planDetailValue}>PKR {plan.downPayment?.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.verticalDivider} />
                                    <View style={styles.planDetailItem}>
                                        <Text style={styles.planDetailLabel}>Monthly</Text>
                                        <Text style={styles.planDetailValue}>PKR {plan.monthlyInstallment?.toLocaleString()}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No specific plans available.</Text>
                    )}
                </View>

                {/* Specifications - Category-based display */}
                {specs && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Specifications</Text>

                        {/* Mobile/Phone Specifications */}
                        {(specs.generalFeatures || specs.display || specs.memory || specs.battery || specs.camera || specs.connectivity) && (
                            <>
                                {hasValidSpecs(specs.generalFeatures) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>General Features</Text>
                                        {renderSpecRow('Model', specs.generalFeatures?.model)}
                                        {renderSpecRow('Operating System', specs.generalFeatures?.operatingSystem)}
                                        {renderSpecRow('SIM Support', specs.generalFeatures?.simSupport)}
                                        {renderSpecRow('Colors', specs.generalFeatures?.colors)}
                                        {renderSpecRow('Dimensions', specs.generalFeatures?.phoneDimensions || specs.generalFeatures?.dimensions)}
                                        {renderSpecRow('Weight', specs.generalFeatures?.phoneWeight || specs.generalFeatures?.weight)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.display) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Display</Text>
                                        {renderSpecRow('Screen Size', specs.display?.screenSize)}
                                        {renderSpecRow('Resolution', specs.display?.screenResolution)}
                                        {renderSpecRow('Technology', specs.display?.technology)}
                                        {renderSpecRow('Protection', specs.display?.protection)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.performance) && !specs.mechanicalBike && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Performance</Text>
                                        {renderSpecRow('Processor', specs.performance?.processor)}
                                        {renderSpecRow('GPU', specs.performance?.gpu)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.memory) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Memory</Text>
                                        {renderSpecRow('RAM', specs.memory?.ram)}
                                        {renderSpecRow('Internal Storage', specs.memory?.internalMemory)}
                                        {renderSpecRow('Card Slot', specs.memory?.cardSlot)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.camera) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Camera</Text>
                                        {renderSpecRow('Front Camera', specs.camera?.frontCamera)}
                                        {renderSpecRow('Back Camera', specs.camera?.backCamera)}
                                        {renderSpecRow('Features', specs.camera?.features)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.battery) && !specs.electricalBike && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Battery</Text>
                                        {renderSpecRow('Type', specs.battery?.type)}
                                        {renderSpecRow('Capacity', specs.battery?.capacity)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.connectivity) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Connectivity</Text>
                                        {renderSpecRow('Data', specs.connectivity?.data)}
                                        {renderSpecRow('Bluetooth', specs.connectivity?.bluetooth)}
                                        {renderSpecRow('NFC', specs.connectivity?.nfc)}
                                        {renderSpecRow('Infrared', specs.connectivity?.infrared)}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Electrical Bike Specifications */}
                        {hasValidSpecs(specs.electricalBike) && (
                            <View style={styles.specGroup}>
                                <Text style={styles.specGroupTitle}>E-Bike Specifications</Text>
                                {renderSpecRow('Model', specs.electricalBike?.model)}
                                {renderSpecRow('Top Speed', specs.electricalBike?.speed)}
                                {renderSpecRow('Range', specs.electricalBike?.rangeKm)}
                                {renderSpecRow('Battery', specs.electricalBike?.batterySpec)}
                                {renderSpecRow('Charging Time', specs.electricalBike?.chargingTime)}
                                {renderSpecRow('Motor', specs.electricalBike?.motor)}
                                {renderSpecRow('Brakes', specs.electricalBike?.brakes)}
                                {renderSpecRow('Weight', specs.electricalBike?.weight)}
                                {renderSpecRow('Dimensions', specs.electricalBike?.dimensions)}
                                {renderSpecRow('Warranty', specs.electricalBike?.warranty)}
                            </View>
                        )}

                        {/* Mechanical Bike Specifications */}
                        {specs.mechanicalBike && (
                            <>
                                {hasValidSpecs(specs.mechanicalBike.generalFeatures) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>General Features</Text>
                                        {renderSpecRow('Engine', specs.mechanicalBike.generalFeatures?.engine)}
                                        {renderSpecRow('Model', specs.mechanicalBike.generalFeatures?.model)}
                                        {renderSpecRow('Dimensions', specs.mechanicalBike.generalFeatures?.dimensions)}
                                        {renderSpecRow('Weight', specs.mechanicalBike.generalFeatures?.weight)}
                                    </View>
                                )}

                                {hasValidSpecs(specs.mechanicalBike.performance) && (
                                    <View style={styles.specGroup}>
                                        <Text style={styles.specGroupTitle}>Performance</Text>
                                        {renderSpecRow('Transmission', specs.mechanicalBike.performance?.transmission)}
                                        {renderSpecRow('Starting', specs.mechanicalBike.performance?.starting)}
                                        {renderSpecRow('Displacement', specs.mechanicalBike.performance?.displacement)}
                                        {renderSpecRow('Ground Clearance', specs.mechanicalBike.performance?.groundClearance)}
                                        {renderSpecRow('Petrol Capacity', specs.mechanicalBike.performance?.petrolCapacity)}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Air Conditioner Specifications */}
                        {hasValidSpecs(specs.airConditioner) && (
                            <View style={styles.specGroup}>
                                <Text style={styles.specGroupTitle}>Air Conditioner Specifications</Text>
                                {Object.entries(specs.airConditioner).map(([key, value]) => {
                                    if (value && typeof value === 'string' && value !== 'N/A' && value !== '') {
                                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return renderSpecRow(label, value);
                                    }
                                    return null;
                                })}
                            </View>
                        )}
                    </View>
                )}

                {/* Description */}
                {product.description ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                ) : null}

                {/* Same Category Products */}
                {sameCategoryProducts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Similar Products</Text>
                        <FlatList
                            data={sameCategoryProducts}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.relatedProductCard}
                                    onPress={() => {
                                        router.push(`/product-details/${item.id || item._id}` as any);
                                    }}
                                >
                                    {item.imageUrl ? (
                                        <LazyImage
                                            source={{ uri: item.imageUrl }}
                                            style={styles.relatedProductImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={[styles.relatedProductImage, styles.placeholderImage]}>
                                            <Ionicons name="image-outline" size={32} color="#ccc" />
                                        </View>
                                    )}
                                    <View style={styles.relatedProductInfo}>
                                        <Text style={styles.relatedProductTitle} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.relatedProductPrice}>
                                            PKR {item.monthlyPayment?.toLocaleString()}/month
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.relatedProductsContainer}
                        />
                    </View>
                )}

            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={() => {
                        if (product.paymentPlans && product.paymentPlans.length > 0) {
                            router.push({
                                pathname: '/apply-installment',
                                params: { 
                                    id: product.id,
                                    planIndex: '0' // Default to first plan
                                }
                            } as any);
                        } else {
                            router.push({
                                pathname: '/apply-installment',
                                params: { id: product.id }
                            } as any);
                        }
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
    productImage: {
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
        width: 20, // elongate active dot
    },
    section: {
        padding: 20,
        borderBottomWidth: 8,
        borderBottomColor: '#F5F5F5',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
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
    planCard: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    planName: {
        fontWeight: '600',
        fontSize: 16,
    },
    planDuration: {
        color: colors.accent,
        fontWeight: '600',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 12,
        overflow: 'hidden',
    },
    planDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    planDetailItem: {
        alignItems: 'center',
    },
    planDetailLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    planDetailValue: {
        fontWeight: '700',
        fontSize: 15,
    },
    verticalDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },
    specGroup: {
        marginBottom: 16,
    },
    specGroupTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
        backgroundColor: '#F5F5F5',
        padding: 6,
        borderRadius: 4,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    specLabel: {
        color: '#666',
        flex: 1,
    },
    specValue: {
        fontWeight: '500',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    descriptionText: {
        lineHeight: 22,
        color: '#444',
    },
    sellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        padding: 12,
        borderRadius: 12,
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sellerInitials: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    sellerName: {
        fontWeight: '600',
        fontSize: 16,
    },
    sellerPhone: {
        color: '#666',
        marginTop: 2,
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
    relatedProductsContainer: {
        paddingRight: 20,
    },
    relatedProductCard: {
        width: 160,
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    relatedProductImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#F9F9F9',
    },
    relatedProductInfo: {
        padding: 12,
    },
    relatedProductTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
        minHeight: 36,
    },
    relatedProductPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.accent,
    },
});
