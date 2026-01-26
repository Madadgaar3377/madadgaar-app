import { AppDispatch, store } from '../store';
import { setLoading, setError, setAuthData, setProfileImage, updateUserData, setUserProfile, clearAuth } from './authSlice';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signup as signupApi,
  login as loginApi,
  verifyAccount as verifyAccountApi,
  resendOtp as resendOtpApi,
  forgotPassword as forgotPasswordApi,
  newPassword as newPasswordApi,
  SignupPayload,
  LoginPayload,
  VerifyAccountPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  NewPasswordPayload,
  LoginResponse,
} from '@/services/auth.api';
import { uploadImage } from '@/services/upload.api';
import { updateUser, UpdateUserPayload, getUserById } from '@/services/user.api';
import { getLocationAndIp } from '@/utils/location';
import Toast from 'react-native-toast-message';

/**
 * Helper function to store auth data according to storage rules
 */
const storeAuthData = async (
  token: string,
  userMongoId: string,
  userId: string,
  email: string,
  name: string,
  profileImageUrl?: string | null
) => {
  // 1. Store token ONLY in SecureStore
  await SecureStore.setItemAsync('authToken', token);

  // 2. Store user data in AsyncStorage with clear keys
  const storageItems: [string, string][] = [
    ['userMongoId', userMongoId],
    ['userId', userId],
    ['userEmail', email],
    ['userName', name], // This is the display name
  ];

  if (profileImageUrl) {
    storageItems.push(['userProfileImageUrl', profileImageUrl]);
  }

  await AsyncStorage.multiSet(storageItems);
};

/**
 * Helper function to validate user account status
 */
const validateUserAccount = (user: LoginResponse['user'] | { isVerified?: boolean; isActive?: boolean; isBlocked?: boolean }): string | null => {
  if (!user.isVerified) {
    return 'Account is not verified. Please verify your account.';
  }
  if (!user.isActive) {
    return 'Account is inactive. Please contact support.';
  }
  if (user.isBlocked) {
    return 'Account is blocked. Please contact support.';
  }
  return null;
};

/**
 * Sign up action - Send OTP after signup, then verify to authenticate
 */
export const signup =
  (payload: SignupPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Step 1: Signup (DO NOT store any auth data - user must verify OTP first)
      const signupResponse = await signupApi(payload);
      
      // IMPORTANT: Do not store token or auth data from signup response
      // User must verify OTP first before authentication
      // Even if signup API returns a token, we ignore it until OTP verification

      // Step 2: Send OTP to user's email
      try {
        await resendOtpApi({ email: payload.email });
      } catch (otpError: any) {
        // If OTP sending fails, still allow user to proceed to OTP screen
        // They can resend OTP from there
      }

      dispatch(setLoading(false));
      dispatch(setError(null));

      // Return success with email to navigate to OTP screen
      // User will be authenticated only after OTP verification in verifyAccount action
      return { success: true, email: payload.email };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Signup failed';
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

/**
 * Login action - Handles exact API response structure
 */
export const login =
  (payload: LoginPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await loginApi(payload);

      // Validate response structure
      if (!response.success || !response.token || !response.user) {
        const errorMessage =
          response.message ||
          'Invalid login response. Please try again.';
        dispatch(setLoading(false));
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }

      // Validate user account status
      const validationError = validateUserAccount(response.user);
      if (validationError) {
        dispatch(setLoading(false));
        dispatch(setError(validationError));
        return { success: false, error: validationError };
      }

      // Store auth data according to storage rules
      await storeAuthData(
        response.token,
        response.user._id,
        response.user.userId,
        response.user.email,
        response.user.name
      );

      // Update Redux state
      dispatch(
        setAuthData({
          token: response.token,
          userId: response.user.userId,
          email: response.user.email,
          name: response.user.name,
        })
      );

      dispatch(setLoading(false));

      // After successful login, update location and IP in background
      setTimeout(() => {
        dispatch(updateUserLocationAndIp()).catch((error) => {
        });
      }, 1000);

      return { success: true };
    } catch (error: any) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.msg ||
        error.message ||
        'Login failed. Please check your email and password.';
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

/**
 * Verify account with OTP
 */
export const verifyAccount =
  (payload: VerifyAccountPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await verifyAccountApi(payload);

      // Backend returns: { success: true, message: "...", user: {...}, token: "..." }
      if (response.success && response.token && response.user) {
        // Validate user account status
        const validationError = validateUserAccount(response.user);
        if (validationError) {
          dispatch(setLoading(false));
          dispatch(setError(validationError));
          return { success: false, error: validationError };
        }

        // Store auth data according to storage rules
        await storeAuthData(
          response.token,
          response.user._id || '',
          response.user.userId || '',
          response.user.email || payload.email,
          response.user.name || ''
        );

        // Clear pending verification
        await AsyncStorage.removeItem('pendingVerificationEmail');

        // Update Redux state
        dispatch(
          setAuthData({
            token: response.token,
            userId: response.user.userId || '',
            email: response.user.email || payload.email,
            name: response.user.name || '',
          })
        );

        dispatch(setLoading(false));

        // After successful verification, update location and IP in background
        setTimeout(() => {
          dispatch(updateUserLocationAndIp()).catch((error) => {
          });
        }, 1000);

        return { success: true, message: response.message || 'Account verified successfully' };
      } else {
        // If response doesn't have success, token, or user, it's an error
        const errorMessage = response.message || 'Verification failed. Please try again.';
        dispatch(setLoading(false));
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Verification failed';
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

/**
 * Resend OTP
 */
export const resendOtp =
  (payload: ResendOtpPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await resendOtpApi(payload);

      dispatch(setLoading(false));
      return { success: true, message: response.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to resend OTP';
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

/**
 * Forgot password - send OTP to email
 */
export const forgotPassword =
  (payload: ForgotPasswordPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await forgotPasswordApi(payload);

      dispatch(setLoading(false));
      return { success: true, message: response.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to send password reset code';
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

/**
 * Set new password with OTP
 */
export const setNewPassword =
  (payload: NewPasswordPayload) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await newPasswordApi(payload);

      dispatch(setLoading(false));
      return { success: true, message: response.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password';
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

/**
 * Logout action - Clears all stored auth data
 */
export const logout = () => async (dispatch: AppDispatch) => {
  try {
    // Clear token from SecureStore
    await SecureStore.deleteItemAsync('authToken');

    // Clear all user data from AsyncStorage
    await AsyncStorage.multiRemove([
      'userMongoId',
      'userId',
      'userEmail',
      'userName',
      'userProfileImageUrl',
      'pendingVerificationEmail',
    ]);

    // Clear Redux state
    dispatch(clearAuth());
  } catch (error) {
    // Even if clearing fails, clear Redux state
    dispatch(clearAuth());
  }
};

/**
 * Load stored auth data on app start
 * Reads from SecureStore and AsyncStorage according to storage rules
 */
export const loadStoredAuth = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));

    // Read token from SecureStore
    const token = await SecureStore.getItemAsync('authToken');

    // Read user data from AsyncStorage
    const [userMongoId, userId, email, name, profileImageUrl] = await Promise.all([
      AsyncStorage.getItem('userMongoId'),
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('userEmail'),
      AsyncStorage.getItem('userName'),
      AsyncStorage.getItem('userProfileImageUrl'),
    ]);

    // Restore Redux state if all required data exists
    if (token && userId && email && name) {
      dispatch(
        setAuthData({
          token,
          userId,
          email,
          name,
          profileImageUrl: profileImageUrl || undefined,
        })
      );
    } else {
      // No stored auth, ensure loading is false
      dispatch(setLoading(false));
    }
  } catch (error) {
    // Ignore errors, user will need to login again
    dispatch(setLoading(false));
  }
};

/**
 * Upload profile image action
 */
export const uploadProfileImage =
  (imageUri: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await uploadImage(imageUri);

      // Extract image URL from response (handle different possible response structures)
      const imageUrl =
        response.imageUrl ||
        response.url ||
        response.data?.imageUrl ||
        response.data?.url;

      if (!imageUrl) {
        throw new Error(
          response.message || 'Failed to upload image. Please try again.'
        );
      }

      // Store image URL in AsyncStorage
      await AsyncStorage.setItem('userProfileImageUrl', imageUrl);

      // Update Redux state
      dispatch(setProfileImage(imageUrl));

      // Also update user data on server with the new profile picture URL
      const state = store.getState();
      const currentUserId = state.auth.userId;
      if (currentUserId) {
        try {
          await updateUser({
            userId: currentUserId,
            updates: {
              profilePic: imageUrl,
            },
          });
        } catch (updateError) {
          // Log error but don't fail the upload
        }
      }

      dispatch(setLoading(false));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile image updated successfully',
      });

      return { success: true, imageUrl };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to upload image. Please try again.';

      dispatch(setLoading(false));
      dispatch(setError(errorMessage));

      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

/**
 * Update user data action (name, userName, profilePic, phoneNumber, cnicNumber, Address, WhatsappNumber)
 */
export const updateUserProfile =
  (updates: {
    name?: string;
    userName?: string;
    profileImageUrl?: string;
    phoneNumber?: string;
    WhatsappNumber?: string;
    cnicNumber?: string;
    Address?: string;
    livelocation?: string;
    lastIpAddress?: string;
  }) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const state = store.getState();
        const userId = state.auth.userId;

        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }

        // Prepare update payload
        const updatePayload: UpdateUserPayload = {
          userId,
          updates: {},
        };

        if (updates.name !== undefined) {
          updatePayload.updates.name = updates.name;
        }
        if (updates.userName !== undefined) {
          updatePayload.updates.userName = updates.userName;
        }
        if (updates.profileImageUrl !== undefined) {
          updatePayload.updates.profilePic = updates.profileImageUrl;
        }
        if (updates.phoneNumber !== undefined) {
          updatePayload.updates.phoneNumber = updates.phoneNumber;
        }
        if (updates.WhatsappNumber !== undefined) {
          updatePayload.updates.WhatsappNumber = updates.WhatsappNumber;
        }
        if (updates.cnicNumber !== undefined) {
          updatePayload.updates.cnicNumber = updates.cnicNumber;
        }
        if (updates.Address !== undefined) {
          updatePayload.updates.Address = updates.Address;
        }
        if (updates.livelocation !== undefined) {
          updatePayload.updates.livelocation = updates.livelocation;
        }
        if (updates.lastIpAddress !== undefined) {
          updatePayload.updates.lastIpAddress = updates.lastIpAddress;
        }

        // Call API
        const response = await updateUser(updatePayload);

        if (!response.success && !response.user) {
          throw new Error(
            response.message || response.error || 'Failed to update user data.'
          );
        }

        // If response includes updated user data, use it immediately
        if (response.user) {
          dispatch(setUserProfile(response.user));
        }

        // Update local storage
        if (updates.name !== undefined) {
          await AsyncStorage.setItem('userName', updates.name);
        }
        if (updates.profileImageUrl !== undefined) {
          await AsyncStorage.setItem('userProfileImageUrl', updates.profileImageUrl);
        }

        // Update Redux state
        dispatch(updateUserData({
          name: updates.name,
          userName: updates.userName,
          profileImageUrl: updates.profileImageUrl,
          phoneNumber: updates.phoneNumber,
          WhatsappNumber: updates.WhatsappNumber,
          cnicNumber: updates.cnicNumber,
          Address: updates.Address,
          livelocation: updates.livelocation,
          lastIpAddress: updates.lastIpAddress,
        }));

        // Try to refresh profile, but if getUserById doesn't return user data, use updateUser response instead
        // The updateUser response already contains the updated user data
        if (response.user) {
          // updateUser response has user data, use it directly
        } else {
          // Try to fetch fresh data, but don't fail if it doesn't work
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const refreshResult = await dispatch(fetchUserProfile());
            if (refreshResult.success && refreshResult.user) {
            } else {
            }
          } catch (fetchError) {
          }
        }

        dispatch(setLoading(false));

        // Only show toast if this is a user-initiated update (not automatic location/IP update)
        // Check if update includes location/IP only (silent update)
        const isSilentUpdate = !updates.name && !updates.userName && !updates.profileImageUrl &&
          !updates.phoneNumber && !updates.WhatsappNumber && !updates.cnicNumber &&
          !updates.Address && (updates.livelocation || updates.lastIpAddress);

        if (!isSilentUpdate) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Profile updated successfully',
          });
        }

        return { success: true, user: response.user };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to update user data. Please try again.';

        dispatch(setLoading(false));
        dispatch(setError(errorMessage));

        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    };

/**
 * Fetch user profile by ID
 * Uses Bearer token (from SecureStore via axios interceptor) and userId (from Redux state)
 */
export const fetchUserProfile = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const state = store.getState();
    const userId = state.auth.userId;
    const token = state.auth.token;

    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    const response = await getUserById(userId);

    if (!response.success || !response.user) {
      throw new Error(
        response.message || response.error || 'Failed to fetch user profile.'
      );
    }

    // Update Redux state with full profile
    dispatch(setUserProfile(response.user));

    dispatch(setLoading(false));
    return { success: true, user: response.user };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch user profile. Please try again.';

    dispatch(setLoading(false));
    dispatch(setError(errorMessage));

    return { success: false, error: errorMessage };
  }
};

/**
 * Update user location and IP address
 * Gets current location and IP, then updates the user profile
 */
export const updateUserLocationAndIp = () => async (dispatch: AppDispatch) => {
  try {
    const state = store.getState();
    const userId = state.auth.userId;
    const isAuthenticated = state.auth.isAuthenticated;

    // Only update if user is authenticated
    if (!isAuthenticated || !userId) {
      return { success: false, error: 'User not authenticated' };
    }
    // Get location and IP
    const { location, ipAddress } = await getLocationAndIp();

    // Prepare updates
    const updates: {
      livelocation?: string;
      lastIpAddress?: string;
    } = {};

    if (location) {
      updates.livelocation = location.locationString;
    } else {
    }

    if (ipAddress) {
      updates.lastIpAddress = ipAddress;
    } else {
    }

    // Only update if we have at least one value
    if (!location && !ipAddress) {
      return { success: false, error: 'No location or IP data available' };
    }

    // Update user profile with location and IP (silently, no toast)
    const result = await dispatch(updateUserProfile(updates));

    if (result.success) {
      // Profile refresh is handled inside updateUserProfile, so data should be up to date
    } else {
    }

    return result;
  } catch (error: any) {
    const errorMessage =
      error.message || 'Failed to update location and IP address.';
    return { success: false, error: errorMessage };
  }
};
