import { api } from './api';

/**
 * Apply Installment API
 */

export interface ApplyInstallmentUserInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  occupation: string;
  employerName: string;
  employerAddress: string;
  jobTitle: string;
  monthlyIncome: string;
  otherIncomeSources?: string;
  workContactNumber: string;
}

export interface ApplyInstallmentUserInfoPayload {
  address: string;
  city: string;
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
}

export interface ApplyInstallmentPayload {
  installmentPlanId: string;
  applicationNote?: string;
  selectedPlanIndex?: number;
  userInfo: ApplyInstallmentUserInfoPayload;
}

export interface ApplyInstallmentResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Apply for an installment plan
 * POST /applyInstallment
 */
export const applyInstallment = async (
  payload: ApplyInstallmentPayload
): Promise<ApplyInstallmentResponse> => {
  try {
    const response = await api.post<ApplyInstallmentResponse>('/applyInstallment', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorResponse: ApplyInstallmentResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to apply for installment',
      error: error.response?.data?.error || error.message,
    };
    throw errorResponse;
  }
};

