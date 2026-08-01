import type { NextFunction, Request, Response } from 'express';
import { VuuptError } from '../services/vuupt';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof VuuptError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno inesperado.' });
}
