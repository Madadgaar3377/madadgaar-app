import { api } from './api';

/**
 * User API
 */

export interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  userName?: string;
  profilePic?: string;
  userId?: string;
  UserType?: string;
  isVerified?: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
  walletBalance?: number;
  Address?: string;
  WhatsappNumber?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UpdatePasswordRequest {
  password: string; // Old password
  newPassword: string; // New password
}

export interface UpdatePasswordResponse {
  success?: boolean;
  message?: string;
  user?: UserProfile;
  error?: string;
}

export interface GetUserByIdResponse {
  success?: boolean;
  message?: string;
  user?: UserProfile;
  error?: string;
}

export interface UpdateUserPayload {
  userId: string;
  updates: {
    name?: string;
    userName?: string;
    profilePic?: string;
    phoneNumber?: string;
    WhatsappNumber?: string;
    cnicNumber?: string;
    Address?: string;
    livelocation?: string;
    lastIpAddress?: string;
    [key: string]: any;
  };
}

export interface UpdateUserResponse {
  success?: boolean;
  message?: string;
  user?: UserProfile;
  error?: string;
}

/**
 * Get user by ID
 * GET /api/getUserById
 * Requires Bearer token (automatically attached via axios interceptor)
 * Backend extracts userId from JWT token, so no userId parameter needed
 */
export const getUserById = async (userId?: string): Promise<GetUserByIdResponse> => {
  try {
    const response = await api.get<GetUserByIdResponse>('/getUserById');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get user',
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Update user profile
 * PUT /api/updateUser
 * Requires Bearer token (automatically attached via axios interceptor)
 */
export const updateUser = async (payload: UpdateUserPayload): Promise<UpdateUserResponse> => {
  try {
    const response = await api.put<UpdateUserResponse>('/updateUser', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update user',
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Update user password
 * PUT /api/updatePassword
 * Requires Bearer token (automatically attached via axios interceptor)
 */
export const updatePassword = async (data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
  try {
    const response = await api.put<UpdatePasswordResponse>('/updatePassword', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update password',
      error: error.response?.data?.error || error.message,
    };
  }
};
