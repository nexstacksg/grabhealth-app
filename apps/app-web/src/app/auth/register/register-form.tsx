'use client';

import React, { useState } from 'react';
import { useForm, UseFormReturn, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Define form type directly to avoid deep type instantiation
type RegisterFormValues = {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_PATTERNS = {
  lowercase: {
    regex: /[a-z]/,
    message: 'Password must contain at least one lowercase letter',
  },
  uppercase: {
    regex: /[A-Z]/,
    message: 'Password must contain at least one uppercase letter',
  },
  number: { regex: /\d/, message: 'Password must contain at least one number' },
  special: {
    regex: /[@$!%*?&]/,
    message: 'Password must contain at least one special character (@$!%*?&)',
  },
};

// Password validator function to avoid deep type instantiation
const passwordValidator = (password: string) => {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!PASSWORD_PATTERNS.lowercase.regex.test(password)) {
    errors.push(PASSWORD_PATTERNS.lowercase.message);
  }
  if (!PASSWORD_PATTERNS.uppercase.regex.test(password)) {
    errors.push(PASSWORD_PATTERNS.uppercase.message);
  }
  if (!PASSWORD_PATTERNS.number.regex.test(password)) {
    errors.push(PASSWORD_PATTERNS.number.message);
  }
  if (!PASSWORD_PATTERNS.special.regex.test(password)) {
    errors.push(PASSWORD_PATTERNS.special.message);
  }

  return errors.length > 0 ? errors[0] : true;
};

// Define the schema
const registerSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    phoneNumber: z.string()
      .min(10, { message: 'Phone number must be at least 10 digits' })
      .max(20, { message: 'Phone number must not exceed 20 digits' })
      .regex(/^[+]?[\d\s-()]+$/, { message: 'Please enter a valid phone number' })
      .transform(val => val.replace(/[\s-()]/g, '')), // Remove spaces, dashes, and parentheses for storage
    password: z.string()
      .min(1, { message: 'Password is required' })
      .refine(passwordValidator, {
        message: 'Invalid password',
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Props interface to accept the referrer ID from the client component wrapper
interface RegisterFormProps {
  referrerId: string | null;
}

// Reusable form field component
interface FormInputFieldProps {
  form: UseFormReturn<RegisterFormValues>;
  name: FieldPath<RegisterFormValues>;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
}

function FormInputField({
  form,
  name,
  label,
  type = 'text',
  placeholder,
  description,
}: FormInputFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function RegisterForm({
  referrerId,
}: RegisterFormProps) {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      await register({
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        referrer: referrerId, // Pass the referrer to the registration
      });

      // The AuthContext handles the redirect after successful registration
    } catch (error: any) {

      // Detailed error message for debugging
      let errorMessage = 'Registration failed';
      
      if (error?.status === 405) {
        errorMessage = 'Method not allowed - The registration endpoint may not be available on the server';
      } else if (error?.status === 404) {
        errorMessage = 'Registration endpoint not found - Please check server configuration';
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error messages
      if (errorMessage.toLowerCase().includes('phone number') && errorMessage.toLowerCase().includes('already registered')) {
        // Phone number already exists - clear the phone field
        form.setError('phoneNumber', {
          type: 'manual',
          message: 'This phone number is already registered'
        });
        errorMessage = 'This phone number is already registered. Please use a different phone number or sign in to your existing account.';
      } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already registered')) {
        // Email already exists
        form.setError('email', {
          type: 'manual',
          message: 'This email is already registered'
        });
        errorMessage = 'This email is already registered. Please sign in to your existing account.';
      }
      
      // In development, show more details
      if (process.env.NODE_ENV === 'development' && error?.status) {
        errorMessage += ` (Status: ${error.status})`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {referrerId && (
        <Alert className="mb-4">
          <AlertDescription>
            You're joining through a referral link. Your referrer will be linked to your account.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInputField
            form={form}
            name="email"
            label="Email"
            placeholder="you@example.com"
          />
          <FormInputField
            form={form}
            name="phoneNumber"
            label="Phone Number"
            placeholder="+60 12-345 6789"
            description="Enter your mobile number with country code"
          />
          <FormInputField
            form={form}
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <FormInputField
            form={form}
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
