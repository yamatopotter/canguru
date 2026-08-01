import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../services/jwt';
import type { AuthProviderName, Role } from '../types';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: AuthProviderName;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  try {
    const payload = verifySessionToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Sessão inválida.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      provider: user.provider as AuthProviderName,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Sessão expirada ou inválida.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }
  next();
}
