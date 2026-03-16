import {
  AuthService,
  DuplicateAccountError,
  InvalidCredentialsError,
  SuspendedAccountError,
} from './auth.service';
import { AdminUser, EndUser, Provider } from '../types';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));
import bcrypt from 'bcryptjs';
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('../utils/jwt', () => ({
  signToken: jest.fn().mockReturnValue('mock-jwt-token'),
}));
import { signToken } from '../utils/jwt';
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;

function makeKnexMock() {
  const builder = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockResolvedValue([]),
  };

  const knex = jest.fn().mockReturnValue(builder) as jest.MockedFunction<(...args: unknown[]) => typeof builder>;
  return { knex, builder };
}

const endUser: EndUser = {
  id: 'user-1',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@test.local',
  password_hash: 'hashed',
  role: 'REGULAR',
  created_at: new Date(),
  updated_at: new Date(),
};

const provider: Provider = {
  id: 'prov-1',
  first_name: 'Test',
  last_name: 'Provider',
  email: 'provider@test.local',
  password_hash: 'hashed',
  organization_name: null,
  plan: 'FREE',
  status: 'ACTIVE',
  created_at: new Date(),
  updated_at: new Date(),
};

const adminUser: AdminUser = {
  id: 'admin-1',
  first_name: 'Test',
  last_name: 'Admin',
  email: 'admin@test.local',
  password_hash: 'hashed',
  role: 'PLATFORM_ADMIN',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignToken.mockReturnValue('mock-jwt-token');
    mockBcrypt.hash.mockResolvedValue('hashed-password');
  });

  describe('registerEndUser', () => {
    it('throws DuplicateAccountError when a user with the same email already exists', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(endUser);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(
        service.registerEndUser({ first_name: 'A', last_name: 'B', email: 'test@test.local', password: 'pass' })
      ).rejects.toThrow(DuplicateAccountError);
    });

    it('returns { token } on success', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(undefined);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      const result = await service.registerEndUser({
        first_name: 'A',
        last_name: 'B',
        email: 'new@test.local',
        password: 'pass',
      });

      expect(result).toEqual({ token: 'mock-jwt-token' });
    });
  });

  describe('registerProvider', () => {
    it('throws DuplicateAccountError on duplicate email', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(provider);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(
        service.registerProvider({ first_name: 'A', last_name: 'B', email: 'dup@test.local', password: 'pass' })
      ).rejects.toThrow(DuplicateAccountError);
    });

    it('returns { token } on success', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(undefined);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      const result = await service.registerProvider({
        first_name: 'A',
        last_name: 'B',
        email: 'new@test.local',
        password: 'pass',
      });

      expect(result).toEqual({ token: 'mock-jwt-token' });
    });
  });

  describe('loginEndUser', () => {
    it('throws InvalidCredentialsError when the email is not found', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(undefined);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginEndUser({ email: 'no@test.local', password: 'pass' })).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('throws InvalidCredentialsError when the password does not match', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(endUser);
      mockBcrypt.compare.mockResolvedValue(false as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginEndUser({ email: 'test@test.local', password: 'wrong' })).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('returns { token } on success', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(endUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      const result = await service.loginEndUser({ email: 'test@test.local', password: 'correct' });

      expect(result).toEqual({ token: 'mock-jwt-token' });
    });
  });

  describe('loginProvider', () => {
    it('throws InvalidCredentialsError when the email is not found', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(undefined);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginProvider({ email: 'no@test.local', password: 'pass' })).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('throws InvalidCredentialsError on password mismatch', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(provider);
      mockBcrypt.compare.mockResolvedValue(false as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginProvider({ email: 'provider@test.local', password: 'wrong' })).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('throws SuspendedAccountError when the provider status is SUSPENDED', async () => {
      const suspended: Provider = { ...provider, status: 'SUSPENDED' };
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(suspended);
      mockBcrypt.compare.mockResolvedValue(true as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginProvider({ email: 'provider@test.local', password: 'correct' })).rejects.toThrow(
        SuspendedAccountError
      );
    });

    it('returns { token } on success', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(provider);
      mockBcrypt.compare.mockResolvedValue(true as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      const result = await service.loginProvider({ email: 'provider@test.local', password: 'correct' });

      expect(result).toEqual({ token: 'mock-jwt-token' });
    });
  });

  describe('loginAdmin', () => {
    it('throws InvalidCredentialsError when the email is not found', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(undefined);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginAdmin({ email: 'no@test.local', password: 'pass' })).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('throws InvalidCredentialsError on password mismatch', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(adminUser);
      mockBcrypt.compare.mockResolvedValue(false as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      await expect(service.loginAdmin({ email: 'admin@test.local', password: 'wrong' })).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('returns { token } on success', async () => {
      const { knex, builder } = makeKnexMock();
      builder.first.mockResolvedValue(adminUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      const service = new AuthService(knex as unknown as import('knex').Knex);

      const result = await service.loginAdmin({ email: 'admin@test.local', password: 'correct' });

      expect(result).toEqual({ token: 'mock-jwt-token' });
    });
  });
});
