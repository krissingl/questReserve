import { ReviewRepository, InsertReviewData, Review } from '../repositories/review.repository';
import { BookingRepository } from '../repositories/booking.repository';

export class BookingNotFoundError extends Error {
  constructor() {
    super('Booking not found or you are not a party to it');
    this.name = 'BookingNotFoundError';
  }
}

export class ReviewAccessDeniedError extends Error {
  constructor() {
    super('You are not a party to this booking');
    this.name = 'ReviewAccessDeniedError';
  }
}

export class DuplicateReviewError extends Error {
  constructor() {
    super('You have already reviewed this');
    this.name = 'DuplicateReviewError';
  }
}

export class InvalidTargetTypeError extends Error {
  constructor() {
    super('Invalid reviewer/target type combination');
    this.name = 'InvalidTargetTypeError';
  }
}

export class ReviewService {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly bookingRepo: BookingRepository
  ) {}

  private validateTargetType(
    reviewerType: 'provider' | 'customer',
    targetType: 'provider' | 'customer' | 'location'
  ): void {
    if (reviewerType === 'provider' && targetType !== 'customer') {
      throw new InvalidTargetTypeError();
    }
    if (reviewerType === 'customer' && targetType !== 'provider' && targetType !== 'location') {
      throw new InvalidTargetTypeError();
    }
  }

  private async assertPartyAccess(
    bookingId: string,
    reviewerId: string,
    reviewerType: 'provider' | 'customer'
  ): Promise<void> {
    const booking = await this.bookingRepo.findByIdWithProvider(bookingId);
    if (!booking) throw new BookingNotFoundError();
    const isParty =
      reviewerType === 'provider'
        ? booking.provider_id === reviewerId
        : booking.end_user_id === reviewerId;
    if (!isParty) throw new ReviewAccessDeniedError();
  }

  async createReview(data: {
    targetId: string;
    targetType: 'provider' | 'customer' | 'location';
    bookingId: string;
    rating: number;
    body?: string | null;
    reviewerId: string;
    reviewerType: 'provider' | 'customer';
  }): Promise<Review> {
    this.validateTargetType(data.reviewerType, data.targetType);
    await this.assertPartyAccess(data.bookingId, data.reviewerId, data.reviewerType);

    const existing = await this.reviewRepo.findByBookingAndReviewer(
      data.bookingId,
      data.reviewerId,
      data.reviewerType
    );
    if (existing) throw new DuplicateReviewError();

    const insertData: InsertReviewData = {
      reviewer_id: data.reviewerId,
      reviewer_type: data.reviewerType,
      target_id: data.targetId,
      target_type: data.targetType,
      booking_id: data.bookingId,
      rating: data.rating,
      body: data.body ?? null,
    };
    return this.reviewRepo.create(insertData);
  }

  async getReviewsForTarget(
    targetId: string,
    targetType: 'provider' | 'customer' | 'location'
  ): Promise<{ reviews: Review[]; averageRating: number; count: number }> {
    const [reviews, avg] = await Promise.all([
      this.reviewRepo.findByTarget(targetId, targetType),
      this.reviewRepo.findAverageRating(targetId, targetType),
    ]);
    return {
      reviews,
      averageRating: avg.averageRating,
      count: avg.count,
    };
  }

  async getLocationAverageRatings(): Promise<Record<string, { averageRating: number; count: number }>> {
    return this.reviewRepo.findAverageRatingsForAllLocations();
  }
}
