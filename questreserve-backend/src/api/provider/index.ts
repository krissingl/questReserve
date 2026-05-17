import fs from 'fs';
import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import { BookingLocationRepository } from '../../repositories/booking-location.repository';
import { LocationImagesRepository } from '../../repositories/location-images.repository';
import { TimeSlotRepository } from '../../repositories/time-slot.repository';
import {
  ProviderService,
  LocationNotFoundError,
  LocationOwnershipError,
  SlotNotFoundError,
} from '../../services/provider.service';
import { Difficulty } from '../../types';
import { validateRequiredStrings } from '../../utils/validation';
import { UnauthenticatedError } from '../../utils/errors';

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'location-images');
const PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? 'http://localhost:3001';

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
  },
});

const router = Router();

const locationRepo = new BookingLocationRepository(db);
const locationImagesRepo = new LocationImagesRepository(db);
const slotRepo = new TimeSlotRepository(db);
const providerService = new ProviderService(locationRepo, slotRepo, db);

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'];

function getUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) throw new UnauthenticatedError();
  return req.user;
}

function handleProviderError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof UnauthenticatedError) {
    res.status(401).json({ error: err.message });
  } else if (
    err instanceof LocationNotFoundError ||
    err instanceof SlotNotFoundError ||
    err instanceof LocationOwnershipError
  ) {
    res.status(404).json({ error: 'Not found' });
  } else {
    next(err);
  }
}

router.use(authenticate, requireRole('provider'));

router.post('/locations', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateRequiredStrings(req.body, ['name', 'difficulty', 'cancellation_policy']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const b = req.body as Record<string, string | undefined>;
  if (!VALID_DIFFICULTIES.includes(b.difficulty as Difficulty)) {
    res.status(400).json({ error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` });
    return;
  }
  try {
    const location = await providerService.createLocation(getUser(req).sub, {
      name: b.name as string,
      description: b.description,
      difficulty: b.difficulty as Difficulty,
      cancellation_policy: b.cancellation_policy as string,
    });
    res.status(201).json(location);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.get('/locations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await providerService.getLocations(getUser(req).sub);
    res.json(locations);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.get('/locations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await providerService.getLocation(getUser(req).sub, req.params.id);
    res.json(location);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.patch('/locations/:id', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const b = req.body as Record<string, unknown>;
  if (b.difficulty !== undefined && (typeof b.difficulty !== 'string' || !VALID_DIFFICULTIES.includes(b.difficulty as Difficulty))) {
    res.status(400).json({ error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` });
    return;
  }
  const updates: { name?: string; description?: string; difficulty?: Difficulty; cancellation_policy?: string } = {};
  if (b.name !== undefined) {
    if (typeof b.name !== 'string') { res.status(400).json({ error: 'name must be a string' }); return; }
    updates.name = b.name;
  }
  if (b.description !== undefined) {
    if (typeof b.description !== 'string') { res.status(400).json({ error: 'description must be a string' }); return; }
    updates.description = b.description;
  }
  if (b.difficulty !== undefined) updates.difficulty = b.difficulty as Difficulty;
  if (b.cancellation_policy !== undefined) {
    if (typeof b.cancellation_policy !== 'string') { res.status(400).json({ error: 'cancellation_policy must be a string' }); return; }
    updates.cancellation_policy = b.cancellation_policy;
  }
  try {
    const location = await providerService.updateLocation(getUser(req).sub, req.params.id, updates);
    res.json(location);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.post('/locations/:id/image', (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr instanceof MulterError) {
      res.status(400).json({ error: uploadErr.message });
      return;
    }
    if (uploadErr) { next(uploadErr); return; }
    if (!req.file) { res.status(400).json({ error: 'No image file provided' }); return; }
    try {
      const imageUrl = `${PUBLIC_URL}/uploads/location-images/${req.file.filename}`;
      await providerService.setLocationImage(getUser(req).sub, req.params.id, imageUrl);
      res.json({ image_url: imageUrl });
    } catch (err) {
      if (err instanceof UnauthenticatedError) {
        res.status(401).json({ error: (err as Error).message });
      } else if (err instanceof LocationNotFoundError) {
        res.status(404).json({ error: 'Not found' });
      } else if (err instanceof LocationOwnershipError) {
        res.status(403).json({ error: 'Forbidden' });
      } else {
        next(err);
      }
    }
  });
});

router.post('/locations/:id/images', (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr instanceof MulterError) {
      res.status(400).json({ error: uploadErr.message });
      return;
    }
    if (uploadErr) { next(uploadErr); return; }
    if (!req.file) { res.status(400).json({ error: 'No image file provided' }); return; }
    try {
      const providerId = getUser(req).sub;
      const location = await providerService.getLocation(providerId, req.params.id);
      if (!location) { res.status(404).json({ error: 'Not found' }); return; }
      const imageUrl = `${PUBLIC_URL}/uploads/location-images/${req.file.filename}`;
      const displayOrder = await locationImagesRepo.nextDisplayOrder(req.params.id);
      const image = await locationImagesRepo.create({
        booking_location_id: req.params.id,
        image_url: imageUrl,
        display_order: displayOrder,
      });
      res.status(201).json(image);
    } catch (err) {
      handleProviderError(err, res, next);
    }
  });
});

router.get('/locations/:id/images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await providerService.getLocation(getUser(req).sub, req.params.id);
    const images = await locationImagesRepo.findByLocation(req.params.id);
    res.json(images);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.delete('/locations/:locationId/images/:imageId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await providerService.getLocation(getUser(req).sub, req.params.locationId);
    await locationImagesRepo.delete(req.params.imageId);
    res.status(204).send();
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await providerService.getBookings(getUser(req).sub);
    res.json(bookings);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.post('/locations/:locationId/slots', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateRequiredStrings(req.body, ['start_time', 'end_time']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const b = req.body as Record<string, string>;
  const startTime = new Date(b.start_time);
  const endTime = new Date(b.end_time);
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    res.status(400).json({ error: 'start_time and end_time must be valid ISO date strings' }); return;
  }
  try {
    const slot = await providerService.createSlot(getUser(req).sub, req.params.locationId, {
      start_time: startTime,
      end_time: endTime,
    });
    res.status(201).json(slot);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.get('/locations/:locationId/slots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await providerService.getSlots(getUser(req).sub, req.params.locationId);
    res.json(slots);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.patch('/slots/:id', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const b = req.body as Record<string, unknown>;
  const data: { start_time?: Date; end_time?: Date } = {};
  if (b.start_time !== undefined) {
    if (typeof b.start_time !== 'string') { res.status(400).json({ error: 'start_time must be a string' }); return; }
    const d = new Date(b.start_time);
    if (isNaN(d.getTime())) { res.status(400).json({ error: 'start_time must be a valid ISO date string' }); return; }
    data.start_time = d;
  }
  if (b.end_time !== undefined) {
    if (typeof b.end_time !== 'string') { res.status(400).json({ error: 'end_time must be a string' }); return; }
    const d = new Date(b.end_time);
    if (isNaN(d.getTime())) { res.status(400).json({ error: 'end_time must be a valid ISO date string' }); return; }
    data.end_time = d;
  }
  try {
    const slot = await providerService.updateSlot(getUser(req).sub, req.params.id, data);
    res.json(slot);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.delete('/slots/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await providerService.deleteSlot(getUser(req).sub, req.params.id);
    res.status(204).send();
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

export default router;
