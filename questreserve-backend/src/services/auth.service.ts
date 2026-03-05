import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Knex } from 'knex';
import { signToken } from '../utils/jwt';
import { AdminUser, EndUser, Provider, ProviderPlan } from '../types';

const SALT_ROUNDS = 10;
const DEFAULT_PROVIDER_PLAN: ProviderPlan = 'FREE';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class DuplicateAccountError extends Error {
  constructor() {
    super('An account with this email already exists');
    this.name = 'DuplicateAccountError';
  }
}

export class SuspendedAccountError extends Error {
  constructor() {
    super('This account has been suspended');
    this.name = 'SuspendedAccountError';
  }
}

export interface RegisterEndUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface RegisterProviderInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization_name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
}

export class AuthService {
  constructor(private readonly knex: Knex) {}

  async registerEndUser(input: RegisterEndUserInput): Promise<AuthResult> {
    const existing = await this.knex<EndUser>('end_user').where({ email: input.email }).first();
    if (existing) throw new DuplicateAccountError();

    const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const id = uuidv4();

    await this.knex<EndUser>('end_user').insert({
      id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      password_hash,
      role: 'REGULAR',
    });

    return { token: signToken({ sub: id, type: 'end_user' }) };
  }

  async loginEndUser(input: LoginInput): Promise<AuthResult> {
    const user = await this.knex<EndUser>('end_user').where({ email: input.email }).first();
    if (!user) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) throw new InvalidCredentialsError();

    return { token: signToken({ sub: user.id, type: 'end_user' }) };
  }

  async registerProvider(input: RegisterProviderInput): Promise<AuthResult> {
    const existing = await this.knex<Provider>('provider').where({ email: input.email }).first();
    if (existing) throw new DuplicateAccountError();

    const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const id = uuidv4();

    await this.knex<Provider>('provider').insert({
      id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      password_hash,
      organization_name: input.organization_name ?? null,
      plan: DEFAULT_PROVIDER_PLAN,
    });

    return { token: signToken({ sub: id, type: 'provider' }) };
  }

  async loginProvider(input: LoginInput): Promise<AuthResult> {
    const user = await this.knex<Provider>('provider').where({ email: input.email }).first();
    if (!user) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) throw new InvalidCredentialsError();

    if (user.status === 'SUSPENDED') throw new SuspendedAccountError();

    return { token: signToken({ sub: user.id, type: 'provider' }) };
  }

  async loginAdmin(input: LoginInput): Promise<AuthResult> {
    const user = await this.knex<AdminUser>('admin_user').where({ email: input.email }).first();
    if (!user) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) throw new InvalidCredentialsError();

    return { token: signToken({ sub: user.id, type: 'admin' }) };
  }
}
