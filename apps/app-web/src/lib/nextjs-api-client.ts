import axios, { AxiosInstance } from 'axios';

/**
 * API Client for Next.js API Routes
 * 
 * This client is specifically for calling Next.js API routes (same origin)
 * instead of the Strapi backend.
 */

// Create axios instance for Next.js API routes
function createNextApiClient(): AxiosInstance {
  return axios.create({
    baseURL: '/api', // Use relative URL for same-origin requests
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
}

export const nextApiClient = createNextApiClient();