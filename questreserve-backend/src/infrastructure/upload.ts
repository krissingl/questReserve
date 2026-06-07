import fs from 'fs';
import path from 'path';
import multer, { MulterError } from 'multer';

export const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const PROFILE_PICS_DIR = path.join(process.cwd(), 'uploads', 'profile-pictures');

export const uploadProfilePic = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(PROFILE_PICS_DIR, { recursive: true });
      cb(null, PROFILE_PICS_DIR);
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
