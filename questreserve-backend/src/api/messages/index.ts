import { Router, Request, Response, NextFunction } from 'express';
import db from '../../db/db';
import { authenticate } from '../../middleware';
import { MessageRepository } from '../../repositories/message.repository';
import { BookingRepository } from '../../repositories/booking.repository';
import {
  MessageService,
  BookingNotFoundError,
  MessageNotFoundError,
  AccessDeniedError,
  CannotMarkOwnMessageReadError,
} from '../../services/message.service';
import { UnauthenticatedError } from '../../utils/errors';

const router = Router();
const messageRepo = new MessageRepository(db);
const bookingRepo = new BookingRepository(db);
const messageService = new MessageService(messageRepo, bookingRepo);

function getUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) throw new UnauthenticatedError();
  return req.user;
}

function handleMessageError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof UnauthenticatedError) {
    res.status(401).json({ error: err.message });
  } else if (err instanceof AccessDeniedError || err instanceof CannotMarkOwnMessageReadError) {
    res.status(403).json({ error: err.message });
  } else if (err instanceof BookingNotFoundError || err instanceof MessageNotFoundError) {
    res.status(404).json({ error: err.message });
  } else {
    next(err);
  }
}

router.use(authenticate);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const b = req.body as Record<string, unknown>;
  if (typeof b.bookingId !== 'string' || b.bookingId.trim() === '') {
    res.status(400).json({ error: 'bookingId is required' }); return;
  }
  if (typeof b.body !== 'string' || b.body.trim() === '') {
    res.status(400).json({ error: 'body is required' }); return;
  }
  try {
    const user = getUser(req);
    const message = await messageService.sendMessage(b.bookingId, (b.body as string).trim(), user.sub, user.type);
    res.status(201).json(message);
  } catch (err) {
    handleMessageError(err, res, next);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const bookingId = req.query.bookingId as string | undefined;
  if (!bookingId || bookingId.trim() === '') {
    res.status(400).json({ error: 'bookingId query parameter is required' }); return;
  }
  try {
    const user = getUser(req);
    const messages = await messageService.getMessages(bookingId.trim(), user.sub, user.type);
    res.json(messages);
  } catch (err) {
    handleMessageError(err, res, next);
  }
});

router.get('/inbox', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUser(req);
    const inbox = await messageService.getInbox(user.sub, user.type);
    res.json(inbox);
  } catch (err) {
    handleMessageError(err, res, next);
  }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUser(req);
    await messageService.markRead(req.params.id, user.sub, user.type);
    res.status(204).send();
  } catch (err) {
    handleMessageError(err, res, next);
  }
});

export default router;
