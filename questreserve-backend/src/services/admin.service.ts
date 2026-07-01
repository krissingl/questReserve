import { Knex } from 'knex';
import { AdminBookingView, AdminRole, AdminUser, Provider, ProviderPlan, ProviderStatus } from '../types';
import { ProviderRepository } from '../repositories/provider.repository';

type SafeProvider = Omit<Provider, 'password_hash'>;
type SafeAdminUser = Omit<AdminUser, 'password_hash'>;

export interface UpdateAdminUserInput {
  role?: AdminRole;
  is_active?: boolean;
}

export class ProviderNotFoundError extends Error {
  constructor() {
    super('Provider not found');
    this.name = 'ProviderNotFoundError';
  }
}

export class AdminUserNotFoundError extends Error {
  constructor() {
    super('Admin user not found');
    this.name = 'AdminUserNotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('Insufficient permissions');
    this.name = 'ForbiddenError';
  }
}

export class SelfDeactivationError extends Error {
  constructor() {
    super('You cannot deactivate your own account');
    this.name = 'SelfDeactivationError';
  }
}

export class AdminService {
  constructor(
    private readonly knex: Knex,
    private readonly providerRepo: ProviderRepository
  ) {}

  async listProviders(): Promise<SafeProvider[]> {
    const rows = await this.providerRepo.findAll();
    return rows.map(({ password_hash: _ph, ...safe }) => safe);
  }

  async getProvider(providerId: string): Promise<SafeProvider> {
    const provider = await this.providerRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundError();
    const { password_hash: _ph, ...safe } = provider;
    return safe;
  }

  async setProviderStatus(providerId: string, status: ProviderStatus): Promise<SafeProvider> {
    const updated = await this.providerRepo.updateStatus(providerId, status);
    if (!updated) throw new ProviderNotFoundError();
    const { password_hash: _ph, ...safe } = updated;
    return safe;
  }

  async setProviderPlan(providerId: string, plan: ProviderPlan): Promise<SafeProvider> {
    const updated = await this.providerRepo.update(providerId, { plan });
    if (!updated) throw new ProviderNotFoundError();
    const { password_hash: _ph, ...safe } = updated;
    return safe;
  }

  async listAdminUsers(callerId: string): Promise<SafeAdminUser[]> {
    await this.requireSuperuser(callerId);
    return this.knex<AdminUser>('admin_user')
      .select('id', 'first_name', 'last_name', 'email', 'role', 'is_active', 'created_at', 'updated_at')
      .orderBy('created_at', 'asc');
  }

  async updateAdminUser(
    callerId: string,
    targetId: string,
    data: UpdateAdminUserInput
  ): Promise<SafeAdminUser> {
    await this.requireSuperuser(callerId);
    if (targetId === callerId && data.is_active === false) {
      throw new SelfDeactivationError();
    }
    const [updated] = await this.knex<AdminUser>('admin_user')
      .where({ id: targetId })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    if (!updated) throw new AdminUserNotFoundError();
    const { password_hash: _ph, ...safe } = updated;
    return safe;
  }

  private async requireSuperuser(callerId: string): Promise<void> {
    const caller = await this.knex<AdminUser>('admin_user').where({ id: callerId }).first();
    if (!caller || caller.role !== 'SUPERUSER') throw new ForbiddenError();
  }

  async getPlatformBookings(): Promise<AdminBookingView[]> {
    const rows = await this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .join('provider', 'booking_location.provider_id', 'provider.id')
      .select(
        'booking.id',
        'booking.time_slot_id',
        'booking.end_user_id',
        'booking.status',
        'booking.created_at',
        'booking.updated_at',
        'time_slot.start_time',
        'time_slot.end_time',
        'time_slot.booking_location_id',
        'booking_location.name as location_name',
        'provider.id as provider_id',
        this.knex.raw("provider.first_name || ' ' || provider.last_name as provider_name")
      );
    return rows as AdminBookingView[];
  }
}
