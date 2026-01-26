import * as SecureStore from 'expo-secure-store';

/**
 * Image upload API
 */

export interface UploadImageResponse {
  success?: boolean;
  message?: string;
  imageUrl?: string;
  url?: string;
  data?: {
    imageUrl?: string;
    url?: string;
  };
  error?: string;
}

/**
 * Upload profile image
 * Step 1: POST to /upload-image
 * Step 2: GET the returned URL to get the profile image
 * @param imageUri - Local file URI from image picker
 */
export const uploadImage = async (imageUri: string): Promise<UploadImageResponse> => {
  // Extract filename from URI
  let filename = 'image.jpg';
  if (imageUri.includes('/')) {
    const parts = imageUri.split('/');
    filename = parts[parts.length - 1] || 'image.jpg';
    filename = filename.split('?')[0];
    if (!filename.includes('.')) {
      filename = 'image.jpg';
    }
  }

  // Determine MIME type from extension
  let mimeType = 'image/jpeg';
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'png') {
    mimeType = 'image/png';
  } else if (ext === 'gif') {
    mimeType = 'image/gif';
  } else if (ext === 'webp') {
    mimeType = 'image/webp';
  }

  try {
    // Normalize URI for React Native (handle file:// vs file:/)
    let normalizedUri = imageUri;
    if (imageUri.startsWith('file:/') && !imageUri.startsWith('file:///')) {
      normalizedUri = imageUri.replace('file:/', 'file:///');
    }

    // Create FormData for React Native
    const formData = new FormData();
    formData.append('image', {
      uri: normalizedUri,
      type: mimeType,
      name: filename,
    } as any);

    // Get Bearer token for fetch request
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Step 1: POST request to upload image using fetch (better for FormData in React Native)
    const uploadUrl = 'https://api.madadgaar.com.pk/api/upload-image';
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it with boundary automatically
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const responseData: UploadImageResponse = await response.json();

    // Extract image URL from response
    const imageUrl = responseData.imageUrl || responseData.url || responseData.data?.imageUrl || responseData.data?.url;

    if (!imageUrl) {
      throw new Error(responseData.message || 'Upload successful but no image URL returned');
    }
    // Step 2: GET request to the URL to get the profile image
    try {
      const imageResponse = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
      });

      if (imageResponse.ok) {
      } else {
      }
    } catch (getError: any) {
    }

    // Return the URL to use for profile
    return {
      success: true,
      imageUrl: imageUrl,
      url: imageUrl,
      message: responseData.message || 'Image uploaded successfully',
    };
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
      isNetworkError: !error.response,
    };
    throw error;
  }
};
