import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import { BookingLocationRepository } from '../../repositories/booking-location.repository';
import { TimeSlotRepository } from '../../repositories/time-slot.repository';
import { BookingRepository } from '../../repositories/booking.repository';
import {
  CustomerService,
  SlotNotFoundError,
  SlotUnavailableError,
  BookingNotFoundError,
  BookingOwnershipError,
  BookingAlreadyCancelledError,
} from '../../services/customer.service';
import { Difficulty } from '../../types';

const router = Router();

const locationRepo = new BookingLocationRepository(db);
const slotRepo = new TimeSlotRepository(db);
const bookingRepo = new BookingRepository(db);
const customerService = new CustomerService(locationRepo, slotRepo, bookingRepo);

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'];

function validateRequiredStrings(body: unknown, fields: string[]): string | null {
  if (typeof body !== 'object' || body === null) return 'Request body must be a JSON object';
  const b = body as Record<string, unknown>;
  for (const field of fields) {
    if (typeof b[field] !== 'string' || (b[field] as string).trim() === '') {
      return `${field} is required`;
    }
  }
  return null;
}

function handleCustomerError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof SlotNotFoundError || err instanceof BookingNotFoundError) {
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

// --- Public location browsing ---

router.get('/locations', async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/locations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await customerService.getLocation(req.params.id);
    if (!location) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(location);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

router.get('/locations/:id/slots', async (req: Request, res: Response, next: NextFunction) => {
  const { date } = req.query;
  if (date !== undefined && typeof date !== 'string') {
    res.status(400).json({ error: 'date must be a string' }); return;
  }
  try {
    const slots = await customerService.getAvailableSlots(req.params.id, date as string | undefined);
    res.json(slots);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

// --- Authenticated booking routes ---

router.post('/bookings', authenticate, requireRole('end_user'), async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateRequiredStrings(req.body, ['time_slot_id']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const { time_slot_id } = req.body as Record<string, string>;
  try {
    const booking = await customerService.createBooking(req.user!.sub, time_slot_id);
    res.status(201).json(booking);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

router.get('/bookings', authenticate, requireRole('end_user'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await customerService.getBookingHistory(req.user!.sub);
    res.json(bookings);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

router.delete('/bookings/:id', authenticate, requireRole('end_user'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await customerService.cancelBooking(req.user!.sub, req.params.id);
    res.json(booking);
  } catch (err) {
    handleCustomerError(err, res, next);
  }
});

export default router;
