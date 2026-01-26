import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, TextInput, Modal } from 'react-native';
import { ProductCardSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getAllInstallments, Installment } from '@/services/installment.api';
import { colors, spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const RED_DARK = '#B71C1C';
const WHITE = '#FFFFFF';
const GRAY_DARK = '#424242';

const ALL_CATEGORY = 'All';

export default function InstallmentsScreen() {
  const router = useRouter();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null); // null means any
  const [categories, setCategories] = useState<string[]>([ALL_CATEGORY]);
  const [showFilters, setShowFilters] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInstallments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, installments]);

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      const data = await getAllInstallments();
      setInstallments(data);

      // Extract unique categories
      const uniqueCats = Array.from(new Set(data.map(i => i.category || 'Other').filter(Boolean)));
      setCategories([ALL_CATEGORY, ...uniqueCats.sort()]);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      setInstallments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInstallments();
  };

  const applyFilters = () => {
    let result = installments;

    // Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(i =>
        (i.title?.toLowerCase().includes(lower)) ||
        (i.description?.toLowerCase().includes(lower))
      );
    }

    // Category
    if (selectedCategory !== ALL_CATEGORY) {
      result = result.filter(i => (i.category || 'Other') === selectedCategory);
    }

    // Price Range
    if (priceRange) {
      result = result.filter(i => {
        const price = i.monthlyPayment || i.totalAmount || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    setFilteredInstallments(result);
  };

  const handleInstallmentPress = (installment: Installment) => {
    if (installment.id) {
      router.push(`/product-details/${installment.id}` as any);
    }
  };

  // Renderers
  const renderCategoryTab = (cat: string) => (
    <TouchableOpacity
      key={cat}
      style={[
        styles.categoryTab,
        selectedCategory === cat && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(cat)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === cat && styles.categoryTabTextActive
      ]}>
        {cat}
      </Text>
    </TouchableOpacity>
  );

  const renderPriceFilter = (label: string, min: number, max: number) => {
    const isActive = priceRange && priceRange[0] === min && priceRange[1] === max;
    return (
      <TouchableOpacity
        key={label}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setPriceRange(isActive ? null : [min, max])}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Installments</Text>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={24} color={RED_PRIMARY} />
            {(selectedCategory !== ALL_CATEGORY || priceRange) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {loading && installments.length === 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ProductCardSkeleton count={6} />
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RED_PRIMARY} />
            }
          >
            {filteredInstallments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={GRAY_DARK} />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
              </View>
            ) : (
              <Animated.View style={{ opacity: fadeAnim }}>
                {filteredInstallments.map((installment) => (
                  <TouchableOpacity
                    key={installment.id || Math.random()}
                    style={styles.card}
                    onPress={() => handleInstallmentPress(installment)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardInner}>
                      <View style={styles.imageWrapper}>
                        {installment.imageUrl ? (
                          <LazyImage
                            source={{ uri: installment.imageUrl }}
                            style={styles.cardImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={32} color="#ccc" />
                          </View>
                        )}
                        {installment.category !== 'Other' && installment.category ? (
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{installment.category}</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.cardInfo}>
                        <View>
                          <Text style={styles.cardTitle} numberOfLines={2}>{installment.title}</Text>
                          <Text style={styles.cardDesc} numberOfLines={1}>{installment.description || 'No description'}</Text>
                        </View>


                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>Monthly</Text>
                          <Text style={styles.priceValue}>PKR {(installment.monthlyPayment || 0).toLocaleString()}</Text>
                        </View>

                        <View style={styles.footerRow}>
                          {installment.duration ? (
                            <View style={styles.durationBadge}>
                              <Ionicons name="time-outline" size={12} color={RED_PRIMARY} />
                              <Text style={styles.durationText}>{installment.duration} Months</Text>
                            </View>
                          ) : <View />}
                          <TouchableOpacity style={styles.viewBtn} onPress={() => handleInstallmentPress(installment)}>
                            <Text style={styles.viewBtnText}>View</Text>
                            <Ionicons name="arrow-forward" size={12} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </ScrollView>
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Products</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Category Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Category</Text>
                  <View style={styles.filterOptions}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[styles.filterOption, selectedCategory === category && styles.filterOptionActive]}
                        onPress={() => setSelectedCategory(selectedCategory === category ? ALL_CATEGORY : category)}
                      >
                        <Text style={[styles.filterOptionText, selectedCategory === category && styles.filterOptionTextActive]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Range Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Monthly Payment Range</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 0 && priceRange[1] === 5000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 0 && priceRange[1] === 5000 ? null : [0, 5000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 0 && priceRange[1] === 5000 && styles.filterOptionTextActive]}>
                        Under 5K
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 5000 && priceRange[1] === 10000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 5000 && priceRange[1] === 10000 ? null : [5000, 10000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 5000 && priceRange[1] === 10000 && styles.filterOptionTextActive]}>
                        5K - 10K
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 10000 && priceRange[1] === 20000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 10000 && priceRange[1] === 20000 ? null : [10000, 20000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 10000 && priceRange[1] === 20000 && styles.filterOptionTextActive]}>
                        10K - 20K
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 20000 && priceRange[1] === 50000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 20000 && priceRange[1] === 50000 ? null : [20000, 50000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 20000 && priceRange[1] === 50000 && styles.filterOptionTextActive]}>
                        20K - 50K
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 50000 && priceRange[1] === 1000000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 50000 && priceRange[1] === 1000000 ? null : [50000, 1000000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 50000 && priceRange[1] === 1000000 && styles.filterOptionTextActive]}>
                        50K+
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => {
                  setSelectedCategory(ALL_CATEGORY);
                  setPriceRange(null);
                }}>
                  <Text style={styles.modalButtonSecondaryText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonPrimary} onPress={() => setShowFilters(false)}>
                  <Text style={styles.modalButtonPrimaryText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: '#FFEBEE',
    borderColor: RED_PRIMARY,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTabTextActive: {
    color: RED_PRIMARY,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 80 },


  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#555', marginTop: 16 },
  emptySubtext: { color: '#999', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    height: 150,
  },
  imageWrapper: {
    width: 120,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '90%',
    height: '90%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#888',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: RED_PRIMARY,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: RED_PRIMARY,
    fontWeight: '600',
  },
  viewBtn: {
    backgroundColor: RED_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED_PRIMARY,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalScroll: {
    maxHeight: 400,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterOptionActive: {
    backgroundColor: '#FFEBEE',
    borderColor: RED_PRIMARY,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: RED_PRIMARY,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: RED_PRIMARY,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
