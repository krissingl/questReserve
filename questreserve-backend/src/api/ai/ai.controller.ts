import { Request, Response } from 'express';
import { callClaude } from '../../ai/claude.client';
import { WILL_SYSTEM_PROMPT, parseWillResponse } from '../../ai/will.prompt';

const WILL_FALLBACK_MESSAGE = "The mist grows thick… I've lost the thread. Speak to me again, traveler.";
const MAX_MESSAGE_LENGTH = 500;

export async function locationFilter(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const { message } = body;

  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required and must be a non-empty string' });
    return;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: `message must not exceed ${MAX_MESSAGE_LENGTH} characters` });
    return;
  }

  try {
    const rawResponse = await callClaude({
      system: WILL_SYSTEM_PROMPT,
      user: message,
    });

    const willResponse = parseWillResponse(rawResponse);
    res.json(willResponse);
  } catch {
    res.json({ message: WILL_FALLBACK_MESSAGE, filters: {} });
  }
}
