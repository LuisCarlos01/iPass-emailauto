import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
  sub: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        accessToken?: string;
      };
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as TokenPayload;

      // Busca o usuário e seu accessToken
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accessToken: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Adiciona os dados do usuário ao request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accessToken: user.accessToken || undefined
      };

      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 