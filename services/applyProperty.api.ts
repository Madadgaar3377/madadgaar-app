import { api } from './api';

/**
 * Apply Property API
 */

export interface ApplyPropertyUserInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  whatsApp?: string;
  cnic?: string;
  reference?: string;
}

export interface ApplyPropertyPayload {
  data: {
    type: 'Project' | 'Individual';
    propertyId: string;
    applicationNote?: string;
    assigenAgent?: string;
    commonForm: Array<{
      name?: string;
      email?: string;
      number?: string;
      whatsApp?: string;
      cnic?: string;
      city?: string;
      area?: string;
      reference?: string;
    }>;
  };
}

export interface ApplyPropertyResponse {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Apply for a property
 * POST /applyProperty
 */
export const applyProperty = async (
  payload: ApplyPropertyPayload
): Promise<ApplyPropertyResponse> => {
  try {
    console.log('Sending property application:', payload);
    const response = await api.post<ApplyPropertyResponse>('/applyProperty', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to apply for property');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Property application API error:', error);
    const errorResponse: ApplyPropertyResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to apply for property',
      error: error.response?.data?.error || error.message,
    };
    throw errorResponse;
  }
};

