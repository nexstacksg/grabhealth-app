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
  - [1. Unified API Client](#1-unified-api-client)
  - [2. Server API Wrapper](#2-server-api-wrapper)
  - [3. API Service Layer](#3-api-service-layer)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Common Patterns](#common-patterns)
- [API Reference](#api-reference)
- [File Structure](#file-structure)

## Usage Examples

### 1. Unified API Client

The main API client (`/lib/api-client.ts`) works in both client and server environments.

#### Server Components

```tsx
// app/products/page.tsx
import { apiClient } from '@/lib/api-client';
import { IProduct } from '@app/shared-types';

export default async function ProductsPage() {
  try {
    // Auth headers are automatically added from cookies
    const response = await apiClient.get<{ data: IProduct[] }>('/products?populate=*');
    
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

#### Client Components

```tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { IUser } from '@app/shared-types';

export function UserProfile() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Same API call works in client components
        const response = await apiClient.get<IUser>('/users/me?populate=*');
        setUser(response);
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

#### Server Actions

```tsx
'use server';

import { apiClient } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(userId: string, formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
    };

    // Auth is handled automatically
    const response = await apiClient.put(`/users/${userId}`, { data });
    
    revalidatePath('/profile');
    return { success: true, user: response };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: error.message };
  }
}
```

### 2. Server API Wrapper

The server API wrapper (`/lib/server-api.ts`) provides structured responses for server-side usage.

```tsx
import { serverApiGet, serverApiPost, serverApiPut } from '@/lib/server-api';

// Returns { success: boolean, data?: T, error?: string }
const result = await serverApiGet('/products?populate=*');

if (result.success) {
  console.log(result.data); // Products array
} else {
  console.error(result.error); // Error message
}

// POST with Strapi data format
const orderResult = await serverApiPost('/orders', {
  data: {
    items: [...],
    total: 100,
    user: userId
  }
});

// PUT to update
const updateResult = await serverApiPut(`/users/${userId}`, {
  data: { name: 'New Name' }
});
```

### 3. API Service Layer

The API service layer (`/services/api.service.ts`) provides high-level, domain-specific methods.

```tsx
import { api } from '@/services/api.service';

// Get current user with all relations
const user = await api.auth.getCurrentUser();

// Update user profile  
const updated = await api.auth.updateUser(userId, {
  name: 'New Name',
  email: 'new@email.com'
});

// Upload files
const files = [file1, file2];
const uploaded = await api.upload.uploadFiles(files);

```

## Authentication

Authentication is handled automatically via httpOnly cookies:

- `accessToken`: JWT token (1 day expiry)
- `refreshToken`: For token renewal (7 days expiry)  
- `userRole`: Cached user role

### Server-side Auth Utilities

```tsx
import { getServerUser, isServerAuthenticated } from '@/lib/auth-utils-server';

// Check if user is authenticated
const isAuth = await isServerAuthenticated();

// Get current user
const user = await getServerUser();

// Set auth cookies (after login)
import { setAuthCookies } from '@/lib/auth-utils-server';
await setAuthCookies({
  jwt: response.jwt,
  user: response.user
});

// Clear auth cookies (logout)
import { clearAuthCookies } from '@/lib/auth-utils-server';
await clearAuthCookies();
```

## Error Handling

The API client provides structured error handling with the `ApiError` class:

```tsx
import { ApiError } from '@/lib/api-client';
import { useApiErrorHandler } from '@/hooks/use-api-error-handler';

// In try-catch blocks
try {
  const data = await apiClient.get('/protected-route');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);   // HTTP status code
    console.log(error.message);  // Error message
    console.log(error.code);     // Error code
    console.log(error.details);  // Additional details
  }
}

// In React components (handles 401 automatically)
const { handleApiError } = useApiErrorHandler();

try {
  const data = await apiClient.get('/products');
} catch (error) {
  handleApiError(error); // Redirects to login on 401
}
```

## Common Patterns

### Strapi Query Parameters

```tsx
// Populate relations
const user = await apiClient.get('/users/me?populate=upline');
const userWithAll = await apiClient.get('/users/me?populate=*');

// Nested relations
const order = await apiClient.get('/orders/1?populate[items][populate]=product');

// Filtering
const activeProducts = await apiClient.get(
  '/products?filters[status][$eq]=active&populate=category'
);

// Pagination
const products = await apiClient.get(
  '/products?pagination[page]=1&pagination[pageSize]=10'
);

// Sorting
const sortedProducts = await apiClient.get(
  '/products?sort=createdAt:desc'
);
```

### Query String Builder

```tsx
import { buildQueryString } from '@/lib/api-client';

const query = buildQueryString({
  filters: {
    category: { name: 'Health' },
    price: { $gte: 10, $lte: 100 }
  },
  sort: ['createdAt:desc'],
  pagination: { page: 1, pageSize: 20 },
  populate: ['category', 'images']
});

const products = await apiClient.get(`/products?${query}`);
```

### File Uploads

```tsx
// Simple file upload
const formData = new FormData();
formData.append('files', file);
const uploaded = await apiClient.post('/upload', formData);

// Upload with Strapi relations
const formData = new FormData();
formData.append('files', file);
formData.append('ref', 'api::product.product');
formData.append('refId', productId);
formData.append('field', 'images');

const result = await apiClient.post('/upload', formData);
```

## API Reference

### Unified API Client Methods

```typescript
// GET request
apiClient.get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>

// POST request
apiClient.post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T>

// PUT request
apiClient.put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T>

// DELETE request
apiClient.delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>

// PATCH request
apiClient.patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T>
```

### Server API Wrapper Methods

```typescript
// All methods return { success: boolean, data?: T, error?: string }
serverApiGet<T>(endpoint: string): Promise<ApiResponse<T>>
serverApiPost<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
serverApiPut<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
serverApiDelete<T>(endpoint: string): Promise<ApiResponse<T>>
serverApiPatch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
```

### API Service Layer Methods

```typescript
// Authentication
api.auth.getCurrentUser(): Promise<IUser>
api.auth.updateUser(userId: string, data: Partial<IUser>): Promise<IUser>

// File Upload
api.upload.uploadFiles(files: File[]): Promise<UploadResponse[]>
```

### Configuration

The API clients use these environment variables:
- `NEXT_PUBLIC_API_URL`: Base URL for the API (defaults to `http://localhost:1337`)

## File Structure

```
app-web/
├── lib/
│   ├── api-client.ts           # Unified API client (axios-based)
│   ├── server-api.ts           # Server-side wrapper with structured responses
│   └── auth-utils-server.ts    # Server-side auth utilities
├── services/
│   └── api.service.ts          # High-level API service layer
└── hooks/
    └── use-api-error-handler.ts # React hook for error handling
```

## Key Features Summary

1. **Environment Agnostic**: Works seamlessly in both server and client environments
2. **Automatic Authentication**: JWT tokens from cookies are automatically included
3. **Type Safety**: Full TypeScript support with proper typing
4. **Error Handling**: Structured error responses with `ApiError` class
5. **Strapi Integration**: Built for Strapi's REST API conventions
6. **File Upload Support**: Automatic FormData handling
7. **Request/Response Interceptors**: For logging and error processing
8. **Query String Builder**: Helper for complex Strapi queries
9. **30-second Timeout**: Configurable request timeout
10. **Cookie-based Auth**: Secure httpOnly cookies for JWT storage