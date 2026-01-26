import { api } from './api';
import { UserProfile } from './user.api';

/**
 * Dashboard API
 */

export interface InstallmentApplication {
  _id?: string;
  applicationId?: string;
  userId?: string;
  installmentPlanId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_progress' | 'completed';
  applicationNote?: string;
  UserInfo?: Array<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    occupation?: string;
    employerName?: string;
    employerAddress?: string;
    jobTitle?: string;
    monthlyIncome?: string;
    otherIncomeSources?: string;
    workContactNumber?: string;
  }>;
  PlanInfo?: Array<{
    planType?: string;
    planPrice?: number;
    downPayment?: number;
    monthlyInstallment?: number;
    tenureMonths?: number;
    interestRatePercent?: number;
    interestType?: string;
  }>;
  assigenAgent?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  [key: string]: any;
}

export interface PropertyApplication {
  _id?: string;
  applicationId?: string;
  userId?: string;
  propertyId?: string;
  status?: string;
  applicationNote?: string;
  UserInfo?: Array<any>;
  PropertyInfo?: Array<any>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface LoanApplication {
  _id?: string;
  applicationId?: string;
  userId?: string;
  planId?: string;
  status?: string;
  applicationNote?: string;
  applicantInfo?: any;
  contactInfo?: any;
  incomeDetails?: any;
  bankingDetails?: any;
  loanRequirement?: any;
  islamicFinancing?: any;
  security?: any;
  declarations?: any;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UserDashboardData {
  'user Data'?: UserProfile;
  installnments?: InstallmentApplication[];
  properties?: PropertyApplication[];
  loans?: LoanApplication[];
}

export interface UserDashboardResponse {
  success?: boolean;
  message?: string;
  data?: UserDashboardData;
  error?: string;
}

/**
 * Get user dashboard data
 * GET /userDashboard
 * Requires Bearer token (automatically attached via axios interceptor)
 */
export const getUserDashboard = async (): Promise<UserDashboardResponse> => {
  try {
    const response = await api.get<UserDashboardResponse>('/userDashboard', {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorResponse: UserDashboardResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch dashboard data',
      error: error.response?.data?.error || error.message,
    };
    throw errorResponse;
  }
};

