import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { LocationImage } from '../types';

export class LocationImagesRepository extends BaseRepository<LocationImage> {
  constructor(knex: Knex) {
    super(knex);
  }

  async findById(id: string): Promise<LocationImage | null> {
    const row = await this.knex<LocationImage>('location_images').where({ id }).first();
    return row ?? null;
  }

  async findAll(): Promise<LocationImage[]> {
    return this.knex<LocationImage>('location_images').select('*');
  }

  async findByLocation(locationId: string): Promise<LocationImage[]> {
    return this.knex<LocationImage>('location_images')
      .where({ booking_location_id: locationId })
      .orderBy('display_order', 'asc')
      .select('*');
  }

  async create(data: {
    booking_location_id: string;
    image_url: string;
    display_order: number;
  }): Promise<LocationImage> {
    const [row] = await this.knex<LocationImage>('location_images')
      .insert({ id: uuidv4(), ...data })
      .returning('*');
    return row;
  }

  async update(id: string, data: Partial<Omit<LocationImage, 'id' | 'created_at' | 'updated_at'>>): Promise<LocationImage | null> {
    const [row] = await this.knex<LocationImage>('location_images')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.knex<LocationImage>('location_images').where({ id }).delete();
  }

  async deleteByLocation(locationId: string): Promise<void> {
    await this.knex<LocationImage>('location_images')
      .where({ booking_location_id: locationId })
      .delete();
  }

  async nextDisplayOrder(locationId: string): Promise<number> {
    const result = await this.knex('location_images')
      .where({ booking_location_id: locationId })
      .max('display_order as max')
      .first<{ max: string | null }>();
    return result?.max == null ? 0 : Number(result.max) + 1;
  }
}
