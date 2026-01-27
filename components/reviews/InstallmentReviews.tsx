import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getInstallmentReviews,
  createInstallmentReview,
  updateInstallmentReview,
  deleteInstallmentReview,
  markReviewHelpful,
  Review,
  ReviewStatistics,
  CreateReviewPayload,
} from '@/services/review.api';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing } from '@/theme';
import { LazyImage } from '@/components/common/LazyImage';
import { AuthRequired } from '@/components/auth/AuthRequired';
import Toast from 'react-native-toast-message';

const RED_PRIMARY = '#D32F2F';

interface InstallmentReviewsProps {
  installmentPlanId?: string;
  planId?: string;
}

export const InstallmentReviews: React.FC<InstallmentReviewsProps> = ({
  installmentPlanId,
  planId,
}) => {
  const { userId, isAuthenticated } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics>({
    total: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper to check if string is a valid MongoDB ObjectId
  const isValidObjectId = (str: string | undefined): boolean => {
    if (!str) return false;
    const strVal = String(str);
    return /^[0-9a-fA-F]{24}$/.test(strVal);
  };

  // Get the correct ID to use
  const getPlanId = (): string | undefined => {
    if (installmentPlanId) {
      return installmentPlanId;
    }
    if (planId && isValidObjectId(planId)) {
      return planId;
    }
    return planId;
  };

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  // Fetch reviews
  useEffect(() => {
    const id = getPlanId();
    if (!id) {
      setLoading(false);
      setError('Installment plan ID is required to load reviews');
      return;
    }
    fetchReviews();
  }, [installmentPlanId, planId, page]);

  const fetchReviews = async () => {
    const id = getPlanId();
    if (!id) {
      setError('Installment plan ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await getInstallmentReviews(id, {
        status: 'approved',
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.success !== false) {
        const reviewsData = response.data?.reviews || response.reviews || [];
        const existingStats = response.data?.statistics || response.statistics || {};
        const paginationData = response.data?.pagination || response.pagination || { totalPages: 1 };

        // Calculate rating distribution from reviews if not provided
        let ratingDistribution = existingStats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (reviewsData.length > 0 && Object.values(ratingDistribution).every((v) => v === 0)) {
          ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach((r) => {
            const rating = Math.round(r.rating || 0);
            if (rating >= 1 && rating <= 5) {
              ratingDistribution[rating as keyof typeof ratingDistribution] =
                (ratingDistribution[rating as keyof typeof ratingDistribution] || 0) + 1;
            }
          });
        }

        const statsData: ReviewStatistics = {
          total: existingStats.total !== undefined ? existingStats.total : reviewsData.length,
          averageRating:
            existingStats.averageRating !== undefined
              ? existingStats.averageRating
              : reviewsData.length > 0
              ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length
              : 0,
          ratingDistribution,
        };

        setReviews(reviewsData);
        setStatistics(statsData);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        setError(response.message || 'Failed to load reviews');
        setReviews([]);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews. Please try again.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please login to submit a review',
      });
      return;
    }

    if (!formData.comment.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please write a comment',
      });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const id = getPlanId();
      if (!id) {
        setError('Installment plan ID is required');
        return;
      }

      const payload: CreateReviewPayload = {
        installmentPlanId: installmentPlanId || String(planId || id),
        rating: formData.rating,
        title: formData.title || undefined,
        comment: formData.comment,
      };

      let response;
      if (editingReview) {
        response = await updateInstallmentReview(editingReview.reviewId || editingReview._id || '', {
          rating: formData.rating,
          title: formData.title || undefined,
          comment: formData.comment,
        });
      } else {
        response = await createInstallmentReview(payload);
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: editingReview ? 'Review updated successfully' : 'Review submitted successfully',
        });
        setShowReviewForm(false);
        setEditingReview(null);
        setFormData({
          rating: 5,
          title: '',
          comment: '',
        });
        setTimeout(() => {
          fetchReviews();
        }, 500);
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
      });
      
      let errorMessage = err.message || 'Failed to submit review';
      if (err.response?.status === 404) {
        errorMessage = 'Review service is currently unavailable. Please try again later.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to submit a review';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid review data. Please check your input.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please login to mark reviews as helpful',
      });
      return;
    }

    try {
      const response = await markReviewHelpful(reviewId);
      if (response.success) {
        fetchReviews();
      }
    } catch (err: any) {
      console.error('Error marking helpful:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteInstallmentReview(reviewId);
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Review deleted successfully',
                });
                fetchReviews();
              } else {
                throw new Error(response.message || 'Failed to delete review');
              }
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.message || 'Failed to delete review',
              });
            }
          },
        },
      ]
    );
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
    });
    setShowReviewForm(true);
  };

  const currentUserReviews = reviews.filter((r) => r.userId === userId);

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFB800' : '#E0E0E0'}
          />
        ))}
      </View>
    );
  };

  const renderRatingDistribution = () => {
    if (statistics.total === 0) return null;

    return (
      <View style={styles.ratingDistributionCard}>
        <Text style={styles.ratingDistributionTitle}>Rating Distribution</Text>
        <View style={styles.ratingDistributionList}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = statistics.ratingDistribution[rating as keyof typeof statistics.ratingDistribution] || 0;
            const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
            return (
              <View key={rating} style={styles.ratingDistributionRow}>
                <View style={styles.ratingLabelRow}>
                  <Text style={styles.ratingLabel}>{rating}</Text>
                  <Ionicons name="star" size={14} color="#FFB800" />
                </View>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
                </View>
                <View style={styles.ratingCount}>
                  <Text style={styles.ratingCountText}>{count}</Text>
                  <Text style={styles.ratingPercentage}>({percentage.toFixed(0)}%)</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>⭐</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Customer Reviews</Text>
                <Text style={styles.headerSubtitle}>Share your experience with this product</Text>
              </View>
            </View>

            {statistics.total > 0 && (
              <View style={styles.ratingSummary}>
                <View style={styles.ratingSummaryTop}>
                  <Text style={styles.averageRating}>{statistics.averageRating.toFixed(1)}</Text>
                  <Text style={styles.ratingOutOf}>/ 5</Text>
                </View>
                {renderStars(Math.round(statistics.averageRating), 18)}
                <Text style={styles.reviewCount}>
                  Based on {statistics.total} {statistics.total === 1 ? 'review' : 'reviews'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {isAuthenticated && !currentUserReviews.length && !showReviewForm && (
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => setShowReviewForm(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.writeReviewButtonText}>Write a Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && !reviews.length && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rating Distribution */}
      {renderRatingDistribution()}

      {/* Review Form Modal */}
      <Modal
        visible={showReviewForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowReviewForm(false);
          setEditingReview(null);
          setFormData({ rating: 5, title: '', comment: '' });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReview ? 'Edit Your Review' : 'Write a Review'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, title: '', comment: '' });
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Rating Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Your Rating *</Text>
                <View style={styles.starSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setFormData({ ...formData, rating: star })}
                      style={[
                        styles.starButton,
                        star <= formData.rating && styles.starButtonActive,
                      ]}
                    >
                      <Ionicons
                        name={star <= formData.rating ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= formData.rating ? '#FFB800' : '#E0E0E0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.ratingDescription}>
                  {formData.rating === 5 && 'Excellent'}
                  {formData.rating === 4 && 'Very Good'}
                  {formData.rating === 3 && 'Good'}
                  {formData.rating === 2 && 'Fair'}
                  {formData.rating === 1 && 'Poor'}
                </Text>
              </View>

              {/* Title */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Review Title (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Give your review a catchy title..."
                  placeholderTextColor="#999"
                  maxLength={200}
                />
              </View>

              {/* Comment */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Your Review *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.comment}
                  onChangeText={(text) => setFormData({ ...formData, comment: text })}
                  placeholder="Share your detailed experience with this product..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={6}
                  maxLength={2000}
                />
                <Text style={styles.charCount}>
                  {formData.comment.length}/2000 characters
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (submitting || !formData.comment.trim()) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={submitting || !formData.comment.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={editingReview ? 'checkmark-circle' : 'add-circle'}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.submitButtonText}>
                      {editingReview ? 'Update Review' : 'Submit Review'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reviews List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED_PRIMARY} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to share your experience with this product!
          </Text>
          {isAuthenticated && !showReviewForm && (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Text style={styles.writeReviewButtonText}>Write the First Review</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map((review) => {
            const isOwnReview = userId === review.userId;
            const isHelpful = review.helpfulUsers?.includes(userId || '');

            return (
              <View key={review._id || review.reviewId} style={styles.reviewCard}>
                {/* Review Header */}
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUserInfo}>
                    {review.userProfileImage ? (
                      <LazyImage
                        source={{ uri: review.userProfileImage }}
                        style={styles.userAvatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Text style={styles.userAvatarText}>
                          {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                    {isOwnReview && (
                      <View style={styles.ownReviewBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </View>

                  <View style={styles.reviewUserDetails}>
                    <View style={styles.reviewUserHeader}>
                      <Text style={styles.reviewUserName}>{review.userName || 'Anonymous'}</Text>
                      {isOwnReview && (
                        <View style={styles.reviewActions}>
                          <TouchableOpacity
                            onPress={() => handleEditReview(review)}
                            style={styles.reviewActionButton}
                          >
                            <Ionicons name="create-outline" size={18} color={colors.accent} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteReview(review.reviewId || review._id || '')}
                            style={styles.reviewActionButton}
                          >
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <View style={styles.reviewMeta}>
                      {renderStars(review.rating, 14)}
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Review Content */}
                <View style={styles.reviewContent}>
                  {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
                  <Text style={styles.reviewComment}>{review.comment}</Text>

                  {review.reviewImages && review.reviewImages.length > 0 && (
                    <View style={styles.reviewImages}>
                      {review.reviewImages.map((img, idx) => (
                        <LazyImage
                          key={idx}
                          source={{ uri: img }}
                          style={styles.reviewImage}
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* Review Footer */}
                <View style={styles.reviewFooter}>
                  <TouchableOpacity
                    style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
                    onPress={() => handleMarkHelpful(review.reviewId || review._id || '')}
                  >
                    <Ionicons
                      name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={16}
                      color={isHelpful ? RED_PRIMARY : '#666'}
                    />
                    <Text
                      style={[
                        styles.helpfulButtonText,
                        isHelpful && styles.helpfulButtonTextActive,
                      ]}
                    >
                      Helpful ({review.helpfulCount || 0})
                    </Text>
                  </TouchableOpacity>

                  {review.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.verifiedText}>Verified Purchase</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Ionicons name="chevron-back" size={20} color={page === 1 ? '#ccc' : '#333'} />
            <Text
              style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            Page {page} of {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              page === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <Text
              style={[
                styles.paginationButtonText,
                page === totalPages && styles.paginationButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={page === totalPages ? '#ccc' : '#333'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerContent: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFEB3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  ratingSummary: {
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  ratingSummaryTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ratingOutOf: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: RED_PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingDistributionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ratingDistributionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.md,
  },
  ratingDistributionList: {
    gap: 12,
  },
  ratingDistributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    gap: 4,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  ratingCount: {
    width: 60,
    alignItems: 'flex-end',
  },
  ratingCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  ratingPercentage: {
    fontSize: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  starSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  starButtonActive: {
    // Active state handled by icon color
  },
  ratingDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED_PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reviewsList: {
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  reviewUserInfo: {
    marginRight: spacing.md,
    position: 'relative',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RED_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ownReviewBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewActionButton: {
    padding: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewContent: {
    marginBottom: spacing.md,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reviewImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  helpfulButtonActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: RED_PRIMARY,
  },
  helpfulButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  helpfulButtonTextActive: {
    color: RED_PRIMARY,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paginationButtonTextDisabled: {
    color: '#999',
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
