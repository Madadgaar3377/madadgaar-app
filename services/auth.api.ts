import { api } from './api';

/**
 * Authentication API endpoints
 */

export interface SignupPayload {
  name: string;
  email: string;
  userName: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

/**
 * Exact login API response structure
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    userId: string;
    isVerified: boolean;
    isActive: boolean;
    isBlocked: boolean;
  };
  token: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    userId?: string;
    isVerified?: boolean;
    isActive?: boolean;
    isBlocked?: boolean;
  };
  error?: string;
  errors?: Array<{ message?: string }>;
}

/**
 * Sign up a new user
 */
export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/signup', payload);
  return response.data;
};

/**
 * Login user - returns exact response structure
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', payload);
  return response.data;
};

/**
 * Verify account with OTP
 */
export const verifyAccount = async (
  payload: VerifyAccountPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/verifyAccount', payload);
  return response.data;
};

/**
 * Resend OTP
 */
export const resendOtp = async (
  payload: ResendOtpPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/reSendOtp', payload);
  return response.data;
};

export interface ForgotPasswordPayload {
  email: string;
}

export interface NewPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * Forgot password - send OTP to email
 */
export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/forgetPassword', payload);
  return response.data;
};

/**
 * Set new password with OTP
 */
export const newPassword = async (
  payload: NewPasswordPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/newPassword', payload);
  return response.data;
};