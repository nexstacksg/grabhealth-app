import {
  ServiceError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
} from '../../utils/errors';

describe('error utilities', () => {
  describe('ServiceError', () => {
    it('should create error with message, code, and status', () => {
      const error = new ServiceError('Something went wrong', 'SERVICE_ERROR', 500);

      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('SERVICE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ServiceError');
    });

    it('should default to status 500', () => {
      const error = new ServiceError('Error', 'ERROR_CODE');

      expect(error.statusCode).toBe(500);
    });

    it('should be instanceof Error', () => {
      const error = new ServiceError('Error', 'CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ServiceError);
    });
  });

  describe('ValidationError', () => {
    it('should create error with status 400', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should extend ServiceError', () => {
      const error = new ValidationError('Invalid');

      expect(error).toBeInstanceOf(ServiceError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create error with status 401', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('AuthorizationError', () => {
    it('should create error with status 403', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should accept custom message', () => {
      const error = new AuthorizationError('Access denied');

      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    it('should create error with status 404', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('should create error with status 409', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('error hierarchy', () => {
    it('should maintain proper instanceof checks', () => {
      const validation = new ValidationError('Invalid');
      const auth = new AuthenticationError();
      const authz = new AuthorizationError();
      const notFound = new NotFoundError();
      const conflict = new ConflictError('Conflict');

      // All should be instances of Error
      expect(validation).toBeInstanceOf(Error);
      expect(auth).toBeInstanceOf(Error);
      expect(authz).toBeInstanceOf(Error);
      expect(notFound).toBeInstanceOf(Error);
      expect(conflict).toBeInstanceOf(Error);

      // All should be instances of ServiceError
      expect(validation).toBeInstanceOf(ServiceError);
      expect(auth).toBeInstanceOf(ServiceError);
      expect(authz).toBeInstanceOf(ServiceError);
      expect(notFound).toBeInstanceOf(ServiceError);
      expect(conflict).toBeInstanceOf(ServiceError);

      // Each should be instance of its own type
      expect(validation).toBeInstanceOf(ValidationError);
      expect(auth).toBeInstanceOf(AuthenticationError);
      expect(authz).toBeInstanceOf(AuthorizationError);
      expect(notFound).toBeInstanceOf(NotFoundError);
      expect(conflict).toBeInstanceOf(ConflictError);
    });
  });
});