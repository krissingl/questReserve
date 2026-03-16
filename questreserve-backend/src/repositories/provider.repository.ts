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
}
