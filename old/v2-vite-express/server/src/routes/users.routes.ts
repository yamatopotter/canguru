import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { hashPassword } from '../services/password';
import { asyncHandler } from '../utils/asyncHandler';
import { toPublicUser } from '../utils/publicUser';

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: 'ADMIN',
      active: true,
      id: excludeUserId ? { not: excludeUserId } : undefined,
    },
  });
}

usersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ users: users.map(toPublicUser) });
  }),
);

usersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const role = req.body?.role === 'ADMIN' ? 'ADMIN' : 'OPERATOR';
    const provider = req.body?.provider === 'ZOHO' ? 'ZOHO' : 'LOCAL';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || !email) {
      return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
    }

    if (provider === 'LOCAL' && password.length < 8) {
      return res
        .status(400)
        .json({ message: 'A senha deve ter pelo menos 8 caracteres para login por e-mail/senha.' });
    }

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          role,
          provider,
          passwordHash: provider === 'LOCAL' ? await hashPassword(password) : null,
        },
      });

      res.status(201).json({ user: toPublicUser(user) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });
      }
      throw error;
    }
  }),
);

usersRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const data: {
      name?: string;
      role?: 'ADMIN' | 'OPERATOR';
      active?: boolean;
      passwordHash?: string;
    } = {};

    if (typeof req.body?.name === 'string' && req.body.name.trim()) {
      data.name = req.body.name.trim();
    }

    const demotingFromAdmin = req.body?.role === 'OPERATOR' && existing.role === 'ADMIN';
    const deactivating = req.body?.active === false && existing.active;

    if ((demotingFromAdmin || deactivating) && (await countActiveAdmins(existing.id)) === 0) {
      return res.status(400).json({
        message: 'Não é possível remover o último administrador ativo do sistema.',
      });
    }

    if (req.body?.role === 'ADMIN' || req.body?.role === 'OPERATOR') {
      data.role = req.body.role;
    }

    if (typeof req.body?.active === 'boolean') {
      data.active = req.body.active;
    }

    if (typeof req.body?.password === 'string' && req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres.' });
      }
      data.passwordHash = await hashPassword(req.body.password);
    }

    const user = await prisma.user.update({ where: { id }, data });
    res.json({ user: toPublicUser(user) });
  }),
);

usersRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (existing.role === 'ADMIN' && existing.active && (await countActiveAdmins(existing.id)) === 0) {
      return res.status(400).json({
        message: 'Não é possível remover o último administrador ativo do sistema.',
      });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  }),
);
