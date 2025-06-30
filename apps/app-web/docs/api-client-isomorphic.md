# API Client Documentation

## Overview

The GrabHealth app provides a comprehensive API client system that works seamlessly across different Next.js environments. The main API client (`api-client.ts`) is designed to work in both server-side (Server Components, Server Actions) and client-side (Client Components) environments.

## API Client Options

The app provides three ways to make API calls:

1. **Unified API Client** (`apiClient`) - Works in both client and server environments
2. **Server API Wrapper** (`serverApi*`) - Server-side only with structured responses 
3. **API Service Layer** (`api`) - High-level, domain-specific interface

## Key Features

1. **Automatic Environment Detection**: Detects whether code is running on server or client
2. **Unified API**: Same methods work in both environments
3. **Automatic Auth Handling**: 
   - Server-side: Uses Next.js `cookies()` from `next/headers`
   - Client-side: Uses `document.cookie` from browser
4. **Built-in Error Handling**: Custom `ApiError` class with detailed error information
5. **Request/Response Interceptors**: For logging and error handling
6. **FormData Support**: Automatic handling for file uploads
7. **30-second Timeout**: Configurable request timeout

## Table of Contents

- [Usage Examples](#usage-examples)
  - [Server Components](#server-components)
  - [Client Components](#client-components)
  - [Server Actions](#server-actions)
  - [API Route Handlers](#api-route-handlers)
  - [Custom Auth Token](#custom-auth-token)
- [Migration Guide](#migration-guide)
- [API Reference](#api-reference)
- [Benefits](#benefits)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)

## Usage Examples

### Server Components

Server Components run on the server during SSR/SSG. The isomorphic client automatically uses Next.js cookies for authentication.

```tsx
// app/products/page.tsx
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';
import { IProduct } from '@app/shared-types';

export default async function ProductsPage() {
  try {
    // No need to manually handle cookies or auth headers
    const response = await apiClientIsomorphic.get<{ data: IProduct[] }>('/products?populate=*');
    
    return (
      <div>
        <h1>Products</h1>
        {response.data.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return <div>Error loading products</div>;
  }
}
```

### Client Components

Client Components run in the browser. The isomorphic client automatically uses browser cookies for authentication.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';
import { IUserPublic } from '@app/shared-types';

export function UserProfile() {
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Same API call works in client components
        const response = await apiClientIsomorphic.get<{ user: IUserPublic }>('/users/me');
        setUser(response.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Server Actions

Server Actions are functions that run on the server and can be called from client components.

```tsx
'use server';

import { apiClientIsomorphic } from '@/services/api-client-isomorphic';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      bio: formData.get('bio') as string,
    };

    // Auth is handled automatically in server actions
    const response = await apiClientIsomorphic.put('/users/me', data);
    
    // Revalidate the profile page
    revalidatePath('/profile');
    
    return { success: true, user: response };
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return { success: false, error: error.message || 'Failed to update profile' };
  }
}

// File upload example
export async function uploadAvatar(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Create FormData for upload
    const uploadData = new FormData();
    uploadData.append('files', file);

    // Upload file to Strapi
    const uploadResponse = await apiClientIsomorphic.post('/upload', uploadData);
    const imageUrl = uploadResponse[0]?.url;

    if (!imageUrl) {
      return { success: false, error: 'Upload failed' };
    }

    // Update user profile with new avatar
    await apiClientIsomorphic.put('/users/me', { avatar: imageUrl });
    
    revalidatePath('/profile');
    return { success: true, imageUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### API Route Handlers

The isomorphic client also works in Next.js API route handlers.

```tsx
// app/api/products/featured/route.ts
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch featured products from Strapi
    const products = await apiClientIsomorphic.get('/products?filters[featured][$eq]=true&populate=*');
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create a new product
    const product = await apiClientIsomorphic.post('/products', body);
    
    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: error.status || 500 }
    );
  }
}
```

### Custom Auth Token

Sometimes you may need to use a specific token (e.g., from a third-party service or testing).

```tsx
// Using a custom token
export async function customAuthExample() {
  // Get token from somewhere else
  const customToken = await getTokenFromThirdParty();
  
  // Use the withAuthHeader helper
  const config = apiClientIsomorphic.withAuthHeader(customToken);
  const response = await apiClientIsomorphic.get('/protected-endpoint', config);
  
  return response;
}

// Or manually in config
export async function manualAuthExample() {
  const response = await apiClientIsomorphic.get('/protected-endpoint', {
    headers: {
      Authorization: 'Bearer custom-token-here'
    }
  });
  
  return response;
}
```

## Migration Guide

### Step 1: Import the isomorphic client

Replace:
```tsx
import { apiClient } from '@/services/api-client';
```

With:
```tsx
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';
```

Or use the alias if you want minimal code changes:
```tsx
import { apiClientIsomorphic as apiClient } from '@/services/api-client-isomorphic';
```

### Step 2: Remove manual auth handling

The isomorphic client handles auth automatically, so you can remove manual auth header additions:

```tsx
// Before (in server components)
const cookieStore = await cookies();
const token = cookieStore.get('accessToken');
const response = await fetch(`${API_URL}/api/users/me`, {
  headers: {
    Authorization: `Bearer ${token.value}`,
    'Content-Type': 'application/json',
  },
});
const data = await response.json();

// After
const data = await apiClientIsomorphic.get('/users/me');
```

### Step 3: Update error handling

The isomorphic client provides consistent error handling:

```tsx
// Before
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error('Failed');
  }
  const data = await response.json();
} catch (error) {
  console.error(error);
}

// After
try {
  const data = await apiClientIsomorphic.get('/endpoint');
} catch (error: any) {
  console.error(error.message); // Structured error message
  console.error(error.status);  // HTTP status code
  console.error(error.details); // Additional error details
}
```

## API Reference

### Methods

All methods return the response data directly (not wrapped in a Response object):

```typescript
// GET request
get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>

// POST request
post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>

// PUT request
put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>

// DELETE request
delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>

// PATCH request
patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>

// Helper for custom auth
withAuthHeader(token: string, config?: AxiosRequestConfig): AxiosRequestConfig
```

### Configuration

The client uses these environment variables:
- `NEXT_PUBLIC_API_URL`: Base URL for the API (defaults to `http://localhost:1337`)

## Benefits

1. **Simplified Code**: No need to handle server/client auth differently
2. **Type Safety**: Full TypeScript support with generics
3. **Consistent Error Handling**: Same error format across all environments
4. **Automatic Auth**: No need to manually add auth headers
5. **FormData Support**: Automatically handles file uploads
6. **Interceptors**: Request/response interceptors for logging and error handling
7. **Timeout Handling**: 30-second timeout by default

## Common Patterns

### Fetching with Query Parameters

```tsx
// Using URLSearchParams
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  sort: 'createdAt:desc'
});
const products = await apiClientIsomorphic.get(`/products?${params.toString()}`);

// Or build manually
const products = await apiClientIsomorphic.get('/products?page=1&limit=10&sort=createdAt:desc');
```

### Strapi-specific Queries

```tsx
// Populate relations
const product = await apiClientIsomorphic.get('/products/1?populate=*');

// Filter
const activeProducts = await apiClientIsomorphic.get(
  '/products?filters[status][$eq]=active&populate=category'
);

// Complex filters
const params = new URLSearchParams();
params.append('filters[price][$gte]', '100');
params.append('filters[price][$lte]', '500');
params.append('filters[category][name][$eq]', 'Electronics');
const products = await apiClientIsomorphic.get(`/products?${params.toString()}`);
```

### Handling Pagination

```tsx
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

async function fetchAllProducts() {
  let page = 1;
  let hasMore = true;
  const allProducts = [];

  while (hasMore) {
    const response = await apiClientIsomorphic.get<PaginatedResponse<IProduct>>(
      `/products?pagination[page]=${page}&pagination[pageSize]=100`
    );
    
    allProducts.push(...response.data);
    hasMore = page < response.meta.pagination.pageCount;
    page++;
  }

  return allProducts;
}
```

## Error Handling

The isomorphic client provides structured error handling:

```tsx
try {
  const data = await apiClientIsomorphic.get('/protected-resource');
} catch (error: any) {
  // Error structure
  console.error({
    message: error.message,     // Human-readable error message
    status: error.status,       // HTTP status code (e.g., 404, 500)
    code: error.code,          // Error code (e.g., 'NETWORK_ERROR', 'BadRequestError')
    details: error.details,    // Additional error details from server
  });

  // Handle specific errors
  if (error.status === 401) {
    // Redirect to login
    redirect('/auth/login');
  } else if (error.status === 404) {
    // Resource not found
    notFound();
  } else {
    // Generic error handling
    throw error;
  }
}
```

### Network Errors

```tsx
try {
  const data = await apiClientIsomorphic.get('/endpoint');
} catch (error: any) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
    console.error('Network error - check your connection');
  }
}
```

## Notes

- The client automatically handles FormData for file uploads (removes Content-Type header)
- Strapi error formats are properly parsed and normalized
- Network errors and timeouts are handled consistently
- The base URL is configured from `NEXT_PUBLIC_API_URL` environment variable
- Auth tokens are automatically refreshed from cookies on each request
- Server-side dynamic import of `next/headers` prevents client-side import errors