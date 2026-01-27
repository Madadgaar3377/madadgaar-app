import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { DetailPageSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getInstallmentById, getAllInstallments, Installment } from '@/services/installment.api';
import { colors, spacing } from '@/theme';
import { InstallmentReviews } from '@/components/reviews/InstallmentReviews';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [product, setProduct] = useState<Installment | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [sameCategoryProducts, setSameCategoryProducts] = useState<Installment[]>([]);
    const [expandedPlanIndex, setExpandedPlanIndex] = useState<number | null>(null);
    const [expandedSpecGroup, setExpandedSpecGroup] = useState<string | null>(null);
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

    // Helper to find best plan index (lowest monthly installment)
    const findBestPlanIndex = (paymentPlans: any[]): number => {
        if (!paymentPlans || paymentPlans.length === 0) return 0;
        return paymentPlans.reduce((bestIdx, current, currentIdx) => {
            const currentMonthly = Number(current.monthlyInstallment || 0);
            const bestMonthly = Number(paymentPlans[bestIdx].monthlyInstallment || 0);
            return currentMonthly > 0 && (bestMonthly === 0 || currentMonthly < bestMonthly) ? currentIdx : bestIdx;
        }, 0);
    };

    const loadProduct = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getInstallmentById(id as string);
            setProduct(data);
            
            // Set best plan as expanded by default
            if (data?.paymentPlans && data.paymentPlans.length > 0) {
                const bestIndex = findBestPlanIndex(data.paymentPlans);
                setExpandedPlanIndex(bestIndex);
            }
            
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
                        <View style={styles.priceRowTop}>
                            <Text style={styles.mainPriceLabel}>Monthly starts from</Text>
                            <Text style={styles.mainPrice}>PKR {product.monthlyPayment?.toLocaleString()}</Text>
                        </View>
                        <View style={styles.cashPriceRow}>
                            <Text style={styles.cashPriceLabel}>Cash Price:</Text>
                            <Text style={styles.cashPriceValue}>
                                PKR {(product.totalAmount || (product as any).originalItem?.price || (product as any).price || 0).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    {product.city ? (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.locationText}>{product.city}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.basicInfoGrid}>
                        <View style={styles.basicInfoCard}>
                            <Text style={styles.basicInfoLabel}>Product Name</Text>
                            <Text style={styles.basicInfoValue}>{product.title || 'N/A'}</Text>
                        </View>
                        <View style={styles.basicInfoCard}>
                            <Text style={styles.basicInfoLabel}>Company</Text>
                            <Text style={styles.basicInfoValue}>
                                {(product as any).originalItem?.companyName || 
                                 (product as any).originalItem?.companyNameOther ||
                                 (product as any).companyName ||
                                 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.basicInfoCard}>
                            <Text style={styles.basicInfoLabel}>Category</Text>
                            <Text style={styles.basicInfoValue}>
                                {product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1).replace(/_/g, ' ') : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.basicInfoCard}>
                            <Text style={styles.basicInfoLabel}>City</Text>
                            <Text style={styles.basicInfoValue}>{product.city || 'N/A'}</Text>
                        </View>
                        <View style={[styles.basicInfoCard, styles.basicInfoCardHighlight]}>
                            <Text style={styles.basicInfoLabel}>Base Price</Text>
                            <Text style={styles.basicInfoValueHighlight}>
                                PKR {(product.totalAmount || (product as any).originalItem?.price || (product as any).price || 0).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Plans - Dropdown Style - 2 Column Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Plans ({product.paymentPlans?.length || 0})</Text>
                    {product.paymentPlans && product.paymentPlans.length > 0 ? (
                        <View style={styles.plansGridContainer}>
                            {product.paymentPlans.map((plan: any, index: number) => {
                            const basePrice = product.totalAmount || (product as any).originalItem?.price || (product as any).price || 0;
                            const financedAmount = Math.max(0, basePrice - (plan.downPayment || 0));
                            const totalPayable = Number(plan.installmentPrice || plan.monthlyInstallment * (plan.tenureMonths || 1) || 0);
                            const totalMarkup = Number(plan.markup || 0);
                            const totalCost = basePrice + totalMarkup;
                            const bestPlanIndex = findBestPlanIndex(product.paymentPlans || []);
                            const isBestPlan = index === bestPlanIndex;
                            const isOpen = expandedPlanIndex === index;

                            return (
                                <View 
                                    key={index} 
                                    style={[
                                        styles.planCardDropdown,
                                        isBestPlan && styles.planCardBest,
                                        isOpen && styles.planCardOpen
                                    ]}
                                >
                                    {/* Plan Header - Clickable */}
                                    <TouchableOpacity
                                        style={styles.planHeaderDropdown}
                                        onPress={() => setExpandedPlanIndex(isOpen ? null : index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.planHeaderContent}>
                                            <View style={styles.planHeaderLeft}>
                                                <View style={styles.planNameRow}>
                                                    <Text style={styles.planNameDropdown}>
                                                        {plan.planName || `Plan ${index + 1}`}
                                                    </Text>
                                                    {isBestPlan && (
                                                        <View style={styles.bestPlanBadge}>
                                                            <Text style={styles.bestPlanText}>⭐ BEST</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.planSummaryRow}>
                                                    <Text style={styles.planMonthlyPrice}>
                                                        PKR {(plan.monthlyInstallment || 0).toLocaleString()}
                                                    </Text>
                                                    <Text style={styles.planMonthlyLabel}>/month</Text>
                                                    <Text style={styles.planTenureBadge}>
                                                        {plan.tenureMonths || plan.tenure || 0} Months
                                                    </Text>
                                                </View>
                                                <View style={styles.planCashPriceRow}>
                                                    <Text style={styles.planCashPriceLabel}>Cash Price:</Text>
                                                    <Text style={styles.planCashPriceValue}>
                                                        PKR {basePrice.toLocaleString()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Ionicons
                                                name={isOpen ? "chevron-up" : "chevron-down"}
                                                size={24}
                                                color="#666"
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Plan Details - Expandable */}
                                    {isOpen && (
                                        <View style={styles.planDetailsExpanded}>
                                            {/* Financial Grid */}
                                            <View style={styles.financialGrid}>
                                                <View style={styles.financialGridItem}>
                                                    <Text style={styles.financialGridLabel}>Down Payment</Text>
                                                    <Text style={styles.financialGridValue}>
                                                        PKR {(plan.downPayment || 0).toLocaleString()}
                                                    </Text>
                                                </View>
                                                <View style={styles.financialGridItem}>
                                                    <Text style={styles.financialGridLabel}>Financed Amount</Text>
                                                    <Text style={styles.financialGridValue}>
                                                        PKR {financedAmount.toLocaleString()}
                                                    </Text>
                                                </View>
                                                <View style={styles.financialGridItem}>
                                                    <Text style={styles.financialGridLabel}>Interest Rate</Text>
                                                    <Text style={styles.financialGridValue}>
                                                        {plan.interestRatePercent || plan.interestRate || 0}%
                                                    </Text>
                                                </View>
                                                <View style={styles.financialGridItem}>
                                                    <Text style={styles.financialGridLabel}>Interest Type</Text>
                                                    <Text style={styles.financialGridValue} numberOfLines={1}>
                                                        {plan.interestType || "—"}
                                                    </Text>
                                                </View>
                                                <View style={styles.financialGridItem}>
                                                    <Text style={styles.financialGridLabel}>Total Payable</Text>
                                                    <Text style={styles.financialGridValue}>
                                                        PKR {totalPayable.toLocaleString()}
                                                    </Text>
                                                </View>
                                                <View style={styles.financialGridItem}>
                                                    <Text style={styles.financialGridLabel}>Total Markup</Text>
                                                    <Text style={styles.financialGridValue}>
                                                        PKR {totalMarkup.toLocaleString()}
                                                    </Text>
                                                </View>
                                                <View style={[styles.financialGridItem, styles.financialGridItemHighlight]}>
                                                    <Text style={styles.financialGridLabel}>Total Cost</Text>
                                                    <Text style={styles.financialGridValueHighlight}>
                                                        PKR {totalCost.toLocaleString()}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Finance Information */}
                                            {plan.finance && (plan.finance.bankName || plan.finance.financeInfo) && (
                                                <View style={styles.financeCard}>
                                                    <View style={styles.financeHeader}>
                                                        <Ionicons name="business-outline" size={18} color={colors.accent} />
                                                        <Text style={styles.financeTitle}>Finance Information</Text>
                                                    </View>
                                                    {plan.finance.bankName && (
                                                        <View style={styles.financeItem}>
                                                            <Text style={styles.financeLabel}>Bank:</Text>
                                                            <Text style={styles.financeValue}>{plan.finance.bankName}</Text>
                                                        </View>
                                                    )}
                                                    {plan.finance.financeInfo && (
                                                        <View style={styles.financeItem}>
                                                            <Text style={styles.financeLabel}>Details:</Text>
                                                            <Text style={styles.financeDetails}>{plan.finance.financeInfo}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {/* Other Charges */}
                                            {plan.otherChargesNote && (
                                                <View style={styles.otherChargesCard}>
                                                    <Text style={styles.otherChargesLabel}>Other Charges</Text>
                                                    <Text style={styles.otherChargesValue}>{plan.otherChargesNote}</Text>
                                                </View>
                                            )}

                                            {/* Apply Button */}
                                            <TouchableOpacity
                                                style={styles.applyPlanButton}
                                                onPress={() => {
                                                    router.push({
                                                        pathname: '/apply-installment',
                                                        params: {
                                                            id: product.id,
                                                            planIndex: String(index)
                                                        }
                                                    } as any);
                                                }}
                                            >
                                                <Text style={styles.applyPlanButtonText}>Apply for This Plan</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No specific plans available.</Text>
                    )}
                </View>

                {/* Specifications - Category-based display with Dropdowns */}
                {specs && (
                    <View style={styles.section}>
                        <View style={styles.specsHeader}>
                            <Text style={styles.sectionTitle}>Product Specifications</Text>
                            {(product as any).originalItem?.productSpecifications?.category && (
                                <Text style={styles.specsCategory}>
                                    ({(product as any).originalItem.productSpecifications.category})
                                </Text>
                            )}
                        </View>
                        {(product as any).originalItem?.productSpecifications?.subCategory && (
                            <Text style={styles.specsSubCategory}>
                                {(product as any).originalItem.productSpecifications.subCategory}
                            </Text>
                        )}
                        
                        {/* Check if productSpecifications exists (from backend) */}
                        {(product as any).originalItem?.productSpecifications?.specifications && 
                         Array.isArray((product as any).originalItem.productSpecifications.specifications) &&
                         (product as any).originalItem.productSpecifications.specifications.length > 0 ? (
                            <View style={styles.specsGridContainer}>
                                <View style={styles.specsGrid}>
                                    {(product as any).originalItem.productSpecifications.specifications
                                        .filter((spec: any) => spec.value && spec.value !== 'N/A' && spec.value !== '')
                                        .map((spec: any, idx: number) => (
                                        <View key={idx} style={styles.specCard}>
                                            <Text style={styles.specCardLabel}>{spec.field || "—"}</Text>
                                            <Text style={styles.specCardValue}>{spec.value || "—"}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Mobile/Phone Specifications */}
                                {(specs.generalFeatures || specs.display || specs.memory || specs.battery || specs.camera || specs.connectivity) && (
                                    <>
                                        {hasValidSpecs(specs.generalFeatures) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'generalFeatures' ? null : 'generalFeatures')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>General Features</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'generalFeatures' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'generalFeatures' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Model', specs.generalFeatures?.model)}
                                                        {renderSpecRow('Operating System', specs.generalFeatures?.operatingSystem)}
                                                        {renderSpecRow('SIM Support', specs.generalFeatures?.simSupport)}
                                                        {renderSpecRow('Colors', specs.generalFeatures?.colors)}
                                                        {renderSpecRow('Dimensions', specs.generalFeatures?.phoneDimensions || specs.generalFeatures?.dimensions)}
                                                        {renderSpecRow('Weight', specs.generalFeatures?.phoneWeight || specs.generalFeatures?.weight)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.display) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'display' ? null : 'display')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Display</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'display' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'display' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Screen Size', specs.display?.screenSize)}
                                                        {renderSpecRow('Resolution', specs.display?.screenResolution)}
                                                        {renderSpecRow('Technology', specs.display?.technology)}
                                                        {renderSpecRow('Protection', specs.display?.protection)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.performance) && !specs.mechanicalBike && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'performance' ? null : 'performance')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Performance</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'performance' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'performance' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Processor', specs.performance?.processor)}
                                                        {renderSpecRow('GPU', specs.performance?.gpu)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.memory) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'memory' ? null : 'memory')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Memory</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'memory' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'memory' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('RAM', specs.memory?.ram)}
                                                        {renderSpecRow('Internal Storage', specs.memory?.internalMemory)}
                                                        {renderSpecRow('Card Slot', specs.memory?.cardSlot)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.camera) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'camera' ? null : 'camera')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Camera</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'camera' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'camera' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Front Camera', specs.camera?.frontCamera)}
                                                        {renderSpecRow('Back Camera', specs.camera?.backCamera)}
                                                        {renderSpecRow('Features', specs.camera?.features)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.battery) && !specs.electricalBike && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'battery' ? null : 'battery')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Battery</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'battery' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'battery' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Type', specs.battery?.type)}
                                                        {renderSpecRow('Capacity', specs.battery?.capacity)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.connectivity) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'connectivity' ? null : 'connectivity')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Connectivity</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'connectivity' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'connectivity' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Data', specs.connectivity?.data)}
                                                        {renderSpecRow('Bluetooth', specs.connectivity?.bluetooth)}
                                                        {renderSpecRow('NFC', specs.connectivity?.nfc)}
                                                        {renderSpecRow('Infrared', specs.connectivity?.infrared)}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </>
                                )}

                                {/* Electrical Bike Specifications */}
                                {hasValidSpecs(specs.electricalBike) && (
                                    <View style={styles.specGroupDropdown}>
                                        <TouchableOpacity
                                            style={styles.specGroupHeader}
                                            onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'electricalBike' ? null : 'electricalBike')}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.specGroupTitle}>E-Bike Specifications</Text>
                                            <Ionicons
                                                name={expandedSpecGroup === 'electricalBike' ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                        {expandedSpecGroup === 'electricalBike' && (
                                            <View style={styles.specGroupContent}>
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
                                    </View>
                                )}

                                {/* Mechanical Bike Specifications */}
                                {specs.mechanicalBike && (
                                    <>
                                        {hasValidSpecs(specs.mechanicalBike.generalFeatures) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'mechanicalBike-general' ? null : 'mechanicalBike-general')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>General Features</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'mechanicalBike-general' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'mechanicalBike-general' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Engine', specs.mechanicalBike.generalFeatures?.engine)}
                                                        {renderSpecRow('Model', specs.mechanicalBike.generalFeatures?.model)}
                                                        {renderSpecRow('Dimensions', specs.mechanicalBike.generalFeatures?.dimensions)}
                                                        {renderSpecRow('Weight', specs.mechanicalBike.generalFeatures?.weight)}
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {hasValidSpecs(specs.mechanicalBike.performance) && (
                                            <View style={styles.specGroupDropdown}>
                                                <TouchableOpacity
                                                    style={styles.specGroupHeader}
                                                    onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'mechanicalBike-performance' ? null : 'mechanicalBike-performance')}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.specGroupTitle}>Performance</Text>
                                                    <Ionicons
                                                        name={expandedSpecGroup === 'mechanicalBike-performance' ? "chevron-up" : "chevron-down"}
                                                        size={20}
                                                        color="#666"
                                                    />
                                                </TouchableOpacity>
                                                {expandedSpecGroup === 'mechanicalBike-performance' && (
                                                    <View style={styles.specGroupContent}>
                                                        {renderSpecRow('Transmission', specs.mechanicalBike.performance?.transmission)}
                                                        {renderSpecRow('Starting', specs.mechanicalBike.performance?.starting)}
                                                        {renderSpecRow('Displacement', specs.mechanicalBike.performance?.displacement)}
                                                        {renderSpecRow('Ground Clearance', specs.mechanicalBike.performance?.groundClearance)}
                                                        {renderSpecRow('Petrol Capacity', specs.mechanicalBike.performance?.petrolCapacity)}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </>
                                )}

                                {/* Air Conditioner Specifications */}
                                {hasValidSpecs(specs.airConditioner) && (
                                    <View style={styles.specGroupDropdown}>
                                        <TouchableOpacity
                                            style={styles.specGroupHeader}
                                            onPress={() => setExpandedSpecGroup(expandedSpecGroup === 'airConditioner' ? null : 'airConditioner')}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.specGroupTitle}>Air Conditioner Specifications</Text>
                                            <Ionicons
                                                name={expandedSpecGroup === 'airConditioner' ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                        {expandedSpecGroup === 'airConditioner' && (
                                            <View style={styles.specGroupContent}>
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
                            </>
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

                {/* Creator Information */}
                {product.createdBy && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Posted By</Text>
                        <View style={styles.creatorCard}>
                            {product.createdBy.name && (
                                <Text style={styles.creatorName}>{product.createdBy.name}</Text>
                            )}
                            {product.createdBy.email && (
                                <View style={styles.creatorInfoRow}>
                                    <Ionicons name="mail-outline" size={14} color="#666" />
                                    <Text style={styles.creatorInfo}>{product.createdBy.email}</Text>
                                </View>
                            )}
                            {product.createdBy.phone && (
                                <View style={styles.creatorInfoRow}>
                                    <Ionicons name="call-outline" size={14} color="#666" />
                                    <Text style={styles.creatorInfo}>{product.createdBy.phone}</Text>
                                </View>
                            )}
                            {product.createdBy.userType && (
                                <View style={styles.creatorBadge}>
                                    <Text style={styles.creatorBadgeText}>
                                        {product.createdBy.userType.charAt(0).toUpperCase() + product.createdBy.userType.slice(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Reviews Section */}
                <View style={styles.section}>
                    <InstallmentReviews
                        installmentPlanId={product.installmentPlanId}
                        planId={product._id}
                    />
                </View>

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
        marginBottom: 8,
    },
    priceRowTop: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
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
    cashPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cashPriceLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    cashPriceValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
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
    // Dropdown Plan Card Styles
    planCardDropdown: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    planCardBest: {
        borderColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    planCardOpen: {
        borderColor: colors.accent,
    },
    planHeaderDropdown: {
        padding: 16,
    },
    planHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    planHeaderLeft: {
        flex: 1,
        marginRight: 12,
    },
    planNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
        gap: 8,
    },
    planNameDropdown: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    bestPlanBadge: {
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    bestPlanText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    planSummaryRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    planMonthlyPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.accent,
        marginRight: 4,
    },
    planMonthlyLabel: {
        fontSize: 12,
        color: '#666',
        marginRight: 12,
    },
    planTenureBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    planCashPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    planCashPriceLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    planCashPriceValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '700',
    },
    planDetailsExpanded: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    financialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        marginBottom: 12,
    },
    financialGridItem: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    financialGridItemHighlight: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
        borderWidth: 2,
        width: '100%',
    },
    financialGridLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    financialGridValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    financialGridValueHighlight: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.accent,
    },
    applyPlanButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    applyPlanButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
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
    specGroupDropdown: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    specGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#F5F5F5',
    },
    specGroupTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    specGroupContent: {
        padding: 14,
        paddingTop: 8,
    },
    // Specs Grid (for productSpecifications)
    specsGridContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    specsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    specCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    specCardLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    specCardValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
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
    // Basic Information Styles
    basicInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    basicInfoCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    basicInfoCardHighlight: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    basicInfoLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    basicInfoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    basicInfoValueHighlight: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.accent,
    },
    // Enhanced Plan Styles
    planDurationBadge: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    financialSummary: {
        marginTop: 12,
        gap: 8,
    },
    financialItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    financialItemHighlight: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
        borderWidth: 2,
    },
    financialItemSuccess: {
        backgroundColor: '#E8F5E9',
        borderColor: '#C8E6C9',
        borderWidth: 2,
    },
    financialLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    financialValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    financialValueHighlight: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.accent,
    },
    financialValueSuccess: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2E7D32',
    },
    planDetailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    planDetailCard: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    planDetailSubtext: {
        fontSize: 12,
        fontWeight: '400',
        color: '#666',
    },
    // Finance Information Styles
    financeCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    financeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    financeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    financeItem: {
        marginTop: 8,
    },
    financeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    financeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    financeDetails: {
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
        marginTop: 4,
    },
    // Other Charges Styles
    otherChargesCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    otherChargesLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    otherChargesValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
    },
    // Creator Information Styles
    creatorCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
    },
    creatorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    creatorInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    creatorInfo: {
        fontSize: 13,
        color: '#666',
    },
    creatorBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    creatorBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1976D2',
    },
    specsHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    specsCategory: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.accent,
        marginLeft: 8,
    },
    specsSubCategory: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        marginLeft: 4,
    },
});
