import { api } from './api';

/**
 * Installment API endpoints
 */

// Product Detail Interfaces
export interface ProductSpecifications {
  generalFeatures?: {
    operatingSystem?: string;
    simSupport?: string;
    phoneDimensions?: string;
    phoneWeight?: string;
    colors?: string;
    model?: string;
    dimensions?: string;
    weight?: string;
    engine?: string;
    other?: string;
    [key: string]: any;
  };
  performance?: {
    processor?: string;
    gpu?: string;
    transmission?: string;
    groundClearance?: string;
    starting?: string;
    displacement?: string;
    petrolCapacity?: string;
    [key: string]: any;
  };
  display?: {
    screenSize?: string;
    screenResolution?: string;
    technology?: string;
    protection?: string;
    [key: string]: any;
  };
  memory?: {
    internalMemory?: string;
    ram?: string;
    cardSlot?: string;
    [key: string]: any;
  };
  battery?: {
    type?: string;
    capacity?: string;
    [key: string]: any;
  };
  camera?: {
    frontCamera?: string;
    backCamera?: string;
    features?: string;
    [key: string]: any;
  };
  connectivity?: {
    data?: string;
    nfc?: string;
    bluetooth?: string;
    infrared?: string;
    [key: string]: any;
  };
  electricalBike?: {
    model?: string;
    dimensions?: string;
    weight?: string;
    speed?: string;
    batterySpec?: string;
    chargingTime?: string;
    brakes?: string;
    warranty?: string;
    rangeKm?: string;
    motor?: string;
    [key: string]: any;
  };
  // Add other category specific specs as needed
  [key: string]: any;
}

export interface Installment {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  amount?: number;
  totalAmount?: number;
  monthlyPayment?: number;
  downPayment?: number;
  duration?: number;
  interestRate?: number;
  imageUrl?: string;
  image?: string;
  productImages?: string[]; // Array of images
  status?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;

  // Detailed Specs
  specifications?: ProductSpecifications;
  paymentPlans?: any[];

  // Creator Info
  createdBy?: {
    name?: string;
    city?: string;
    phone?: string;
    [key: string]: any;
  };

  [key: string]: any; // Allow for additional properties
}

export interface GetAllInstallmentsResponse {
  success?: boolean;
  message?: string;
  installments?: Installment[];
  data?: Installment[];
  [key: string]: any;
}

/**
 * Get single installment by ID
 * GET /getInstallmentById/:id
 */
export const getInstallmentById = async (id: string): Promise<Installment | null> => {
  try {
    // We assume normalizing the list response is safer/easier if no dedicated single endpoint exists, 
    // OR if the single endpoint format matches the list item format.
    // Let's try to find it in the list first via a fresh API call to ensure we have it.
    const all = await getAllInstallments();
    const found = all.find(i => i.id === id || i._id === id);
    if (found) return found;

    // If not found in list, and assuming maybe pagination logic (future proofing), 
    // we can try a direct fetch if endpoint existed. For now, rely on list.
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get all installments
 * GET /getAllInstallments
 */
export const getAllInstallments = async (): Promise<Installment[]> => {
  try {
    // Primary attempt: GET
    const response = await api.get<GetAllInstallmentsResponse>('/getAllInstallments', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Madadgaar-Mobile-App/1.0',
      },
    });

    // Check if GET success returned HTML (Cloudflare soft-block)
    const responseString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    if (responseString.includes('<!DOCTYPE html>') || responseString.includes('Just a moment')) {
      throw new Error('Cloudflare challenge detected');
    }

    // ... normalize logic helper ...
    return normalizeResponse(response.data);

  } catch (error: any) {
    // Check if error response is HTML (Cloudflare challenge)
    const isHtmlError =
      error.message === 'Cloudflare challenge detected' ||
      (error.response?.data &&
        (typeof error.response.data === 'string'
          ? error.response.data.includes('<!DOCTYPE html>') || error.response.data.includes('Just a moment')
          : JSON.stringify(error.response.data).includes('<!DOCTYPE html>')));

    if (isHtmlError || error.response?.status === 522 || error.response?.status === 403) {
      try {
        // Retry with POST
        const postResponse = await api.post('/getAllInstallments', {}, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Madadgaar-Mobile-App/1.0',
          },
          responseType: 'text' // Force text to manually parse and check HTML
        });

        let responseData: any;
        try {
          responseData = typeof postResponse.data === 'string' ? JSON.parse(postResponse.data) : postResponse.data;
        } catch (e) {
          // Parsing failed, likely HTML
          return [];
        }

        // Check POST response for HTML
        const postRespStr = JSON.stringify(responseData);
        if (postRespStr.includes('<!DOCTYPE html>') || postRespStr.includes('Just a moment')) {
          return [];
        }

        return normalizeResponse(responseData);

      } catch (postError: any) {
        return [];
      }
    }

    return [];
  }
};

// Helper function to normalize response data
const normalizeResponse = (data: any): Installment[] => {
  let installments: any[] = [];

  if (Array.isArray(data)) {
    installments = data;
  } else if (data?.installments && Array.isArray(data.installments)) {
    installments = data.installments;
  } else if (data?.data && Array.isArray(data.data)) {
    installments = data.data;
  } else if (data && typeof data === 'object') {
    // Try scanning keys
    const arrayKeys = Object.keys(data).filter(k => Array.isArray(data[k]));
    if (arrayKeys.length > 0) installments = data[arrayKeys[0]];
  }

  if (!Array.isArray(installments)) return [];

  const BASE_IMAGE_URL = 'https://api.madadgaar.com.pk/';

  return installments.map((item: any) => {
    // Safe extraction
    const plan = item.paymentPlans && item.paymentPlans.length > 0 ? item.paymentPlans[0] : {};

    // Image handling: prioritize productImages array, then imageUrl field.
    let rawImage = '';
    if (item.productImages && item.productImages.length > 0) {
      rawImage = item.productImages[0];
    } else if (item.imageUrl) {
      rawImage = item.imageUrl;
    } else if (item.image) {
      rawImage = item.image;
    }

    // Normalize main image URL
    if (rawImage && !rawImage.startsWith('http') && !rawImage.startsWith('data:')) {
      // Clean up path if it starts with slash/backslsh
      rawImage = rawImage.replace(/^[\/\\]/, '');
      rawImage = `${BASE_IMAGE_URL}${rawImage}`;
    }

    // Process all images in array
    const allImages = (item.productImages || []).map((img: string) => {
      if (img && !img.startsWith('http') && !img.startsWith('data:')) {
        return `${BASE_IMAGE_URL}${img.replace(/^[\/\\]/, '')}`;
      }
      return img;
    });

    // Ensure we have at least the main image in the list if mapped from single field
    if (allImages.length === 0 && rawImage) {
      allImages.push(rawImage);
    }

    // Construct Specs
    const specs: ProductSpecifications = {
      generalFeatures: item.generalFeatures,
      performance: item.performance,
      display: item.display,
      memory: item.memory,
      battery: item.battery,
      camera: item.camera,
      connectivity: item.connectivity,
      electricalBike: item.electricalBike,
      mechanicalBike: item.mechanicalBike,
      airConditioner: item.airConditioner,
    };

    return {
      id: item.installmentPlanId || item._id || item.id || String(Math.random()),
      _id: item._id,
      // Product Info
      title: item.productName || item.title || 'Installment Product',
      description: item.description || '',
      imageUrl: rawImage,
      productImages: allImages,

      // Price Info
      totalAmount: item.price || 0,
      downPayment: item.downpayment || plan.downPayment || 0,
      monthlyPayment: plan.monthlyInstallment || 0,
      duration: plan.tenureMonths || 0,
      interestRate: plan.interestRatePercent || 0,

      // Meta
      city: item.city || '',
      category: item.category || '',
      status: item.status || 'active',

      // Detail Data
      paymentPlans: item.paymentPlans || [],
      specifications: specs,
      createdBy: (item.createdBy && item.createdBy.length > 0) ? item.createdBy[0] : null,

      originalItem: item
    };
  });
};

