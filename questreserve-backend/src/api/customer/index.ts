import fs from 'fs';
import { Router, Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import { uploadProfilePic } from '../../infrastructure/upload';
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
import { Booking, Difficulty, LandscapeType, LocationSetting, ToneTag } from '../../types';
import { validateRequiredStrings } from '../../utils/validation';
import { UnauthenticatedError } from '../../utils/errors';

const PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? 'http://localhost:3001';

const router = Router();
const publicRouter = Router();
const protectedRouter = Router();

const locationRepo = new BookingLocationRepository(db);
const locationImagesRepo = new LocationImagesRepository(db);
const slotRepo = new TimeSlotRepository(db);
const bookingRepo = new BookingRepository(db);
const customerService = new CustomerService(locationRepo, locationImagesRepo, slotRepo, bookingRepo);

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'];
const VALID_SETTINGS: LocationSetting[] = ['interior', 'exterior'];
const VALID_LANDSCAPE_TYPES: LandscapeType[] = ['tundra', 'forest', 'desert', 'cave', 'coastal', 'volcanic', 'urban', 'plains', 'mountain', 'swamp'];
const VALID_TONE_TAGS: ToneTag[] = ['horror', 'heroic', 'comedic', 'mystery', 'political'];

function parsePositiveInt(value: string | undefined, paramName: string): { value: number } | { error: string } | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0 || String(parsed) !== value) {
    return { error: `${paramName} must be a positive integer` };
  }
  return { value: parsed };
}

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
  const q = req.query as Record<string, string | undefined>;

  let parsedDifficulties: Difficulty[] | undefined;
  if (q.difficulties !== undefined) {
    const parts = q.difficulties.split(',').map((s) => s.trim());
    const invalid = parts.filter((p) => !VALID_DIFFICULTIES.includes(p as Difficulty));
    if (invalid.length > 0) {
      res.status(400).json({ error: `difficulties contains invalid values: ${invalid.join(', ')}` });
      return;
    }
    parsedDifficulties = parts as Difficulty[];
  }

  if (q.setting !== undefined) {
    if (!VALID_SETTINGS.includes(q.setting as LocationSetting)) {
      res.status(400).json({ error: `setting must be one of: ${VALID_SETTINGS.join(', ')}` });
      return;
    }
  }

  if (q.landscapeType !== undefined) {
    if (!VALID_LANDSCAPE_TYPES.includes(q.landscapeType as LandscapeType)) {
      res.status(400).json({ error: `landscapeType must be one of: ${VALID_LANDSCAPE_TYPES.join(', ')}` });
      return;
    }
  }

  let parsedToneTags: ToneTag[] | undefined;
  if (q.toneTags !== undefined) {
    const parts = q.toneTags.split(',').map((s) => s.trim());
    const invalid = parts.filter((p) => !VALID_TONE_TAGS.includes(p as ToneTag));
    if (invalid.length > 0) {
      res.status(400).json({ error: `toneTags contains invalid values: ${invalid.join(', ')}` });
      return;
    }
    parsedToneTags = parts as ToneTag[];
  }

  const levelRangeMinResult = parsePositiveInt(q.levelRangeMin, 'levelRangeMin');
  if (levelRangeMinResult && 'error' in levelRangeMinResult) { res.status(400).json({ error: levelRangeMinResult.error }); return; }

  const levelRangeMaxResult = parsePositiveInt(q.levelRangeMax, 'levelRangeMax');
  if (levelRangeMaxResult && 'error' in levelRangeMaxResult) { res.status(400).json({ error: levelRangeMaxResult.error }); return; }

  const runTimeMaxResult = parsePositiveInt(q.runTimeMax, 'runTimeMax');
  if (runTimeMaxResult && 'error' in runTimeMaxResult) { res.status(400).json({ error: runTimeMaxResult.error }); return; }

  const partySizeMinResult = parsePositiveInt(q.partySizeMin, 'partySizeMin');
  if (partySizeMinResult && 'error' in partySizeMinResult) { res.status(400).json({ error: partySizeMinResult.error }); return; }

  const partySizeMaxResult = parsePositiveInt(q.partySizeMax, 'partySizeMax');
  if (partySizeMaxResult && 'error' in partySizeMaxResult) { res.status(400).json({ error: partySizeMaxResult.error }); return; }

  try {
    const locations = await customerService.browseLocations({
      difficulties: parsedDifficulties,
      setting: q.setting,
      landscapeType: q.landscapeType,
      toneTags: parsedToneTags,
      levelRangeMin: levelRangeMinResult ? (levelRangeMinResult as { value: number }).value : undefined,
      levelRangeMax: levelRangeMaxResult ? (levelRangeMaxResult as { value: number }).value : undefined,
      runTimeMax: runTimeMaxResult ? (runTimeMaxResult as { value: number }).value : undefined,
      partySizeMin: partySizeMinResult ? (partySizeMinResult as { value: number }).value : undefined,
      partySizeMax: partySizeMaxResult ? (partySizeMaxResult as { value: number }).value : undefined,
    });
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
    const profile = await customerService.getProfile(user.sub);
    if (!profile) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

protectedRouter.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const b = req.body as Record<string, unknown>;
  const { first_name, last_name, bio } = b;
  if (first_name !== undefined && (typeof first_name !== 'string' || (first_name as string).trim() === '')) {
    res.status(400).json({ error: 'first_name must be a non-empty string' }); return;
  }
  if (last_name !== undefined && (typeof last_name !== 'string' || (last_name as string).trim() === '')) {
    res.status(400).json({ error: 'last_name must be a non-empty string' }); return;
  }
  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    res.status(400).json({ error: 'bio must be a string or null' }); return;
  }
  if (first_name === undefined && last_name === undefined && bio === undefined) {
    res.status(400).json({ error: 'No valid fields to update' }); return;
  }
  try {
    const user = getUser(req);
    const updated = await customerService.updateProfile(user.sub, {
      first_name: first_name !== undefined ? (first_name as string).trim() : undefined,
      last_name: last_name !== undefined ? (last_name as string).trim() : undefined,
      bio: bio !== undefined ? (bio === null ? null : (bio as string).trim() || null) : undefined,
    });
    if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

protectedRouter.post('/profile/picture', (req: Request, res: Response, next: NextFunction) => {
  uploadProfilePic.single('image')(req, res, async (uploadErr) => {
    if (uploadErr instanceof MulterError) {
      res.status(400).json({ error: uploadErr.message });
      return;
    }
    if (uploadErr) { next(uploadErr); return; }
    if (!req.file) { res.status(400).json({ error: 'No image file provided' }); return; }
    try {
      const user = getUser(req);
      const imageUrl = `${PUBLIC_URL}/uploads/profile-pictures/${req.file.filename}`;
      const updated = await customerService.setProfilePicture(user.sub, imageUrl);
      if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
      res.json(updated);
    } catch (err) {
      fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error('Failed to clean up uploaded file:', unlinkErr); });
      next(err);
    }
  });
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
