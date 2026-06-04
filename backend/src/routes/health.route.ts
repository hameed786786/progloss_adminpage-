import { Router } from 'express';
import mongoose from '../config/database';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', (_req, res) => sendSuccess(res, { service: 'progloss-backend' }));

router.get('/db', (_req, res) => {
  const readyState = mongoose.connection.readyState;
  return sendSuccess(res, {
    database: {
      connected: readyState === 1,
      readyState,
      name: mongoose.connection.name ?? null,
      host: mongoose.connection.host ?? null
    }
  });
});

export default router;