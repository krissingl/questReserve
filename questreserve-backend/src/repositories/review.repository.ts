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
    return this.knex('review')
      .leftJoin('provider as p', function () {
        this.on('review.reviewer_id', '=', 'p.id').andOnVal('review.reviewer_type', 'provider');
      })
      .leftJoin('end_user as u', function () {
        this.on('review.reviewer_id', '=', 'u.id').andOnVal('review.reviewer_type', 'customer');
      })
      .where({ 'review.target_id': targetId, 'review.target_type': targetType })
      .select(
        'review.*',
        this.knex.raw('COALESCE(p.first_name, u.first_name) as reviewer_first_name'),
        this.knex.raw('COALESCE(p.last_name, u.last_name) as reviewer_last_name')
      )
      .orderBy('review.created_at', 'desc') as Promise<Review[]>;
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

  async findAverageRatingsForAllLocations(): Promise<Record<string, ReviewAverageResult>> {
    const rows = await this.knex('review')
      .where({ target_type: 'location' })
      .select(
        'target_id',
        this.knex.raw('COALESCE(AVG(rating), 0) as average_rating'),
        this.knex.raw('COUNT(*) as count')
      )
      .groupBy('target_id') as Array<{ target_id: string; average_rating: string; count: string }>;
    const result: Record<string, ReviewAverageResult> = {};
    for (const row of rows) {
      result[row.target_id] = {
        averageRating: parseFloat(row.average_rating),
        count: parseInt(row.count, 10),
      };
    }
    return result;
  }
}
