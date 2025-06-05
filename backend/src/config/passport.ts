import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../database/prismaClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  googleId?: string;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      googleId?: string;
    }
  }
}

passport.serializeUser((user: User, done) => {
  console.log('Serializando usuário:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('Deserializando usuário:', id);
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    console.error('Erro ao deserializar usuário:', error);
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3333/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Perfil Google recebido:', profile);
        
        // Verifica se o usuário já existe pelo email
        let user = await prisma.user.findUnique({
          where: { email: profile.emails?.[0].value }
        });

        if (user) {
          console.log('Usuário encontrado:', user);
          return done(null, user);
        }

        // Se não existir, retorna erro pois só permitimos o usuário pré-cadastrado
        console.error('Usuário não autorizado');
        return done(new Error('Usuário não autorizado'), undefined);

      } catch (error) {
        console.error('Erro na autenticação Google:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport; 