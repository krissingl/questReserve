import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { BookingLocationRepository } from '../../repositories/booking-location.repository';
import { BookingRepository } from '../../repositories/booking.repository';
import { LocationImagesRepository } from '../../repositories/location-images.repository';
import { ProviderRepository } from '../../repositories/provider.repository';
import { TimeSlotRepository } from '../../repositories/time-slot.repository';
import { ProviderService } from '../../services/provider.service';

const router = Router();

const locationRepo = new BookingLocationRepository(db);
const locationImagesRepo = new LocationImagesRepository(db);
const slotRepo = new TimeSlotRepository(db);
const bookingRepo = new BookingRepository(db);
const providerRepo = new ProviderRepository(db);
const providerService = new ProviderService(locationRepo, locationImagesRepo, slotRepo, db, bookingRepo, providerRepo);

router.get('/providers/:id/public', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await providerService.getPublicProfile(req.params.id);
    if (!profile) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
