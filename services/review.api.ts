import { api } from './api';

export interface Review {
  _id?: string;
  reviewId?: string;
  installmentPlanId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userProfileImage?: string;
  rating: number;
  title?: string;
  comment: string;
  reviewCategories?: {
    value?: number;
    quality?: number;
    service?: number;
    delivery?: number;
  };
  reviewImages?: string[];
  status: string;
  helpfulCount?: number;
  helpfulUsers?: string[];
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewStatistics {
  total: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewResponse {
  success: boolean;
  data?: {
    reviews: Review[];
    statistics: ReviewStatistics;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  reviews?: Review[];
  statistics?: ReviewStatistics;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface CreateReviewPayload {
  installmentPlanId: string;
  rating: number;
  title?: string;
  comment: string;
  reviewCategories?: {
    value?: number;
    quality?: number;
    service?: number;
    delivery?: number;
  };
  reviewImages?: string[];
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data?: Review;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  comment?: string;
  reviewCategories?: {
    value?: number;
    quality?: number;
    service?: number;
    delivery?: number;
  };
  reviewImages?: string[];
}

export interface UpdateReviewResponse {
  success: boolean;
  message: string;
  data?: Review;
}

export interface MarkHelpfulResponse {
  success: boolean;
  message: string;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

/**
 * Get reviews for an installment plan
 */
export const getInstallmentReviews = async (
  installmentPlanId: string,
  options?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ReviewResponse> => {
  try {
    const {
      status = 'approved',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const response = await api.get<ReviewResponse>(
      `/getInstallmentReviews/${encodeURIComponent(installmentPlanId)}`,
      {
        params: {
          status,
          page,
          limit,
          sortBy,
          sortOrder,
          _t: Date.now(), // Cache busting
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
  }
};

/**
 * Create a new review
 */
export const createInstallmentReview = async (
  payload: CreateReviewPayload
): Promise<CreateReviewResponse> => {
  try {
    console.log('Creating review with payload:', payload);
    const response = await api.post<CreateReviewResponse>(
      '/createInstallmentReview',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating review:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    if (error.response?.status === 404) {
      throw new Error('Review endpoint not found. Please check the API configuration.');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to create review');
  }
};

/**
 * Update an existing review
 */
export const updateInstallmentReview = async (
  reviewId: string,
  payload: UpdateReviewPayload
): Promise<UpdateReviewResponse> => {
  try {
    const response = await api.put<UpdateReviewResponse>(
      `/updateInstallmentReview/${encodeURIComponent(reviewId)}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating review:', error);
    throw new Error(error.response?.data?.message || 'Failed to update review');
  }
};

/**
 * Mark a review as helpful
 */
export const markReviewHelpful = async (reviewId: string): Promise<MarkHelpfulResponse> => {
  try {
    const response = await api.post<MarkHelpfulResponse>(
      `/markReviewHelpful/${encodeURIComponent(reviewId)}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error marking review helpful:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark review as helpful');
  }
};

/**
 * Delete a review
 */
export const deleteInstallmentReview = async (reviewId: string): Promise<DeleteReviewResponse> => {
  try {
    const response = await api.delete<DeleteReviewResponse>(
      `/deleteInstallmentReview/${encodeURIComponent(reviewId)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error deleting review:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete review');
  }
};
