import { PartnerInfo, PartnerAuthResult } from '@app/shared-types';

/**
 * PartnerAuthService - Handles partner authentication and verification
 * Extracted from usePartnerAuth hook business logic
 */
export class PartnerAuthService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check partner authentication status
   * @returns Partner authentication result
   */
  async checkPartnerAuth(): Promise<PartnerAuthResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/partner-dashboard/profile`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return this.handleAuthError(response.status);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return {
          success: true,
          partnerInfo: {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            isPartner: true,
          },
        };
      } else {
        return {
          success: false,
          error: 'You need to be a partner to access this page',
          shouldRedirect: true,
          redirectPath: '/',
        };
      }
    } catch (error) {
      console.error('Partner auth check failed:', error);
      return {
        success: false,
        error: 'Failed to verify partner status. Please try again.',
        shouldRedirect: false,
      };
    }
  }

  /**
   * Handle authentication errors with appropriate responses
   * @param status - HTTP status code
   * @returns Partner authentication result
   */
  private handleAuthError(status: number): PartnerAuthResult {
    switch (status) {
      case 401:
        return {
          success: false,
          error: 'Please log in as a partner to access this page',
          shouldRedirect: true,
          redirectPath: '/auth/login',
        };
      case 403:
        return {
          success: false,
          error: 'You do not have partner privileges',
          shouldRedirect: true,
          redirectPath: '/',
        };
      case 404:
        return {
          success: false,
          error: 'Partner service is not available',
          shouldRedirect: false,
        };
      default:
        return {
          success: false,
          error: 'Failed to verify partner status',
          shouldRedirect: false,
        };
    }
  }

  /**
   * Verify if user has partner access
   * @param userId - User ID to check
   * @returns True if user is a verified partner
   */
  async verifyPartnerAccess(userId?: string): Promise<boolean> {
    const result = await this.checkPartnerAuth();
    return result.success && result.partnerInfo?.isPartner === true;
  }

  /**
   * Get partner profile information
   * @returns Partner profile data or null if not authorized
   */
  async getPartnerProfile(): Promise<PartnerInfo | null> {
    const result = await this.checkPartnerAuth();
    return result.success ? result.partnerInfo || null : null;
  }

  /**
   * Check if current session has partner privileges
   * @returns Promise resolving to partner status
   */
  async hasPartnerPrivileges(): Promise<boolean> {
    try {
      const result = await this.checkPartnerAuth();
      return result.success;
    } catch (error) {
      console.error('Error checking partner privileges:', error);
      return false;
    }
  }

  /**
   * Get user-friendly error message for partner auth failures
   * @param error - Error message from auth check
   * @returns Human-readable error message
   */
  getPartnerAuthErrorMessage(error?: string): string {
    if (!error) return 'Unknown partner authentication error';

    // Return the error as-is since our service already provides user-friendly messages
    return error;
  }

  /**
   * Validate partner session and redirect if necessary
   * @returns Validation result with redirect information
   */
  async validatePartnerSession(): Promise<{
    isValid: boolean;
    shouldRedirect: boolean;
    redirectPath?: string;
    error?: string;
  }> {
    const result = await this.checkPartnerAuth();

    if (result.success) {
      return {
        isValid: true,
        shouldRedirect: false,
      };
    }

    return {
      isValid: false,
      shouldRedirect: result.shouldRedirect || false,
      redirectPath: result.redirectPath,
      error: result.error,
    };
  }
}
