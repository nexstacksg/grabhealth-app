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
import { Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const { user, refreshAuth } = useAuth();
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from user or sessionStorage (client-side only)
  const email = user?.email || (typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || '{}').email : '');

  useEffect(() => {
    // Redirect if no user or already verified
    if (!user && !email) {
      router.push('/auth/login');
    } else if (user?.status === 'ACTIVE') {
      router.push('/');
    }
  }, [user, email, router]);

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
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 3 && digit) {
      const fullCode = [...newCode].join('');
      if (fullCode.length === 4) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    if (pastedData.length === 4) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[3]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const fullCode = verificationCode || code.join('');
    
    if (fullCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await services.auth.verifyEmailCode(email, fullCode);
      
      // Update user status in sessionStorage (client-side only)
      if (typeof window !== 'undefined') {
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (storedUser.email) {
          storedUser.status = 'ACTIVE';
          sessionStorage.setItem('user', JSON.stringify(storedUser));
        }
      }
      
      // Refresh auth state
      await refreshAuth();
      
      // Redirect to home
      router.push('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(err.response?.data?.error?.message || err.message || 'Invalid code');
      // Clear code on error
      setCode(['', '', '', '']);
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
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(err.response?.data?.error?.message || err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // Mask email for display
  const maskedEmail = email ? 
    email.replace(/^(.{2})(.*)(@.*)$/, (_: string, a: string, b: string, c: string) => a + '*'.repeat(b.length) + c) : 
    '';

  return (
    <div className="container max-w-md py-16 mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a 4-digit verification code to {maskedEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-center text-2xl font-bold"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button
              onClick={() => handleVerify()}
              className="w-full"
              disabled={isLoading || code.join('').length !== 4}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center text-sm">
              <p className="text-gray-500 mb-2">
                Didn't receive the code?
              </p>
              <Button
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
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth/login')}
                className="text-sm"
              >
                Back to login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}