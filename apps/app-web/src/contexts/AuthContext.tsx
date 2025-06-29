'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService, profileService } from '@/services';
import {
  IUserPublic,
  RegisterRequest,
  IProfileUpdateRequest,
} from '@app/shared-types';
import { cookieUtils } from '@/lib/cookies';
import { loginAction, registerAction, logoutAction, getCurrentUserAction } from '@/app/auth/actions';

// Create context without explicit type definition to avoid unused warnings
const AuthContext = createContext<
  ReturnType<typeof useAuthProvider> | undefined
>(undefined);

// Custom hook that provides auth functionality
const useAuthProvider = () => {
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Use server action to check authentication with httpOnly cookies
      const result = await getCurrentUserAction();
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Only check auth once on mount
    const checkAuthOnce = async () => {
      if (mounted) {
        await checkAuth();
      }
    };

    checkAuthOnce();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Use server action to set httpOnly cookies
        const result = await loginAction({ email, password });
        
        if (!result.success) {
          throw new Error(result.error || 'Invalid email or password');
        }
        
        setUser(result.user);

        // Skip email verification for now and redirect to home
        if (
          result.user.role === 'PARTNER' &&
          result.user.partnerId
        ) {
          // Redirect partner users to partner dashboard
          router.push('/partner');
        } else {
          // Always redirect to home page, even if status is PENDING_VERIFICATION
          router.push('/');
        }
      } catch (error: any) {
        throw new Error(error.message || 'Invalid email or password');
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutAction();
    } catch {
      // Ignore logout errors
    } finally {
      // Clear client-side cookies too (if any)
      cookieUtils.clear();
      setUser(null);

      // Force a full page reload to clear any cached state
      window.location.href = '/';
    }
  }, [router]);

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        // Use server action to set httpOnly cookies
        const result = await registerAction({
          email: data.email,
          password: data.password,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Registration failed');
        }
        
        setUser(result.user);

        // Skip email verification for now and redirect to home
        if (
          result.user.role === 'PARTNER' &&
          result.user.partnerId
        ) {
          // Redirect partner users to partner dashboard
          router.push('/partner');
        } else {
          // Always redirect to home page, even if status is PENDING_VERIFICATION
          router.push('/');
        }
      } catch (error: any) {
        throw error;
      }
    },
    [router]
  );

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  const updateProfile = useCallback(async (data: IProfileUpdateRequest) => {
    try {
      const updatedUser = await profileService.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  const updateProfileImage = useCallback(
    async (file: File) => {
      try {
        const result = await profileService.uploadProfileImage(file);
        // Refresh user data to get the updated profile image
        await refreshAuth();
        return result;
      } catch (error) {
        console.error('Failed to update profile image:', error);
        throw error;
      }
    },
    [refreshAuth]
  );

  return useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      refreshAuth,
      updateProfile,
      updateProfileImage,
      checkAuth,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      register,
      refreshAuth,
      updateProfile,
      updateProfileImage,
      checkAuth,
    ]
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuthProvider();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
