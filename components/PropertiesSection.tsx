import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LazyImage } from '@/components/common/LazyImage';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { useRouter } from 'expo-router';
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
import { spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F8F9FA';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';

interface PropertiesSectionProps {
  limit?: number;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({ limit = 5 }) => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getAllProperties();
        setProperties(data.slice(0, limit));
      } catch (error) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit]);

  const handleSeeMore = () => {
    router.push('/(tabs)/properties');
  };

  const handlePropertyPress = (property: Property) => {
    if (property._id || property.id) {
      router.push(`/property-details/${property._id || property.id}` as any);
    } else {
      router.push('/(tabs)/properties');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <CardSkeleton count={3} />
        </ScrollView>
      </View>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Featured Properties</Text>
        <TouchableOpacity onPress={handleSeeMore} style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={RED_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {properties.map((property) => {
          const images = getPropertyImages(property);
          const imageUrl = property.imageUrl || images[0];
          const transaction = getPropertyTransaction(property);
          const price = transaction?.type === 'Rent' 
            ? getPropertyMonthlyRent(property) 
            : getPropertyPrice(property);
          const priceLabel = transaction?.type === 'Rent' ? 'Monthly Rent' : 'Price';

          return (
            <TouchableOpacity
              key={property._id || property.id || Math.random()}
              style={styles.card}
              onPress={() => handlePropertyPress(property)}
              activeOpacity={0.9}
            >
              {imageUrl ? (
                <LazyImage
                  source={{ uri: imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="home-outline" size={28} color={TEXT_TERTIARY} />
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {getPropertyTitle(property)}
                </Text>

                {getPropertyLocation(property) && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={TEXT_SECONDARY} />
                    <Text style={styles.cardLocation} numberOfLines={1}>
                      {getPropertyLocation(property)}
                    </Text>
                  </View>
                )}

                <View style={styles.priceRow}>
                  {price ? (
                    <>
                      <Text style={styles.priceValue}>
                        PKR {price.toLocaleString()}
                      </Text>
                      {transaction?.type === 'Rent' && (
                        <Text style={styles.priceLabel}>/month</Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.priceValue}>Price on request</Text>
                  )}
                </View>

                <View style={styles.detailsRow}>
                  {getPropertyBedrooms(property) && (
                    <View style={styles.detailItem}>
                      <Ionicons name="bed-outline" size={12} color={TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{getPropertyBedrooms(property)}</Text>
                    </View>
                  )}
                  {getPropertyBathrooms(property) && (
                    <View style={styles.detailItem}>
                      <Ionicons name="water-outline" size={12} color={TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{getPropertyBathrooms(property)}</Text>
                    </View>
                  )}
                  {getPropertyAreaSize(property) && (
                    <View style={styles.detailItem}>
                      <Ionicons name="resize-outline" size={12} color={TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{getPropertyAreaSize(property)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: RED_PRIMARY,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: 280,
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: GRAY_LIGHT,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    flex: 1,
    fontWeight: '400',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    gap: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: RED_PRIMARY,
  },
  priceLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
});
