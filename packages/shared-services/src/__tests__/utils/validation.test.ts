import {
  validateEmail,
  validatePassword,
  assertValidEmail,
  assertValidPassword,
  assertNotEmpty
} from '../../utils/validation';
import { ValidationError } from '../../utils/errors';

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
      expect(validateEmail('123@456.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('ValidPass@123')).toBe(true);
      expect(validatePassword('Str0ng!Password')).toBe(true);
      expect(validatePassword('P@ssw0rd123')).toBe(true);
      expect(validatePassword('Complex$Pass1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      // Too short
      expect(validatePassword('Pass@1')).toBe(false);
      
      // Missing uppercase
      expect(validatePassword('password@123')).toBe(false);
      
      // Missing lowercase
      expect(validatePassword('PASSWORD@123')).toBe(false);
      
      // Missing number
      expect(validatePassword('Password@')).toBe(false);
      
      // Missing special character
      expect(validatePassword('Password123')).toBe(false);
      
      // Empty
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('assertValidEmail', () => {
    it('should not throw for valid emails', () => {
      expect(() => assertValidEmail('test@example.com')).not.toThrow();
      expect(() => assertValidEmail('user@domain.org')).not.toThrow();
    });

    it('should throw ValidationError for invalid emails', () => {
      expect(() => assertValidEmail('invalid')).toThrow(ValidationError);
      expect(() => assertValidEmail('invalid')).toThrow('Invalid email format');
      expect(() => assertValidEmail('')).toThrow(ValidationError);
    });
  });

  describe('assertValidPassword', () => {
    it('should not throw for valid passwords', () => {
      expect(() => assertValidPassword('ValidPass@123')).not.toThrow();
      expect(() => assertValidPassword('Str0ng!Pass')).not.toThrow();
    });

    it('should throw ValidationError for invalid passwords', () => {
      expect(() => assertValidPassword('weak')).toThrow(ValidationError);
      expect(() => assertValidPassword('weak')).toThrow(
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      );
      expect(() => assertValidPassword('')).toThrow(ValidationError);
    });
  });

  describe('assertNotEmpty', () => {
    it('should not throw for non-empty values', () => {
      expect(() => assertNotEmpty('value', 'Field')).not.toThrow();
      expect(() => assertNotEmpty('  value  ', 'Field')).not.toThrow();
    });

    it('should throw ValidationError for empty values', () => {
      expect(() => assertNotEmpty('', 'Username')).toThrow(ValidationError);
      expect(() => assertNotEmpty('', 'Username')).toThrow('Username is required');
      expect(() => assertNotEmpty('   ', 'Email')).toThrow('Email is required');
    });

    it('should include field name in error message', () => {
      expect(() => assertNotEmpty('', 'Password')).toThrow('Password is required');
      expect(() => assertNotEmpty('', 'First Name')).toThrow('First Name is required');
    });
  });
});