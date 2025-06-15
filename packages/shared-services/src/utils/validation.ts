import { ValidationError } from './errors';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const assertValidEmail = (email: string): void => {
  if (!validateEmail(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const assertValidPassword = (password: string): void => {
  if (!validatePassword(password)) {
    throw new ValidationError(
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    );
  }
};

export const assertNotEmpty = (value: string, fieldName: string): void => {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }
};