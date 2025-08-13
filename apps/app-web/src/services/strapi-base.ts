/**
 * Strapi Data Transformers
 *
 * Centralized transformers for converting between Strapi's data format and our application's format
 * Following DRY principle to avoid repetition across services
 *
 * IMPORTANT: Strapi v5 uses 'documentId' as the primary identifier for API operations,
 * not 'id'. The 'id' field is still present but 'documentId' should be used for all
 * API calls like PUT, DELETE, etc.
 */

import { IUserPublic } from '@app/shared-types';

// Strapi V5 response formats
export interface StrapiSingleResponse<T> {
  data: T & {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
  meta?: Record<string, unknown>;
}

export interface StrapiListResponse<T> {
  data: Array<
    T & {
      id: number;
      documentId: string;
      createdAt: string;
      updatedAt: string;
      publishedAt?: string;
    }
  >;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Strapi media format
export interface StrapiMedia {
  id: number;
  documentId?: string;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

// Strapi user structure
export interface StrapiUser {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImage?: StrapiMedia | string | null;
  referralCode?: string | null;
  status?: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  provider?: string;
  role?: {
    id: number;
    name: string;
    type: string;
  };
}

// Helper to extract image URL from Strapi media field
function extractProfileImageUrl(profileImage: StrapiMedia | string | null | undefined): string | null {
  if (!profileImage) return null;
  
  // If it's already a string URL
  if (typeof profileImage === 'string') {
    // Return null for empty strings to avoid the Next.js Image component error
    return profileImage.trim() === '' ? null : getStrapiMediaUrl(profileImage);
  }
  
  // If it's a media object
  if (typeof profileImage === 'object' && 'url' in profileImage) {
    return getStrapiMediaUrl(profileImage.url);
  }
  
  return null;
}

// Transform Strapi user to our IUserPublic format
// IMPORTANT: Strapi 5 uses documentId for all API operations
export function transformStrapiUser(strapiUser: StrapiUser): IUserPublic {
  return {
    documentId: strapiUser.documentId || strapiUser.id.toString(), // Strapi 5 uses documentId
    email: strapiUser.email,
    firstName: strapiUser.firstName || strapiUser.username || '',
    lastName: strapiUser.lastName || '',
    phoneNumber: strapiUser.phoneNumber || null,
    role: strapiUser.role?.type?.toUpperCase() || 'USER',
    status:
      strapiUser.status ||
      (strapiUser.confirmed ? 'ACTIVE' : 'PENDING_VERIFICATION'),
    createdAt: new Date(strapiUser.createdAt),
    profileImage: extractProfileImageUrl(strapiUser.profileImage),
    referralCode: strapiUser.referralCode || null,
    emailVerified: strapiUser.confirmed,
    emailVerifiedAt: strapiUser.confirmed
      ? new Date(strapiUser.createdAt)
      : null,
  };
}

// Generic transformer for Strapi single responses
export function transformStrapiSingleResponse<T, R>(
  response: StrapiSingleResponse<T>,
  transformer: (data: T & { id: number; documentId: string }) => R
): R {
  return transformer(response.data);
}

// Generic transformer for Strapi list responses
export function transformStrapiListResponse<T, R>(
  response: StrapiListResponse<T>,
  transformer: (data: T & { id: number; documentId: string }) => R
): { data: R[]; meta?: Record<string, unknown> } {
  return {
    data: response.data.map((data) => transformer(data)),
    meta: response.meta,
  };
}

// Helper to extract data from Strapi response (handles both v4 and v5 formats)
export function extractStrapiData<T>(response: unknown): T {
  // If response has a data property, extract it
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  // Otherwise return as is (for endpoints that don't wrap in data)
  return response as T;
}

// Helper to construct full URL for Strapi media
export function getStrapiMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Otherwise prepend the Strapi URL
  const strapiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  return `${strapiUrl}${url}`;
}

// Transform upload response
export interface StrapiUploadFile {
  id: number;
  documentId?: string;
  name: string;
  url: string;
  formats?: Record<string, unknown>;
  width?: number;
  height?: number;
  size: number;
  mime: string;
}

export function transformStrapiUploadResponse(file: StrapiUploadFile): {
  url: string;
  id: number;
} {
  return {
    id: file.id,
    url: getStrapiMediaUrl(file.url) || file.url,
  };
}
