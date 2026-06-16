import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { authenticate } from '../../middleware';
import { ReviewRepository } from '../../repositories/review.repository';
import { BookingRepository } from '../../repositories/booking.repository';
import {
  ReviewService,
  BookingNotFoundError,
  ReviewAccessDeniedError,
  DuplicateReviewError,
  InvalidTargetTypeError,
} from '../../services/review.service';
import { UnauthenticatedError } from '../../utils/errors';

const router = Router();
const reviewRepo = new ReviewRepository(db);
const bookingRepo = new BookingRepository(db);
const reviewService = new ReviewService(reviewRepo, bookingRepo);

function getUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) throw new UnauthenticatedError();
  return req.user;
}

const VALID_TARGET_TYPES = ['provider', 'customer', 'location'] as const;
type TargetType = (typeof VALID_TARGET_TYPES)[number];

function isValidTargetType(v: unknown): v is TargetType {
  return typeof v === 'string' && (VALID_TARGET_TYPES as readonly string[]).includes(v);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(v: string): boolean {
  return UUID_RE.test(v);
}

router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;
  if (typeof body.targetId !== 'string' || body.targetId.trim() === '') {
    res.status(400).json({ error: 'targetId is required' }); return;
  }
  if (!isValidUuid(body.targetId.trim())) {
    res.status(400).json({ error: 'targetId must be a valid UUID' }); return;
  }
  if (!isValidTargetType(body.targetType)) {
    res.status(400).json({ error: 'targetType must be provider, customer, or location' }); return;
  }
  if (typeof body.bookingId !== 'string' || body.bookingId.trim() === '') {
    res.status(400).json({ error: 'bookingId is required' }); return;
  }
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'rating must be an integer between 1 and 5' }); return;
  }

  try {
    const user = getUser(req);
    const reviewerType = user.type === 'provider' ? 'provider' : 'customer';
    const review = await reviewService.createReview({
      targetId: (body.targetId as string).trim(),
      targetType: body.targetType,
      bookingId: (body.bookingId as string).trim(),
      rating,
      body: typeof body.body === 'string' ? body.body.trim() || null : null,
      reviewerId: user.sub,
      reviewerType,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      res.status(401).json({ error: err.message });
    } else if (err instanceof ReviewAccessDeniedError || err instanceof BookingNotFoundError) {
      res.status(403).json({ error: err.message });
    } else if (err instanceof DuplicateReviewError) {
      res.status(409).json({ error: err.message });
    } else if (err instanceof InvalidTargetTypeError) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  }
});

router.get('/location-averages', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const averages = await reviewService.getLocationAverageRatings();
    res.json(averages);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const { targetId, targetType } = req.query as Record<string, string | undefined>;
  if (!targetId || targetId.trim() === '') {
    res.status(400).json({ error: 'targetId query parameter is required' }); return;
  }
  if (!isValidUuid(targetId.trim())) {
    res.status(400).json({ error: 'targetId must be a valid UUID' }); return;
  }
  if (!isValidTargetType(targetType)) {
    res.status(400).json({ error: 'targetType must be provider, customer, or location' }); return;
  }
  try {
    const result = await reviewService.getReviewsForTarget(targetId.trim(), targetType);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
