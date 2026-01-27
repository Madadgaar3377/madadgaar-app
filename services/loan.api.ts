import { api } from './api';

/**
 * Loan API endpoints
 */

export interface LoanPlan {
  planId: string;
  productName: string;
  bankName: string;
  majorCategory: string;
  subCategory?: string;
  minFinancingAmount: number;
  maxFinancingAmount: number;
  minTenure: number;
  maxTenure: number;
  tenureUnit: 'Months' | 'Years';
  financingType: 'Conventional' | 'Islamic';
  indicativeRate: string;
  rateType?: 'Fixed' | 'Variable' | 'Floating';
  planImage?: string;
  description?: string;
  planDocument?: string;
  eligibility?: {
    minAge?: number;
    maxAge?: number;
    minIncome?: number;
    employmentType?: string[];
    requiredDocuments?: string[];
  };
  targetAudience?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllLoansResponse {
  success: boolean;
  message: string;
  data: LoanPlan[];
}

export interface ApplyLoanPayload {
  planId: string;
  applicantInfo: {
    fullName: string;
    fatherOrHusbandName?: string;
    cnicNumber: string;
    cnicExpiryDate?: string;
    dateOfBirth?: string;
    maritalStatus?: 'Single' | 'Married';
    numberOfDependents?: number;
  };
  contactInfo: {
    mobileNumber: string;
    whatsappNumber?: string;
    email?: string;
    currentAddress?: string;
    city?: string;
    residenceType?: 'Owned' | 'Rented' | 'Family';
  };
  incomeDetails: {
    incomeType: 'Salaried' | 'Business' | 'Self-Employed';
    employerName?: string;
    designation?: string;
    jobStatus?: 'Permanent' | 'Contract';
    monthlyNetSalary?: number;
    businessName?: string;
    natureOfBusiness?: string;
    yearsInBusiness?: number;
    ntnAvailable?: boolean;
    approxMonthlyIncome?: number;
  };
  bankingDetails?: {
    bankNames?: string[];
    accountType?: 'Saving' | 'Current';
    existingLoan?: {
      loanType?: string;
      bankName?: string;
      monthlyInstallment?: number;
    };
  };
  loanRequirement: {
    loanType: 'Home' | 'Business' | 'Auto' | 'Personal';
    requiredAmount: number;
    preferredTenure?: number;
    financingPreference?: 'Conventional' | 'Islamic' | 'Either';
  };
  islamicFinancing?: {
    preferredMode?: 'Murabaha' | 'Musharakah' | 'Diminishing Musharakah' | 'Ijarah' | 'Salam' | 'Istisna' | 'Not Sure';
    shariahTermsAccepted?: boolean;
  };
  security?: {
    securityOffered?: 'Property' | 'Vehicle' | 'Guarantee' | 'None';
    estimatedValue?: number;
  };
  declarations: {
    creditCheckConsent: boolean;
    informationConfirmed: boolean;
    applicantSignature: string;
    signedAt: string;
  };
  applicationNote?: string;
  documents?: {
    cnicFront?: string;
    cnicBack?: string;
    salarySlip?: string;
    bankStatement?: string;
    otherDocuments?: string[];
  };
}

export interface ApplyLoanResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Get all loans
 * GET /getAllLoans
 */
export const getAllLoans = async (): Promise<GetAllLoansResponse> => {
  try {
    const response = await api.get<GetAllLoansResponse>('/getAllLoans');
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch loans',
      data: [],
    };
  }
};

/**
 * Get loan by planId
 * GET /getLoan/:planId (if available, otherwise filter from getAllLoans)
 */
export const getLoanById = async (planId: string): Promise<LoanPlan | null> => {
  try {
    const response = await getAllLoans();
    if (response.success && response.data) {
      const loan = response.data.find((loan) => loan.planId === planId);
      return loan || null;
    }
    return null;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Apply for a loan
 * POST /applyLoan
 */
export const applyLoan = async (payload: ApplyLoanPayload): Promise<ApplyLoanResponse> => {
  try {
    console.log('Sending loan application:', payload);
    const response = await api.post<ApplyLoanResponse>('/applyLoan', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Failed to apply for loan');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Loan application API error:', error);
    const errorResponse: ApplyLoanResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to apply for loan',
      error: error.response?.data?.error || error.message,
    };
    throw errorResponse;
  }
};

