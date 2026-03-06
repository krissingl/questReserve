import { Knex } from 'knex';

export abstract class BaseRepository<T> {
  constructor(protected readonly knex: Knex) {}

  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  abstract update(id: string, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T | null>;
  abstract delete(id: string): Promise<void>;
}
