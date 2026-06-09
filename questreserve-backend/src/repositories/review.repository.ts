import { Knex } from 'knex';
import { Review } from '../types';

export { Review };

export interface InsertReviewData {
  reviewer_id: string;
  reviewer_type: 'provider' | 'customer';
  target_id: string;
  target_type: 'provider' | 'customer' | 'location';
  booking_id: string;
  rating: number;
  body?: string | null;
}

export interface ReviewAverageResult {
  averageRating: number;
  count: number;
}

export class ReviewRepository {
  constructor(private readonly knex: Knex) {}

  async create(data: InsertReviewData): Promise<Review> {
    const [row] = await this.knex<Review>('review')
      .insert(data)
      .returning('*');
    return row;
  }

  async findByTarget(targetId: string, targetType: 'provider' | 'customer' | 'location'): Promise<Review[]> {
    return this.knex<Review>('review')
      .where({ target_id: targetId, target_type: targetType })
      .orderBy('created_at', 'desc');
  }

  async findByBookingAndReviewer(
    bookingId: string,
    reviewerId: string,
    reviewerType: 'provider' | 'customer'
  ): Promise<Review | null> {
    const row = await this.knex<Review>('review')
      .where({ booking_id: bookingId, reviewer_id: reviewerId, reviewer_type: reviewerType })
      .first();
    return row ?? null;
  }

  async findAverageRating(targetId: string, targetType: 'provider' | 'customer' | 'location'): Promise<ReviewAverageResult> {
    const result = await this.knex('review')
      .where({ target_id: targetId, target_type: targetType })
      .select(
        this.knex.raw('COALESCE(AVG(rating), 0) as average_rating'),
        this.knex.raw('COUNT(*) as count')
      )
      .first();
    return {
      averageRating: result ? parseFloat(result.average_rating) : 0,
      count: result ? parseInt(result.count, 10) : 0,
    };
  }
}
