import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import { BookingLocationRepository } from '../../repositories/booking-location.repository';
import { LocationImagesRepository } from '../../repositories/location-images.repository';
import { TimeSlotRepository } from '../../repositories/time-slot.repository';
import { BookingRepository } from '../../repositories/booking.repository';
import {
  CustomerService,
  SlotNotFoundError,
  SlotUnavailableError,
  BookingNotFoundError,
  BookingOwnershipError,
  BookingAlreadyCancelledError,
  LocationNotFoundError,
} from '../../services/customer.service';
import { Booking, Difficulty } from '../../types';
import { validateRequiredStrings } from '../../utils/validation';
import { UnauthenticatedError } from '../../utils/errors';

const router = Router();
const publicRouter = Router();
const protectedRouter = Router();

const locationRepo = new BookingLocationRepository(db);
const locationImagesRepo = new LocationImagesRepository(db);
const slotRepo = new TimeSlotRepository(db);
const bookingRepo = new BookingRepository(db);
const customerService = new CustomerService(locationRepo, locationImagesRepo, slotRepo, bookingRepo);

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'];

function getUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) throw new UnauthenticatedError();
  return req.user;
}

function handleCustomerError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof UnauthenticatedError) {
    res.status(401).json({ error: err.message });
  } else if (
    err instanceof LocationNotFoundError ||
    err instanceof SlotNotFoundError ||
    err instanceof BookingNotFoundError
  ) {
    res.status(404).json({ error: 'Not found' });
  } else if (err instanceof SlotUnavailableError) {
    res.status(409).json({ error: err.message });
  } else if (err instanceof BookingOwnershipError) {
    res.status(403).json({ error: err.message });
  } else if (err instanceof BookingAlreadyCancelledError) {
    res.status(409).json({ error: err.message });
  } else {
    next(err);
  }
}

publicRouter.get('/locations', async (req: Request, res: Response, next: NextFunction) => {
  const { difficulty } = req.query;
  if (difficulty !== undefined) {
    if (typeof difficulty !== 'string' || !VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
      res.status(400).json({ error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` });
      return;
    }
  }
  try {
    const locations = await customerService.browseLocations(difficulty as Difficulty | undefined);
    res.json(locations);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

publicRouter.get('/locations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await customerService.getLocationWithProvider(req.params.id);
    if (!location) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(location);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

publicRouter.get('/locations/:id/images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const images = await customerService.getLocationImages(req.params.id);
    res.json(images);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

publicRouter.get('/locations/:id/slots', async (req: Request, res: Response, next: NextFunction) => {
  const { date } = req.query;
  if (date !== undefined && typeof date !== 'string') {
    res.status(400).json({ error: 'date must be a string' }); return;
  }
  if (date !== undefined && isNaN(new Date(date as string).getTime())) {
    res.status(400).json({ error: 'date must be a valid ISO date string' }); return;
  }
  try {
    const slots = await customerService.getAvailableSlots(req.params.id, date as string | undefined);
    res.json(slots);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

protectedRouter.use(authenticate, requireRole('end_user'));

protectedRouter.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUser(req);
    const row = await db('end_user').where({ id: user.sub }).select('id', 'first_name', 'last_name', 'email').first();
    if (!row) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

protectedRouter.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const b = req.body as Record<string, unknown>;
  const { first_name, last_name } = b;
  if (first_name !== undefined && (typeof first_name !== 'string' || (first_name as string).trim() === '')) {
    res.status(400).json({ error: 'first_name must be a non-empty string' }); return;
  }
  if (last_name !== undefined && (typeof last_name !== 'string' || (last_name as string).trim() === '')) {
    res.status(400).json({ error: 'last_name must be a non-empty string' }); return;
  }
  if (first_name === undefined && last_name === undefined) {
    res.status(400).json({ error: 'No valid fields to update' }); return;
  }
  try {
    const user = getUser(req);
    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (first_name !== undefined) updates.first_name = (first_name as string).trim();
    if (last_name !== undefined) updates.last_name = (last_name as string).trim();
    const [updated] = await db('end_user')
      .where({ id: user.sub })
      .update(updates)
      .returning(['id', 'first_name', 'last_name', 'email']);
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

protectedRouter.post('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateRequiredStrings(req.body, ['time_slot_id']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { time_slot_id } = req.body as Record<string, string>;
  try {
    const booking = await customerService.createBooking(getUser(req).sub, time_slot_id);
    res.status(201).json(booking);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

protectedRouter.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings: Booking[] = await customerService.getBookingHistory(getUser(req).sub);
    res.json(bookings);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

protectedRouter.delete('/bookings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await customerService.cancelBooking(getUser(req).sub, req.params.id);
    res.json(booking);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

router.use(publicRouter);
router.use(protectedRouter);

export default router;
