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
    password: z.string().refine(passwordValidator, {
      message: 'Invalid password',
    }),
    confirmPassword: z.string(),
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
}

function FormInputField({
  form,
  name,
  label,
  type = 'text',
  placeholder,
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function RegisterForm({
  referrerId: _referrerId, // Prefix with _ to indicate it's intentionally unused
}: RegisterFormProps) {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    // @ts-expect-error: Known issue with zod resolver and complex schemas
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
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
        password: data.password,
      });

      // The AuthContext handles the redirect after successful registration
    } catch (error: any) {
      console.error('Registration error:', error?.message || 'Unknown error');
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        details: error?.details,
        name: error?.name,
        stack: error?.stack
      });

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
