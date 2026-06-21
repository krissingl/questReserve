import fs from 'fs';
import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import db from '../../db/db';
import { authenticate, requireRole } from '../../middleware';
import { uploadProfilePic } from '../../infrastructure/upload';
import { BookingLocationRepository } from '../../repositories/booking-location.repository';
import { LocationImagesRepository } from '../../repositories/location-images.repository';
import { TimeSlotRepository } from '../../repositories/time-slot.repository';
import {
  ProviderService,
  LocationNotFoundError,
  LocationOwnershipError,
  SlotNotFoundError,
  ImageNotFoundError,
  EmailConflictError,
  CustomerNotFoundError,
} from '../../services/provider.service';
import { BookingRepository } from '../../repositories/booking.repository';
import { Difficulty, LandscapeType, LocationSetting, LootType, BookingType, ToneTag } from '../../types';
import { validateRequiredStrings } from '../../utils/validation';
import { UnauthenticatedError } from '../../utils/errors';

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'location-images');
const PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? 'http://localhost:3001';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = MIME_TO_EXT[file.mimetype] ?? '.bin';
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
const bookingRepo = new BookingRepository(db);
const providerService = new ProviderService(locationRepo, locationImagesRepo, slotRepo, db, bookingRepo);

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'];

const RULESET_FIELDS = [
  'party_size_min', 'party_size_max', 'level_range_min', 'level_range_max',
  'landscape_type', 'setting', 'environment_tags',
  'magic_restrictions', 'class_restrictions', 'race_restrictions',
  'faction_restrictions', 'party_composition_tags', 'physical_access',
  'mount_permitted', 'familiar_permitted', 'solo_permitted', 'booking_type',
  'tone_tags', 'gore_level', 'non_lethal_mode', 'permadeath_risk',
  'primary_focus', 'boss_encounter', 'pvp_permitted', 'scouting_permitted',
  'run_time_minutes', 'reset_time_hours', 'time_limit_minutes',
  'has_safe_room', 'has_merchant', 'equipment_provided', 'guide_provided',
  'loot_type', 'boss_loot', 'unique_item_chance',
] as const;

function extractRulesetFields(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of RULESET_FIELDS) {
    if (field in body) result[field] = body[field];
  }
  return result;
}

const VALID_LANDSCAPE_TYPES: LandscapeType[] = ['tundra', 'forest', 'desert', 'cave', 'coastal', 'volcanic', 'urban', 'plains', 'mountain', 'swamp'];
const VALID_SETTINGS: LocationSetting[] = ['interior', 'exterior'];
const VALID_LOOT_TYPES: LootType[] = ['guaranteed', 'random', 'none'];
const VALID_BOOKING_TYPES: BookingType[] = ['concurrent', 'exclusive'];
const VALID_TONE_TAGS: ToneTag[] = ['horror', 'heroic', 'comedic', 'mystery', 'political'];

const RULESET_BOOLEAN_FIELDS = [
  'mount_permitted', 'familiar_permitted', 'solo_permitted',
  'non_lethal_mode', 'permadeath_risk', 'boss_encounter',
  'pvp_permitted', 'scouting_permitted', 'has_safe_room',
  'has_merchant', 'equipment_provided', 'guide_provided',
  'boss_loot', 'unique_item_chance',
] as const;

const RULESET_INTEGER_FIELDS: Array<{ field: string; min: number; max: number }> = [
  { field: 'party_size_min', min: 1, max: 999 },
  { field: 'party_size_max', min: 1, max: 999 },
  { field: 'level_range_min', min: 1, max: 9999 },
  { field: 'level_range_max', min: 1, max: 9999 },
  { field: 'gore_level', min: 0, max: 3 },
  { field: 'primary_focus', min: -5, max: 5 },
  { field: 'run_time_minutes', min: 1, max: 99999 },
  { field: 'reset_time_hours', min: 0, max: 9999 },
  { field: 'time_limit_minutes', min: 1, max: 99999 },
];

const RULESET_STRING_ARRAY_FIELDS = [
  'environment_tags', 'magic_restrictions', 'class_restrictions',
  'race_restrictions', 'faction_restrictions', 'party_composition_tags',
  'physical_access', 'tone_tags',
] as const;

function validateRulesetFields(fields: Record<string, unknown>): string | null {
  if ('landscape_type' in fields && fields.landscape_type !== null && !VALID_LANDSCAPE_TYPES.includes(fields.landscape_type as LandscapeType)) {
    return `landscape_type must be one of: ${VALID_LANDSCAPE_TYPES.join(', ')}`;
  }
  if ('setting' in fields && fields.setting !== null && !VALID_SETTINGS.includes(fields.setting as LocationSetting)) {
    return `setting must be one of: ${VALID_SETTINGS.join(', ')}`;
  }
  if ('loot_type' in fields && fields.loot_type !== null && !VALID_LOOT_TYPES.includes(fields.loot_type as LootType)) {
    return `loot_type must be one of: ${VALID_LOOT_TYPES.join(', ')}`;
  }
  if ('booking_type' in fields && fields.booking_type !== null && !VALID_BOOKING_TYPES.includes(fields.booking_type as BookingType)) {
    return `booking_type must be one of: ${VALID_BOOKING_TYPES.join(', ')}`;
  }

  for (const boolField of RULESET_BOOLEAN_FIELDS) {
    if (boolField in fields && typeof fields[boolField] !== 'boolean') {
      return `${boolField} must be a boolean`;
    }
  }

  for (const { field, min, max } of RULESET_INTEGER_FIELDS) {
    if (field in fields && fields[field] !== null) {
      const val = fields[field];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < min || val > max) {
        return `${field} must be an integer between ${min} and ${max}`;
      }
    }
  }

  if ('tone_tags' in fields && fields.tone_tags !== null) {
    if (!Array.isArray(fields.tone_tags) || !(fields.tone_tags as unknown[]).every((t) => VALID_TONE_TAGS.includes(t as ToneTag))) {
      return `tone_tags must be an array of: ${VALID_TONE_TAGS.join(', ')}`;
    }
  }

  for (const arrField of RULESET_STRING_ARRAY_FIELDS) {
    if (arrField === 'tone_tags') continue;
    if (arrField in fields && fields[arrField] !== null) {
      if (!Array.isArray(fields[arrField]) || !(fields[arrField] as unknown[]).every((v) => typeof v === 'string')) {
        return `${arrField} must be an array of strings`;
      }
    }
  }

  return null;
}

function getUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) throw new UnauthenticatedError();
  return req.user;
}

function handleProviderError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof UnauthenticatedError) {
    res.status(401).json({ error: err.message });
  } else if (err instanceof EmailConflictError) {
    res.status(409).json({ error: err.message });
  } else if (
    err instanceof LocationNotFoundError ||
    err instanceof LocationOwnershipError ||
    err instanceof SlotNotFoundError ||
    err instanceof ImageNotFoundError ||
    err instanceof CustomerNotFoundError
  ) {
    res.status(404).json({ error: 'Not found' });
  } else {
    next(err);
  }
}

router.use(authenticate, requireRole('provider'));

router.get('/dashboard/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await providerService.getDashboardStats(getUser(req).sub);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await providerService.getProfile(getUser(req).sub);
    if (!profile) { res.status(404).json({ error: 'Provider not found' }); return; }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.body !== 'object' || req.body === null) {
    res.status(400).json({ error: 'Request body must be a JSON object' }); return;
  }
  const b = req.body as Record<string, unknown>;

  if (b.email !== undefined) {
    if (typeof b.email !== 'string' || b.email.trim() === '') {
      res.status(400).json({ error: 'email must be a non-empty string' }); return;
    }
    const trimmedEmail = b.email.trim();
    const atIndex = trimmedEmail.indexOf('@');
    if (atIndex < 1 || !trimmedEmail.slice(atIndex + 1).includes('.') || trimmedEmail.endsWith('.')) {
      res.status(400).json({ error: 'email must be a valid email address' }); return;
    }
  }

  const { first_name, last_name, organization_name, bio } = b;
  if (first_name !== undefined && (typeof first_name !== 'string' || (first_name as string).trim() === '')) {
    res.status(400).json({ error: 'first_name must be a non-empty string' }); return;
  }
  if (last_name !== undefined && (typeof last_name !== 'string' || (last_name as string).trim() === '')) {
    res.status(400).json({ error: 'last_name must be a non-empty string' }); return;
  }
  if (organization_name !== undefined && organization_name !== null && typeof organization_name !== 'string') {
    res.status(400).json({ error: 'organization_name must be a string or null' }); return;
  }
  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    res.status(400).json({ error: 'bio must be a string or null' }); return;
  }

  const hasUpdate = b.email !== undefined || first_name !== undefined || last_name !== undefined || organization_name !== undefined || bio !== undefined;
  if (!hasUpdate) {
    res.status(400).json({ error: 'No valid fields to update' }); return;
  }

  try {
    const updated = await providerService.updateProfile(getUser(req).sub, {
      email: b.email !== undefined ? (b.email as string).trim() : undefined,
      first_name: first_name !== undefined ? (first_name as string).trim() : undefined,
      last_name: last_name !== undefined ? (last_name as string).trim() : undefined,
      organization_name: organization_name !== undefined ? (organization_name as string | null) : undefined,
      bio: bio !== undefined ? (bio === null ? null : (bio as string).trim() || null) : undefined,
    });
    if (!updated) { res.status(404).json({ error: 'Provider not found' }); return; }
    res.json(updated);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.post('/profile/picture', (req: Request, res: Response, next: NextFunction) => {
  uploadProfilePic.single('image')(req, res, async (uploadErr) => {
    if (uploadErr instanceof MulterError) {
      res.status(400).json({ error: uploadErr.message });
      return;
    }
    if (uploadErr) { next(uploadErr); return; }
    if (!req.file) { res.status(400).json({ error: 'No image file provided' }); return; }
    try {
      const imageUrl = `${PUBLIC_URL}/uploads/profile-pictures/${req.file.filename}`;
      const updated = await providerService.setProfilePicture(getUser(req).sub, imageUrl);
      if (!updated) { res.status(404).json({ error: 'Provider not found' }); return; }
      res.json(updated);
    } catch (err) {
      fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error('Failed to clean up uploaded file:', unlinkErr); });
      next(err);
    }
  });
});

router.post('/locations', async (req: Request, res: Response, next: NextFunction) => {
  const validationError = validateRequiredStrings(req.body, ['name', 'difficulty', 'cancellation_policy']);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const b = req.body as Record<string, unknown>;
  if (!VALID_DIFFICULTIES.includes(b.difficulty as Difficulty)) {
    res.status(400).json({ error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` });
    return;
  }
  const rulesetFields = extractRulesetFields(b);
  const rulesetError = validateRulesetFields(rulesetFields);
  if (rulesetError) { res.status(400).json({ error: rulesetError }); return; }
  try {
    const location = await providerService.createLocation(getUser(req).sub, {
      name: b.name as string,
      description: b.description as string | undefined,
      difficulty: b.difficulty as Difficulty,
      cancellation_policy: b.cancellation_policy as string,
      ...rulesetFields,
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
  const updates: Record<string, unknown> = {};
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
  const rulesetFields = extractRulesetFields(b);
  const rulesetError = validateRulesetFields(rulesetFields);
  if (rulesetError) { res.status(400).json({ error: rulesetError }); return; }
  Object.assign(updates, rulesetFields);
  try {
    const location = await providerService.updateLocation(getUser(req).sub, req.params.id, updates as import('../../services/provider.service').UpdateLocationInput);
    res.json(location);
  } catch (err) {
    handleProviderError(err, res, next);
  }
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
      const imageUrl = `${PUBLIC_URL}/uploads/location-images/${req.file.filename}`;
      const image = await providerService.addLocationImage(getUser(req).sub, req.params.id, imageUrl);
      res.status(201).json(image);
    } catch (err) {
      fs.unlink(req.file.path, (unlinkErr) => { if (unlinkErr) console.error('Failed to clean up uploaded file:', unlinkErr); });
      handleProviderError(err, res, next);
    }
  });
});

router.get('/locations/:id/images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const images = await providerService.getLocationImages(getUser(req).sub, req.params.id);
    res.json(images);
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

router.delete('/locations/:locationId/images/:imageId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await providerService.deleteLocationImage(getUser(req).sub, req.params.locationId, req.params.imageId);
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

router.get('/customers/:customerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await providerService.getCustomerProfile(getUser(req).sub, req.params.customerId);
    res.json(profile);
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


router.delete('/slots/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await providerService.deleteSlot(getUser(req).sub, req.params.id);
    res.status(204).send();
  } catch (err) {
    handleProviderError(err, res, next);
  }
});

export default router;
