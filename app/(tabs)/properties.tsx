import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, TextInput, Modal } from 'react-native';
import { PropertyGridSkeleton } from '@/components/common/SkeletonLoader';
import { LazyImage } from '@/components/common/LazyImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { 
  getAllProperties, 
  Property,
  getPropertyTitle,
  getPropertyLocation,
  getPropertyPrice,
  getPropertyMonthlyRent,
  getPropertyAreaSize,
  getPropertyBedrooms,
  getPropertyBathrooms,
  getPropertyImages,
  getPropertyTransaction,
} from '@/services/property.api';
import { colors, spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const RED_DARK = '#B71C1C';
const WHITE = '#FFFFFF';
const GRAY_DARK = '#424242';

const ALL_TYPE = 'All';
const ALL_PURPOSE = 'All';

export default function PropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(ALL_TYPE);
  const [selectedPurpose, setSelectedPurpose] = useState(ALL_PURPOSE);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [areaSizeFilter, setAreaSizeFilter] = useState<string>('');
  const [bedroomsFilter, setBedroomsFilter] = useState<string>('');
  const [furnishedFilter, setFurnishedFilter] = useState<string>('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([ALL_TYPE]);
  const [purposes, setPurposes] = useState<string[]>([ALL_PURPOSE]);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedType, selectedPurpose, priceRange, areaSizeFilter, bedroomsFilter, furnishedFilter, properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getAllProperties();
      setProperties(data);

      // Extract unique property types
      const uniqueTypes = Array.from(new Set(data.map(p => p.typeOfProperty || 'Other').filter(Boolean)));
      setPropertyTypes([ALL_TYPE, ...uniqueTypes.sort()]);

      // Extract unique purposes
      const uniquePurposes = Array.from(new Set(data.map(p => p.purpose || 'Other').filter(Boolean)));
      setPurposes([ALL_PURPOSE, ...uniquePurposes.sort()]);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const applyFilters = () => {
    let result = properties;

    // Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.adTitle?.toLowerCase().includes(lower)) ||
        (p.adDescription?.toLowerCase().includes(lower)) ||
        (p.address?.toLowerCase().includes(lower)) ||
        (p.typeOfProperty?.toLowerCase().includes(lower))
      );
    }

    // Property Type
    if (selectedType !== ALL_TYPE) {
      result = result.filter(p => (p.typeOfProperty || 'Other') === selectedType);
    }

    // Purpose
    if (selectedPurpose !== ALL_PURPOSE) {
      result = result.filter(p => (p.purpose || 'Other') === selectedPurpose);
    }

    // Price Range
    if (priceRange) {
      result = result.filter(p => {
        const price = p.price || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Area Size Filter
    if (areaSizeFilter) {
      result = result.filter(p => {
        const area = p.areaSize?.toLowerCase() || '';
        return area.includes(areaSizeFilter.toLowerCase());
      });
    }

    // Bedrooms Filter
    if (bedroomsFilter) {
      result = result.filter(p => p.bedRooms === bedroomsFilter);
    }

    // Furnished Filter
    if (furnishedFilter) {
      result = result.filter(p => {
        const furnished = p.furnished?.toLowerCase() || '';
        return furnished === furnishedFilter.toLowerCase();
      });
    }

    setFilteredProperties(result);
  };

  const handlePropertyPress = (property: Property) => {
    if (property._id || property.id) {
      router.push(`/property-details/${property._id || property.id}` as any);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType(ALL_TYPE);
    setSelectedPurpose(ALL_PURPOSE);
    setPriceRange(null);
    setAreaSizeFilter('');
    setBedroomsFilter('');
    setFurnishedFilter('');
  };

  const hasActiveFilters = selectedType !== ALL_TYPE || selectedPurpose !== ALL_PURPOSE || priceRange !== null || areaSizeFilter !== '' || bedroomsFilter !== '' || furnishedFilter !== '';


  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Properties</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={24} color={hasActiveFilters ? RED_PRIMARY : "#1A1A1A"} />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
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

        {/* Results Count */}
        {!loading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        {loading && properties.length === 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <PropertyGridSkeleton count={6} />
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
            {filteredProperties.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={GRAY_DARK} />
                <Text style={styles.emptyText}>No properties found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                {hasActiveFilters && (
                  <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                    <Text style={styles.clearButtonText}>Clear All Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
                {filteredProperties.map((property) => (
                  <TouchableOpacity
                    key={property._id || property.id || Math.random()}
                    style={styles.card}
                    onPress={() => handlePropertyPress(property)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardInner}>
                      {/* Image Section */}
                      <View style={styles.imageWrapper}>
                        {property.imageUrl || (property.images && property.images.length > 0) ? (
                          <LazyImage
                            source={{ uri: property.imageUrl || property.images?.[0] }}
                            style={styles.cardImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Ionicons name="home-outline" size={32} color="#ccc" />
                          </View>
                        )}
                        {property.purpose && (
                          <View style={styles.purposeBadge}>
                            <Text style={styles.purposeBadgeText}>{property.purpose}</Text>
                          </View>
                        )}
                        {property.images && property.images.length > 1 && (
                          <View style={styles.imageCountBadge}>
                            <Ionicons name="images" size={12} color="#fff" />
                            <Text style={styles.imageCountText}>{property.images.length}</Text>
                          </View>
                        )}
                      </View>

                      {/* Content Section */}
                      <View style={styles.cardInfo}>
                        <View>
                          <Text style={styles.cardTitle} numberOfLines={2}>
                            {getPropertyTitle(property)}
                          </Text>
                          {getPropertyLocation(property) && (
                            <View style={styles.locationRow}>
                              <Ionicons name="location-outline" size={12} color="#999" />
                              <Text style={styles.cardLocation} numberOfLines={1}>
                                {getPropertyLocation(property)}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Price */}
                        <View style={styles.priceContainer}>
                          <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>
                              {(() => {
                                const transaction = getPropertyTransaction(property);
                                if (transaction?.type === 'Rent') return 'Rent';
                                return 'Price';
                              })()}
                            </Text>
                            <Text style={styles.priceValue}>
                              PKR {(() => {
                                const transaction = getPropertyTransaction(property);
                                if (transaction?.type === 'Rent') {
                                  return getPropertyMonthlyRent(property)?.toLocaleString() || 'N/A';
                                }
                                return getPropertyPrice(property)?.toLocaleString() || 'N/A';
                              })()}
                            </Text>
                          </View>
                          {(() => {
                            const transaction = getPropertyTransaction(property);
                            if (transaction?.type === 'Installment' && getPropertyMonthlyRent(property)) {
                              return (
                                <View style={styles.cashPriceRow}>
                                  <Text style={styles.cashPriceLabel}>Monthly:</Text>
                                  <Text style={styles.cashPriceValue}>
                                    PKR {getPropertyMonthlyRent(property)?.toLocaleString()}/mo
                                  </Text>
                                </View>
                              );
                            }
                            return null;
                          })()}
                        </View>

                        {/* Property Details */}
                        <View style={styles.detailsRow}>
                          {getPropertyAreaSize(property) && (
                            <View style={styles.detailBadge}>
                              <Ionicons name="resize" size={12} color={RED_PRIMARY} />
                              <Text style={styles.detailText}>{getPropertyAreaSize(property)}</Text>
                            </View>
                          )}
                          {getPropertyBedrooms(property) && (
                            <View style={styles.detailBadge}>
                              <Ionicons name="bed" size={12} color={RED_PRIMARY} />
                              <Text style={styles.detailText}>{getPropertyBedrooms(property)}</Text>
                            </View>
                          )}
                        </View>

                        {/* View Button */}
                        <TouchableOpacity 
                          style={styles.viewBtn} 
                          onPress={() => handlePropertyPress(property)}
                        >
                          <Text style={styles.viewBtnText}>View</Text>
                          <Ionicons name="arrow-forward" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </ScrollView>
        )}

        {/* Advanced Filters Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Advanced Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Purpose Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Purpose</Text>
                  <View style={styles.filterOptions}>
                    {purposes.map((purpose) => (
                      <TouchableOpacity
                        key={purpose}
                        style={[styles.filterOption, selectedPurpose === purpose && styles.filterOptionActive]}
                        onPress={() => setSelectedPurpose(selectedPurpose === purpose ? ALL_PURPOSE : purpose)}
                      >
                        <Text style={[styles.filterOptionText, selectedPurpose === purpose && styles.filterOptionTextActive]}>
                          {purpose}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Property Type Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Property Type</Text>
                  <View style={styles.filterOptions}>
                    {propertyTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.filterOption, selectedType === type && styles.filterOptionActive]}
                        onPress={() => setSelectedType(selectedType === type ? ALL_TYPE : type)}
                      >
                        <Text style={[styles.filterOptionText, selectedType === type && styles.filterOptionTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Range Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Price Range</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 0 && priceRange[1] === 5000000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 0 && priceRange[1] === 5000000 ? null : [0, 5000000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 0 && priceRange[1] === 5000000 && styles.filterOptionTextActive]}>
                        Under 50L
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 5000000 && priceRange[1] === 10000000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 5000000 && priceRange[1] === 10000000 ? null : [5000000, 10000000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 5000000 && priceRange[1] === 10000000 && styles.filterOptionTextActive]}>
                        50L - 1Cr
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 10000000 && priceRange[1] === 20000000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 10000000 && priceRange[1] === 20000000 ? null : [10000000, 20000000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 10000000 && priceRange[1] === 20000000 && styles.filterOptionTextActive]}>
                        1Cr - 2Cr
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterOption, priceRange && priceRange[0] === 20000000 && priceRange[1] === 1000000000 && styles.filterOptionActive]}
                      onPress={() => setPriceRange(priceRange && priceRange[0] === 20000000 && priceRange[1] === 1000000000 ? null : [20000000, 1000000000])}
                    >
                      <Text style={[styles.filterOptionText, priceRange && priceRange[0] === 20000000 && priceRange[1] === 1000000000 && styles.filterOptionTextActive]}>
                        2Cr+
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Area Size Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Area Size</Text>
                  <View style={styles.filterOptions}>
                    {['5 marla', '10 marla', '1 kanal', '2 kanal', '3 kanal'].map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[styles.filterOption, areaSizeFilter === size && styles.filterOptionActive]}
                        onPress={() => setAreaSizeFilter(areaSizeFilter === size ? '' : size)}
                      >
                        <Text style={[styles.filterOptionText, areaSizeFilter === size && styles.filterOptionTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Bedrooms Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Bedrooms</Text>
                  <View style={styles.filterOptions}>
                    {['1', '2', '3', '4', '5', '6+'].map((beds) => (
                      <TouchableOpacity
                        key={beds}
                        style={[styles.filterOption, bedroomsFilter === beds && styles.filterOptionActive]}
                        onPress={() => setBedroomsFilter(bedroomsFilter === beds ? '' : beds)}
                      >
                        <Text style={[styles.filterOptionText, bedroomsFilter === beds && styles.filterOptionTextActive]}>
                          {beds}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Furnished Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Furnished</Text>
                  <View style={styles.filterOptions}>
                    {['Yes', 'No', 'Semi-Furnished'].map((furnished) => (
                      <TouchableOpacity
                        key={furnished}
                        style={[styles.filterOption, furnishedFilter === furnished && styles.filterOptionActive]}
                        onPress={() => setFurnishedFilter(furnishedFilter === furnished ? '' : furnished)}
                      >
                        <Text style={[styles.filterOptionText, furnishedFilter === furnished && styles.filterOptionTextActive]}>
                          {furnished}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalButtonSecondary} onPress={clearAllFilters}>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED_PRIMARY,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  clearFiltersText: {
    fontSize: 14,
    color: RED_PRIMARY,
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 80 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#555', marginTop: 16 },
  emptySubtext: { color: '#999', marginTop: 4, textAlign: 'center' },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: RED_PRIMARY,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 0,
  },
  cardInner: {
    flexDirection: 'column',
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  purposeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  purposeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    padding: 12,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
    minHeight: 36,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  cardLocation: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  priceContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: '#888',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: RED_PRIMARY,
  },
  cashPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cashPriceLabel: {
    fontSize: 10,
    color: '#888',
  },
  cashPriceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: RED_PRIMARY,
    fontWeight: '600',
  },
  viewBtn: {
    backgroundColor: RED_PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 4,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
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
    color: '#666',
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
    fontWeight: '700',
    color: '#fff',
  },
});
