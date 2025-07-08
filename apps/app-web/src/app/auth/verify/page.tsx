'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import services from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail } from 'lucide-react';

// Type assertions to fix React 18/19 compatibility issues
const TypedCard = Card as any;
const TypedCardHeader = CardHeader as any;
const TypedCardTitle = CardTitle as any;
const TypedCardDescription = CardDescription as any;
const TypedCardContent = CardContent as any;
const TypedAlert = Alert as any;
const TypedAlertDescription = AlertDescription as any;
const TypedButton = Button as any;
const TypedInput = Input as any;

export default function VerifyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from sessionStorage (from registration)
  const [email, setEmail] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  
  useEffect(() => {
    // Initialize email from sessionStorage
    const regEmail = sessionStorage.getItem('registrationEmail');
    if (regEmail) {
      setEmail(regEmail);
    } else if (user?.email && user?.status === 'PENDING_VERIFICATION') {
      setEmail(user.email);
    }
    setIsInitialized(true);
  }, [user]);

  useEffect(() => {
    // Only redirect after initialization and if no email is available
    if (!isInitialized) return;
    
    if (!email && !user) {
      // No email and no user, redirect to login
      router.push('/auth/login');
    } else if (user?.status === 'ACTIVE' && user?.emailVerified) {
      // User is already verified, redirect to home
      router.push('/');
    }
  }, [email, user, router, isInitialized]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && digit) {
      const fullCode = [...newCode].join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const fullCode = verificationCode || code.join('');

    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Verifying email code for:', email, 'with code:', fullCode);
      const response = await services.auth.verifyEmailCode(email, fullCode);
      console.log('Verification response:', response);
      
      // Show success message before redirect
      setError(null);
      setIsSuccess(true);
      
      // Clear any existing session data since user needs to login after verification
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('registrationEmail');
      }

      // Small delay to ensure smooth transition
      setTimeout(() => {
        console.log('Redirecting to login...');
        router.push('/auth/login?verified=true');
      }, 1000);
      
    } catch (error: any) {
      console.error('Verification error:', error);
      
      // Handle ApiError from the unified API client
      const errorMessage = error.details?.error?.message || 
                          error.message || 
                          'Invalid or expired verification code';
      
      setError(errorMessage);
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      await services.auth.resendVerificationCode(email);
      // Set 60 second cooldown
      setResendTimer(60);
      // Clear code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          'Failed to resend code'
      );
    } finally {
      setIsResending(false);
    }
  };

  // Mask email for display
  const maskedEmail = email
    ? email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_: string, a: string, b: string, c: string) =>
          a + '*'.repeat(b.length) + c
      )
    : '';

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="container max-w-md py-8 px-4 mx-auto">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Show special message if email is from registration and haven't clicked to show code entry
  if (email && sessionStorage.getItem('registrationEmail') && !showCodeEntry) {
    return (
      <div className="container max-w-md py-8 px-4 mx-auto">
        <TypedCard>
          <TypedCardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500" />
            </div>
            <TypedCardTitle className="text-xl sm:text-2xl font-bold text-center">
              Check Your Email
            </TypedCardTitle>
            <TypedCardDescription className="text-center text-sm sm:text-base">
              We've sent a 6-digit verification code to:
              <br />
              <span className="font-semibold break-all">{email}</span>
            </TypedCardDescription>
          </TypedCardHeader>
          <TypedCardContent className="space-y-4 px-4 sm:px-6">
            <TypedAlert>
              <TypedAlertDescription className="text-xs sm:text-sm">
                Please check your email for the verification code.
                {process.env.NODE_ENV === 'development' && (
                  <span className="block mt-2 text-xs">
                    Development mode: Check the Strapi console for the code.
                  </span>
                )}
              </TypedAlertDescription>
            </TypedAlert>
            
            <TypedButton
              onClick={() => {
                // Show the code entry form
                setShowCodeEntry(true);
              }}
              className="w-full"
            >
              Enter Verification Code
            </TypedButton>
            
            <div className="text-xs sm:text-sm text-gray-500 space-y-2">
              <p>Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Wait a few minutes and try again</li>
                {process.env.NODE_ENV === 'development' && (
                  <li>Check the Strapi server console for the code</li>
                )}
              </ul>
            </div>
          </TypedCardContent>
        </TypedCard>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-8 px-4 mx-auto">
      <TypedCard>
        <TypedCardHeader className="space-y-1">
          <TypedCardTitle className="text-xl sm:text-2xl font-bold text-center">
            Verify Your Email
          </TypedCardTitle>
          <TypedCardDescription className="text-center text-sm sm:text-base">
            We've sent a 6-digit verification code to {maskedEmail}
          </TypedCardDescription>
        </TypedCardHeader>
        <TypedCardContent className="px-4 sm:px-6">
          {error && (
            <TypedAlert variant="destructive" className="mb-4">
              <TypedAlertDescription className="text-xs sm:text-sm">{error}</TypedAlertDescription>
            </TypedAlert>
          )}

          {isSuccess && (
            <TypedAlert className="mb-4">
              <TypedAlertDescription className="text-xs sm:text-sm">
                Email verified successfully! Redirecting to login...
              </TypedAlertDescription>
            </TypedAlert>
          )}

          {/* Info message about email being sent */}
          {!isSuccess && (
            <TypedAlert className="mb-4">
              <TypedAlertDescription className="text-xs sm:text-sm">
                The verification code has been sent to your email. It may take a few moments to arrive. Please check your spam folder if you don't see it.
              </TypedAlertDescription>
            </TypedAlert>
          )}

          <div className="space-y-4">
            <div className="flex justify-center gap-1 sm:gap-2">
              {code.map((digit, index) => (
                <TypedInput
                  key={index}
                  ref={(el: HTMLInputElement) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold"
                  disabled={isLoading || isSuccess}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <TypedButton
              onClick={() => handleVerify()}
              className="w-full"
              disabled={isLoading || isSuccess || code.join('').length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </TypedButton>

            <div className="text-center text-xs sm:text-sm">
              <p className="text-gray-500 mb-2 text-xs sm:text-sm">
                Didn&apos;t receive the code?
              </p>
              <TypedButton
                variant="link"
                onClick={handleResend}
                disabled={isResending || resendTimer > 0}
                className="p-0 h-auto"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  'Resend code'
                )}
              </TypedButton>
            </div>

            <div className="text-center">
              <TypedButton
                variant="ghost"
                onClick={() => router.push('/auth/login')}
                className="text-xs sm:text-sm"
              >
                Back to login
              </TypedButton>
            </div>
          </div>
        </TypedCardContent>
      </TypedCard>
    </div>
  );
}