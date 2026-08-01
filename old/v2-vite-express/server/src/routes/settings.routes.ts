import path from 'node:path';
import fs from 'node:fs/promises';
import { Router } from 'express';
import multer from 'multer';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { getPublicSettings, getSetting, maskToken, setSetting, SETTING_KEYS } from '../services/settings';

const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const ALLOWED_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname) || '.png';
      callback(null, `logo-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_LOGO_TYPES.has(file.mimetype)) {
      callback(new Error('Formato de imagem não suportado. Use PNG, JPEG, WEBP ou SVG.'));
      return;
    }
    callback(null, true);
  },
});

export const publicSettingsRouter = Router();

publicSettingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await getPublicSettings());
  }),
);

export const adminSettingsRouter = Router();

adminSettingsRouter.use(requireAuth, requireAdmin);

adminSettingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [companyName, logoUrl, vuuptToken] = await Promise.all([
      getSetting(SETTING_KEYS.companyName),
      getSetting(SETTING_KEYS.companyLogoPath),
      getSetting(SETTING_KEYS.vuuptApiToken),
    ]);

    res.json({
      companyName,
      logoUrl: logoUrl || null,
      vuuptTokenConfigured: Boolean(vuuptToken),
      vuuptTokenMasked: maskToken(vuuptToken),
    });
  }),
);

adminSettingsRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    if (typeof req.body?.companyName === 'string' && req.body.companyName.trim()) {
      await setSetting(SETTING_KEYS.companyName, req.body.companyName.trim());
    }

    if (typeof req.body?.vuuptApiToken === 'string' && req.body.vuuptApiToken.trim()) {
      await setSetting(SETTING_KEYS.vuuptApiToken, req.body.vuuptApiToken.trim());
    }

    const [companyName, vuuptToken] = await Promise.all([
      getSetting(SETTING_KEYS.companyName),
      getSetting(SETTING_KEYS.vuuptApiToken),
    ]);

    res.json({
      companyName,
      vuuptTokenConfigured: Boolean(vuuptToken),
      vuuptTokenMasked: maskToken(vuuptToken),
    });
  }),
);

adminSettingsRouter.post(
  '/logo',
  upload.single('logo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const previousPath = await getSetting(SETTING_KEYS.companyLogoPath);
    const logoUrl = `/uploads/${req.file.filename}`;
    await setSetting(SETTING_KEYS.companyLogoPath, logoUrl);

    if (previousPath) {
      const previousFile = path.join(UPLOADS_DIR, path.basename(previousPath));
      fs.unlink(previousFile).catch(() => {
        // arquivo antigo pode já não existir; não é um erro fatal
      });
    }

    res.json({ logoUrl });
  }),
);
