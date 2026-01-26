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
