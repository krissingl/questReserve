import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { Provider, ProviderStatus } from '../types';

export class ProviderRepository extends BaseRepository<Provider> {
  constructor(knex: Knex) {
    super(knex);
  }

  async findAll(): Promise<Provider[]> {
    return this.knex<Provider>('provider').select('*');
  }

  async findById(id: string): Promise<Provider | null> {
    const row = await this.knex<Provider>('provider').where({ id }).first();
    return row ?? null;
  }

  async updateStatus(id: string, status: ProviderStatus): Promise<Provider | null> {
    const [row] = await this.knex<Provider>('provider')
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }

  async create(data: Omit<Provider, 'id' | 'created_at' | 'updated_at'>): Promise<Provider> {
    const id = uuidv4();
    const [row] = await this.knex<Provider>('provider')
      .insert({ id, ...data })
      .returning('*');
    return row;
  }

  async update(
    id: string,
    data: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Provider | null> {
    const [row] = await this.knex<Provider>('provider')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.knex<Provider>('provider').where({ id }).delete();
  }

  async findPublicProfile(id: string): Promise<{
    id: string;
    first_name: string;
    last_name: string;
    organization_name: string | null;
    profile_picture_url: string | null;
    locations: Array<{
      id: string;
      name: string;
      description: string | null;
      difficulty: string;
      image_url: string | null;
    }>;
  } | null> {
    const provider = await this.knex<Provider>('provider')
      .where({ id })
      .select('id', 'first_name', 'last_name', 'organization_name', 'status', 'profile_picture_url')
      .first();
    if (!provider || provider.status === 'SUSPENDED') return null;

    // booking_location has no status column; all locations owned by this provider are returned
    const locations = await this.knex('booking_location')
      .where({ provider_id: id })
      .select('id', 'name', 'description', 'difficulty', 'image_url');

    return {
      id: provider.id,
      first_name: provider.first_name,
      last_name: provider.last_name,
      organization_name: provider.organization_name,
      profile_picture_url: provider.profile_picture_url ?? null,
      locations,
    };
  }
}
