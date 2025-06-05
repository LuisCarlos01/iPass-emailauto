import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

class AuthController {
  async googleAuth(req: Request, res: Response) {
    const scopes = [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.labels'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.redirect(url);
  }

  async googleCallback(req: Request, res: Response) {
    const { code } = req.query;

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('No payload from Google');
      }

      // Busca ou cria o usuário
      const user = await prisma.user.upsert({
        where: { email: payload.email! },
        update: {
          name: payload.name!,
          avatar: payload.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        },
        create: {
          email: payload.email!,
          name: payload.name!,
          avatar: payload.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        }
      });

      // Gera o JWT
      const jwt = sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        process.env.JWT_SECRET!,
        {
          subject: user.id,
          expiresIn: process.env.JWT_EXPIRATION || '1d'
        }
      );

      // Redireciona para o frontend com o token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwt}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const user = await prisma.user.findFirst({
        where: { refreshToken }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Atualiza os tokens do usuário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || user.refreshToken
        }
      });

      // Gera novo JWT
      const jwt = sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        process.env.JWT_SECRET!,
        {
          subject: user.id,
          expiresIn: process.env.JWT_EXPIRATION || '1d'
        }
      );

      return res.json({ token: jwt });
    } catch (error) {
      console.error('Error refreshing token:', error);
      return res.status(500).json({ error: 'Error refreshing token' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Limpa os tokens do usuário
      await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: null,
          refreshToken: null
        }
      });

      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out:', error);
      return res.status(500).json({ error: 'Error logging out' });
    }
  }

  async validateToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }

      const decoded = verify(token, process.env.JWT_SECRET!);
      return res.json({ valid: true, decoded });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

export default new AuthController(); 