import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

const uploadDir = join(process.cwd(), 'uploads', 'products');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export const productImageMulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname) || '.bin';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
};
