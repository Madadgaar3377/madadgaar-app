import { api } from './api';

/**
 * Property API endpoints
 */

export interface Property {
  _id?: string;
  id?: string;
  type?: 'Project' | 'Individual';
  project?: {
    propertyId?: string;
    projectName?: string;
    city?: string;
    district?: string;
    tehsil?: string;
    area?: string;
    street?: string;
    locationGPS?: string;
    projectType?: string;
    developmentType?: string;
    infrastructureStatus?: string;
    projectStage?: string;
    expectedCompletionDate?: string;
    utilities?: {
      electricity?: boolean;
      water?: boolean;
      gas?: boolean;
      internet?: boolean;
      sewage?: boolean;
    };
    amenities?: {
      // Infrastructure & Utilities
      undergroundElectricity?: boolean;
      waterSupply?: boolean;
      sewerageSystem?: boolean;
      drainageSystem?: boolean;
      backupPower?: boolean;
      // Religious & Community
      mosque?: boolean;
      communityCenter?: boolean;
      // Education, Health & Commercial
      school?: boolean;
      medicalFacility?: boolean;
      commercialZone?: boolean;
      // Recreational & Outdoor
      parks?: boolean;
      playground?: boolean;
      garden?: boolean;
      swimmingPool?: boolean;
      clubhouse?: boolean;
      joggingTrack?: boolean;
      sportsCourts?: boolean;
      waterFeatures?: boolean;
      petPark?: boolean;
      // Residential Interior
      servantQuarters?: boolean;
      drawingRoom?: boolean;
      diningRoom?: boolean;
      studyRoom?: boolean;
      prayerRoom?: boolean;
      lounge?: boolean;
      storeRoom?: boolean;
      laundryRoom?: boolean;
      gym?: boolean;
      steamRoom?: boolean;
      // Building & Property Features
      parking?: boolean;
      balcony?: boolean;
      terrace?: boolean;
      elevator?: boolean;
      receptionArea?: boolean;
      meetingRoom?: boolean;
      publicTransportAccess?: boolean;
      commonAreaWifi?: boolean;
      // Security & Building Systems
      security?: boolean;
      cctv?: boolean;
      fireSafety?: boolean;
      airConditioning?: boolean;
      // Commercial / Miscellaneous
      brandingSpace?: boolean;
      retailShops?: boolean;
      loadingUnloadingArea?: boolean;
      cafeteria?: boolean;
      laundryService?: boolean;
      // Utilities (Extended)
      evCharging?: boolean;
      wasteManagement?: boolean;
    };
    description?: string;
    highlights?: string[];
    totalLandArea?: string;
    propertyTypesAvailable?: string[];
    totalUnits?: number;
    typicalUnitSizes?: string;
    nearbyLandmarks?: string;
    remarks?: string;
    transaction?: {
      type?: string;
      price?: number;
      priceRange?: string;
      advanceAmount?: number;
      monthlyRent?: number;
      contractDuration?: string;
      bookingAmount?: number;
      downPayment?: number;
      monthlyInstallment?: number;
      tenure?: string;
      totalPayable?: number;
      additionalInfo?: string;
    };
    images?: string[];
    contact?: {
      name?: string;
      email?: string;
      number?: string;
      whatsapp?: string;
      cnic?: string;
      city?: string;
      area?: string;
    };
  };
  individualProperty?: {
    propertyId?: string;
    title?: string;
    description?: string;
    propertyType?: string;
    areaUnit?: string;
    areaSize?: string;
    city?: string;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    kitchenType?: string;
    furnishingStatus?: string;
    floor?: number;
    totalFloors?: number;
    possessionStatus?: string;
    zoningType?: string;
    utilities?: {
      electricity?: boolean;
      water?: boolean;
      gas?: boolean;
      internet?: boolean;
    };
    amenities?: {
      // Infrastructure & Utilities
      undergroundElectricity?: boolean;
      waterSupply?: boolean;
      sewerageSystem?: boolean;
      drainageSystem?: boolean;
      backupPower?: boolean;
      // Religious & Community
      mosque?: boolean;
      communityCenter?: boolean;
      // Education, Health & Commercial
      school?: boolean;
      medicalFacility?: boolean;
      commercialZone?: boolean;
      // Recreational & Outdoor
      parks?: boolean;
      playground?: boolean;
      garden?: boolean;
      swimmingPool?: boolean;
      clubhouse?: boolean;
      joggingTrack?: boolean;
      sportsCourts?: boolean;
      waterFeatures?: boolean;
      petPark?: boolean;
      // Residential Interior
      servantQuarters?: boolean;
      drawingRoom?: boolean;
      diningRoom?: boolean;
      studyRoom?: boolean;
      prayerRoom?: boolean;
      lounge?: boolean;
      storeRoom?: boolean;
      laundryRoom?: boolean;
      gym?: boolean;
      steamRoom?: boolean;
      // Building & Property Features
      parking?: boolean;
      balcony?: boolean;
      terrace?: boolean;
      elevator?: boolean;
      receptionArea?: boolean;
      meetingRoom?: boolean;
      publicTransportAccess?: boolean;
      commonAreaWifi?: boolean;
      // Security & Building Systems
      security?: boolean;
      cctv?: boolean;
      fireSafety?: boolean;
      airConditioning?: boolean;
      // Commercial / Miscellaneous
      brandingSpace?: boolean;
      retailShops?: boolean;
      loadingUnloadingArea?: boolean;
      cafeteria?: boolean;
      laundryService?: boolean;
      // Utilities (Extended)
      evCharging?: boolean;
      wasteManagement?: boolean;
    };
    nearbyLandmarks?: string;
    transaction?: {
      type?: string;
      price?: number;
      priceRange?: string;
      advanceAmount?: number;
      monthlyRent?: number;
      contractDuration?: string;
      bookingAmount?: number;
      downPayment?: number;
      monthlyInstallment?: number;
      tenure?: string;
      totalPayable?: number;
      additionalInfo?: string;
    };
    images?: string[];
    contact?: {
      name?: string;
      email?: string;
      number?: string;
      whatsapp?: string;
      cnic?: string;
      city?: string;
      area?: string;
    };
  };
  // Legacy fields for backward compatibility
  purpose?: string;
  name?: string;
  duration?: string;
  typeOfProject?: string;
  plotSize?: string;
  plotStage?: string;
  possessionType?: string;
  otherDetails?: string;
  specificDetails?: string;
  typeOfProperty?: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  areaSize?: string;
  price?: number;
  readyForPossession?: string;
  advanceAmount?: string;
  noOfInstallment?: number;
  monthlyInstallment?: number;
  builtInYear?: number;
  flooring?: string;
  floors?: number;
  parkingSpace?: string;
  electricityBackup?: string;
  furnished?: string;
  view?: string;
  wasteDisposal?: string;
  bedRooms?: string;
  bathrooms?: string;
  kitchens?: string;
  storeRooms?: string;
  drawingRooms?: string;
  diningRooms?: string;
  studyRooms?: string;
  prayerRooms?: string;
  servantQuarters?: string;
  sittingRooms?: string;
  communityLawn?: string;
  medicalCentre?: string;
  dayCare?: string;
  communityPool?: string;
  kidsPlayArea?: string;
  mosque?: string;
  communityGym?: string;
  bbqArea?: string;
  communityCentre?: string;
  nearBySchools?: string;
  nearByHospitals?: string;
  nearByShoppingMalls?: string;
  nearByColleges?: string;
  nearByRestaurants?: string;
  nearByPublicTransport?: string;
  nearByUniversity?: string;
  adTitle?: string;
  adDescription?: string;
  images?: string[];
  fullName?: string;
  mobile?: string;
  anyMessage?: string;
  email?: string;
  commonForm?: {
    name?: string;
    email?: string;
    whatsApp?: string;
    cnic?: string;
    city?: string;
    area?: string;
    typeOfInquiry?: string[];
    _id?: string;
  };
  createBy?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface GetAllPropertiesResponse {
  success?: boolean;
  message?: string;
  properties?: Property[];
  data?: Property[];
  [key: string]: any;
}

/**
 * Get all properties
 * GET /getAllProperties
 * Handles Cloudflare challenge with POST fallback
 */
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    // Primary attempt: GET
    const response = await api.get<GetAllPropertiesResponse>('/getAllProperties', {
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
        const postResponse = await api.post('/getAllProperties', {}, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Madadgaar-Mobile-App/1.0',
          },
          responseType: 'text'
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

/**
 * Get single property by ID
 */
export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const all = await getAllProperties();
    const found = all.find(p => p._id === id || p.id === id);
    if (found) return found;
    return null;
  } catch (error) {
    return null;
  }
};

// Helper function to normalize image URLs
const normalizeImageUrl = (img: string | null | undefined): string | null => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }
  const BASE_IMAGE_URL = 'https://api.madadgaar.com.pk/';
  const cleanPath = img.replace(/^[\/\\]+/, '');
  return `${BASE_IMAGE_URL}${cleanPath}`;
};

// Helper function to normalize images array
const normalizeImages = (images: any): string[] => {
  if (!images || !Array.isArray(images)) return [];
  return images.map(normalizeImageUrl).filter((img): img is string => img !== null);
};

// Helper function to normalize response data
const normalizeResponse = (data: any): Property[] => {
  let properties: any[] = [];

  if (Array.isArray(data)) {
    properties = data;
  } else if (data?.properties && Array.isArray(data.properties)) {
    properties = data.properties;
  } else if (data?.data && Array.isArray(data.data)) {
    properties = data.data;
  } else if (data && typeof data === 'object') {
    // Try scanning keys
    const arrayKeys = Object.keys(data).filter(k => Array.isArray(data[k]));
    if (arrayKeys.length > 0) properties = data[arrayKeys[0]];
  }

  if (!Array.isArray(properties)) return [];

  return properties.map((item: any) => {
    // Handle new schema with type: Project or Individual
    let normalizedImages: string[] = [];
    
    if (item.type === 'Project' && item.project) {
      // Normalize project images
      normalizedImages = normalizeImages(item.project.images);
    } else if (item.type === 'Individual' && item.individualProperty) {
      // Normalize individual property images
      normalizedImages = normalizeImages(item.individualProperty.images);
    } else {
      // Legacy: normalize images from root level
      normalizedImages = normalizeImages(item.images);
    }

    return {
      id: item._id || item.id || String(Math.random()),
      _id: item._id,
      ...item,
      images: normalizedImages,
      imageUrl: normalizedImages.length > 0 ? normalizedImages[0] : undefined,
    };
  });
};

// Helper functions to extract property data based on type
export const getPropertyTitle = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.projectName || property.adTitle || 'Project';
  } else if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.title || property.adTitle || 'Property';
  }
  // Legacy fallback
  return property.adTitle || property.name || property.typeOfProperty || 'Property';
};

export const getPropertyLocation = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    const parts = [
      property.project.street,
      property.project.area,
      property.project.city,
      property.project.district,
    ].filter(Boolean);
    return parts.join(', ') || property.project.locationGPS || '';
  } else if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.location || 
           property.individualProperty.city || 
           property.address || '';
  }
  // Legacy fallback
  return property.address || '';
};

export const getPropertyPrice = (property: Property): number | null => {
  if (property.type === 'Project' && property.project?.transaction) {
    return property.project.transaction.price || 
           property.project.transaction.bookingAmount || 
           property.project.transaction.downPayment || 
           null;
  } else if (property.type === 'Individual' && property.individualProperty?.transaction) {
    return property.individualProperty.transaction.price || 
           property.individualProperty.transaction.advanceAmount || 
           property.individualProperty.transaction.bookingAmount || 
           null;
  }
  // Legacy fallback
  return property.price || null;
};

export const getPropertyPriceRange = (property: Property): string | null => {
  if (property.type === 'Project' && property.project?.transaction?.priceRange) {
    return property.project.transaction.priceRange;
  }
  return null;
};

export const getPropertyMonthlyRent = (property: Property): number | null => {
  if (property.type === 'Project' && property.project?.transaction) {
    return property.project.transaction.monthlyRent || 
           property.project.transaction.monthlyInstallment || 
           null;
  } else if (property.type === 'Individual' && property.individualProperty?.transaction) {
    return property.individualProperty.transaction.monthlyRent || 
           property.individualProperty.transaction.monthlyInstallment || 
           null;
  }
  // Legacy fallback
  return property.monthlyInstallment || property.monthlyRent || null;
};

export const getPropertyAreaSize = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.totalLandArea || property.project.typicalUnitSizes || '';
  } else if (property.type === 'Individual' && property.individualProperty) {
    const size = property.individualProperty.areaSize;
    const unit = property.individualProperty.areaUnit;
    return size && unit ? `${size} ${unit}` : size || '';
  }
  // Legacy fallback
  return property.areaSize || '';
};

export const getPropertyBedrooms = (property: Property): number | null => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.bedrooms || null;
  }
  // Legacy fallback
  return property.bedRooms ? parseInt(property.bedRooms) : null;
};

export const getPropertyBathrooms = (property: Property): number | null => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.bathrooms || null;
  }
  // Legacy fallback
  return property.bathrooms ? parseInt(property.bathrooms) : null;
};

export const getPropertyImages = (property: Property): string[] => {
  if (property.type === 'Project' && property.project?.images) {
    return property.project.images;
  } else if (property.type === 'Individual' && property.individualProperty?.images) {
    return property.individualProperty.images;
  }
  // Legacy fallback
  return property.images || [];
};

export const getPropertyDescription = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.description || '';
  } else if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.description || '';
  }
  // Legacy fallback
  return property.adDescription || property.description || '';
};

export const getPropertyHighlights = (property: Property): string[] => {
  if (property.type === 'Project' && property.project?.highlights) {
    return property.project.highlights.filter((h: string) => h && h.trim());
  }
  return [];
};

export const getPropertyUtilities = (property: Property): {
  electricity?: boolean;
  water?: boolean;
  gas?: boolean;
  internet?: boolean;
  sewage?: boolean;
} | null => {
  if (property.type === 'Project' && property.project?.utilities) {
    return property.project.utilities;
  } else if (property.type === 'Individual' && property.individualProperty?.utilities) {
    return property.individualProperty.utilities;
  }
  return null;
};

export const getPropertyAmenities = (property: Property): {
  // Infrastructure & Utilities
  undergroundElectricity?: boolean;
  waterSupply?: boolean;
  sewerageSystem?: boolean;
  drainageSystem?: boolean;
  backupPower?: boolean;
  // Religious & Community
  mosque?: boolean;
  communityCenter?: boolean;
  // Education, Health & Commercial
  school?: boolean;
  medicalFacility?: boolean;
  commercialZone?: boolean;
  // Recreational & Outdoor
  parks?: boolean;
  playground?: boolean;
  garden?: boolean;
  swimmingPool?: boolean;
  clubhouse?: boolean;
  joggingTrack?: boolean;
  sportsCourts?: boolean;
  waterFeatures?: boolean;
  petPark?: boolean;
  // Residential Interior
  servantQuarters?: boolean;
  drawingRoom?: boolean;
  diningRoom?: boolean;
  studyRoom?: boolean;
  prayerRoom?: boolean;
  lounge?: boolean;
  storeRoom?: boolean;
  laundryRoom?: boolean;
  gym?: boolean;
  steamRoom?: boolean;
  // Building & Property Features
  parking?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  elevator?: boolean;
  receptionArea?: boolean;
  meetingRoom?: boolean;
  publicTransportAccess?: boolean;
  commonAreaWifi?: boolean;
  // Security & Building Systems
  security?: boolean;
  cctv?: boolean;
  fireSafety?: boolean;
  airConditioning?: boolean;
  // Commercial / Miscellaneous
  brandingSpace?: boolean;
  retailShops?: boolean;
  loadingUnloadingArea?: boolean;
  cafeteria?: boolean;
  laundryService?: boolean;
  // Utilities (Extended)
  evCharging?: boolean;
  wasteManagement?: boolean;
} | null => {
  if (property.type === 'Project' && property.project?.amenities) {
    return property.project.amenities;
  } else if (property.type === 'Individual' && property.individualProperty?.amenities) {
    return property.individualProperty.amenities;
  }
  return null;
};

export const getPropertyTransaction = (property: Property): {
  type?: string;
  price?: number;
  advanceAmount?: number;
  monthlyRent?: number;
  contractDuration?: string;
  bookingAmount?: number;
  downPayment?: number;
  monthlyInstallment?: number;
  tenure?: string;
  totalPayable?: number;
  additionalInfo?: string;
} | null => {
  if (property.type === 'Project' && property.project?.transaction) {
    return property.project.transaction;
  } else if (property.type === 'Individual' && property.individualProperty?.transaction) {
    return property.individualProperty.transaction;
  }
  return null;
};

export const getPropertyContact = (property: Property): {
  name?: string;
  email?: string;
  number?: string;
  whatsapp?: string;
  cnic?: string;
  city?: string;
  area?: string;
} | null => {
  if (property.type === 'Project' && property.project?.contact) {
    return property.project.contact;
  } else if (property.type === 'Individual' && property.individualProperty?.contact) {
    return property.individualProperty.contact;
  }
  // Legacy fallback
  if (property.commonForm) {
    return {
      name: property.commonForm.name,
      email: property.commonForm.email,
      number: property.mobile || property.commonForm.whatsApp,
      whatsapp: property.commonForm.whatsApp,
      cnic: property.commonForm.cnic,
      city: property.commonForm.city,
      area: property.commonForm.area,
    };
  }
  return null;
};

export const getPropertyNearbyLandmarks = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.nearbyLandmarks || '';
  } else if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.nearbyLandmarks || '';
  }
  return '';
};

export const getPropertyProjectType = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.projectType || '';
  } else if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.propertyType || '';
  }
  // Legacy fallback
  return property.typeOfProperty || '';
};

export const getPropertyFurnishingStatus = (property: Property): string => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.furnishingStatus || '';
  }
  // Legacy fallback
  return property.furnished || '';
};

export const getPropertyPossessionStatus = (property: Property): string => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.possessionStatus || '';
  }
  // Legacy fallback
  return property.readyForPossession || '';
};

export const getPropertyFloor = (property: Property): number | null => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.floor || null;
  }
  // Legacy fallback
  return property.floors || null;
};

export const getPropertyTotalFloors = (property: Property): number | null => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.totalFloors || null;
  }
  // Legacy fallback
  return property.floors || null;
};

export const getPropertyKitchenType = (property: Property): string => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.kitchenType || '';
  }
  return '';
};

export const getPropertyZoningType = (property: Property): string => {
  if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.zoningType || '';
  }
  return '';
};

export const getPropertyTotalUnits = (property: Property): number | null => {
  if (property.type === 'Project' && property.project) {
    return property.project.totalUnits || null;
  }
  return null;
};

export const getPropertyTotalLandArea = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.totalLandArea || '';
  }
  return '';
};

export const getPropertyTypicalUnitSizes = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.typicalUnitSizes || '';
  }
  return '';
};

export const getPropertyProjectStage = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.projectStage || '';
  }
  return '';
};

export const getPropertyExpectedCompletionDate = (property: Property): string => {
  if (property.type === 'Project' && property.project) {
    return property.project.expectedCompletionDate || '';
  }
  return '';
};

/**
 * Get propertyId from the schema
 * For Project type: returns project.propertyId
 * For Individual type: returns individualProperty.propertyId
 * Falls back to _id or id if propertyId is not available
 */
export const getPropertyId = (property: Property): string | null => {
  if (property.type === 'Project' && property.project) {
    return property.project.propertyId || property._id || property.id || null;
  } else if (property.type === 'Individual' && property.individualProperty) {
    return property.individualProperty.propertyId || property._id || property.id || null;
  }
  // Legacy fallback
  return property._id || property.id || null;
};

