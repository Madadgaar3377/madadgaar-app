import { api } from './api';
import * as SecureStore from 'expo-secure-store';

/**
 * Banner/Offer API endpoints
 */

export interface OfferBanner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  [key: string]: any; // Allow for additional properties
}

export interface GetAllOffersResponse {
  success?: boolean;
  message?: string;
  offers?: OfferBanner[];
  banners?: OfferBanner[];
  data?: OfferBanner[];
  error?: string;
}

/**
 * Get all offers/banners
 * GET /getAllOffers
 * The backend might expect certain parameters or structure
 * Note: API is behind Cloudflare, so we need proper headers
 */
export const getAllOffers = async (): Promise<OfferBanner[]> => {
  try {
    const token = await SecureStore.getItemAsync('authToken');

    // Try 1: GET request (primary method) with proper headers to bypass Cloudflare
    try {
      const response = await api.get<GetAllOffersResponse>('/getAllOffers', {
        params: {},
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Madadgaar-Mobile-App/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const responseString = typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);

      if (responseString.includes('<!DOCTYPE html>') ||
        responseString.includes('Just a moment') ||
        responseString.includes('Cloudflare') ||
        responseString.includes('<html')) {
        throw new Error('Cloudflare challenge detected');
      }

      let banners =
        response.data.offers ||
        response.data.banners ||
        response.data.data ||
        [];

      if (Array.isArray(response.data)) {
        banners = response.data;
      }

      if (!Array.isArray(banners) && response.data && typeof response.data === 'object') {
        const arrayKeys = Object.keys(response.data).filter(key => Array.isArray((response.data as any)[key]));
        if (arrayKeys.length > 0) {
          banners = (response.data as any)[arrayKeys[0]];
        }
      }

      if (!Array.isArray(banners)) {
        return [];
      }

      return banners
        .filter((banner: any) => banner && (banner.imageUrl || banner.image || banner.image_url))
        .map((banner: any) => ({
          id: banner.id || banner._id || String(Math.random()),
          title: banner.title || banner.name || 'Special Offer',
          description: banner.description || banner.desc || '',
          imageUrl: banner.imageUrl || banner.image || banner.image_url || '',
          link: banner.link || banner.url || banner.redirectUrl || '',
        }));
    } catch (error1: any) {
      const isHtmlResponse =
        error1.response?.data &&
        (typeof error1.response.data === 'string'
          ? error1.response.data.includes('<!DOCTYPE html>') || error1.response.data.includes('Just a moment')
          : JSON.stringify(error1.response.data).includes('<!DOCTYPE html>'));

      if (error1.response?.status === 400 || isHtmlResponse || error1.message === 'Cloudflare challenge detected') {
        try {
          const response = await api.post('/getAllOffers', {}, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'Madadgaar-Mobile-App/1.0',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            responseType: 'text',
          });

          let responseData: any;
          try {
            responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          } catch (parseError) {
            const responseText = typeof response.data === 'string' ? response.data : String(response.data);
            if (responseText.includes('<!DOCTYPE html>') || responseText.includes('Just a moment') || responseText.includes('Cloudflare')) {
              return [];
            }
            throw parseError;
          }

          const responseText = JSON.stringify(responseData);
          if (responseText.includes('<!DOCTYPE html>') || responseText.includes('Just a moment')) {
            return [];
          }

          const typedResponse = { data: responseData } as { data: GetAllOffersResponse };

          let banners =
            typedResponse.data.offers ||
            typedResponse.data.banners ||
            typedResponse.data.data ||
            [];

          if (Array.isArray(typedResponse.data)) {
            banners = typedResponse.data;
          }

          if (!Array.isArray(banners) && typedResponse.data && typeof typedResponse.data === 'object') {
            const arrayKeys = Object.keys(typedResponse.data).filter(key => Array.isArray((typedResponse.data as any)[key]));
            if (arrayKeys.length > 0) {
              banners = (typedResponse.data as any)[arrayKeys[0]];
            }
          }

          if (!Array.isArray(banners)) {
            return [];
          }

          return banners
            .filter((banner: any) => banner && (banner.imageUrl || banner.image || banner.image_url))
            .map((banner: any) => ({
              id: banner.id || banner._id || String(Math.random()),
              title: banner.title || banner.name || 'Special Offer',
              description: banner.description || banner.desc || '',
              imageUrl: banner.imageUrl || banner.image || banner.image_url || '',
              link: banner.link || banner.url || banner.redirectUrl || '',
            }));
        } catch (error2: any) {
          return [];
        }
      }
      throw error1;
    }
  } catch (error: any) {
    return [];
  }
};

