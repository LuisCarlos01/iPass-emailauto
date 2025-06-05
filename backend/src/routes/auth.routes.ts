import { Router, Request } from 'express';
import passport from '../config/passport';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../config';
import { authMiddleware } from '../middlewares/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Estende o tipo Request para incluir a sessão
interface RequestWithSession extends Request {
  session?: {
    redirectUrl?: string;
    [key: string]: any;
  };
}

const authRoutes = Router();

// Rota para validar token
authRoutes.get('/validate', authMiddleware, (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    verify(token, config.jwtSecret);
    return res.status(200).json({ valid: true });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota para iniciar autenticação com Google
authRoutes.get('/google',
  (req: RequestWithSession, res, next) => {
    console.log('Iniciando autenticação Google...');
    const redirectUrl = req.query.redirect_url as string;
    if (redirectUrl) {
      req.session = req.session || {};
      req.session.redirectUrl = redirectUrl;
    }
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  }
);

// Callback do Google
authRoutes.get('/google/callback',
  (req: RequestWithSession, res, next) => {
    console.log('Callback do Google recebido...');
    passport.authenticate('google', { session: false },
      (err: Error | null, user: User | undefined) => {
        // Define a URL base do frontend
        const frontendUrl = config.frontendUrl;
        
        // Se houver erro ou usuário não encontrado, redireciona para o login
        if (err || !user) {
          const errorMessage = err ? err.message : 'user_not_found';
          console.error('Erro na autenticação:', errorMessage);
          return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
        }

        try {
          // Gera o token JWT
          const token = sign(
            {
              userId: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            config.jwtSecret,
            {
              subject: user.id,
              expiresIn: '1d'
            }
          );

          // Prepara os dados do usuário
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          };

          // Redireciona para a página inicial com os dados de autenticação
          console.log('URL base do frontend:', frontendUrl);
          const redirectUrl = `${frontendUrl}/dashboard?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;
          console.log('Redirecionando para:', redirectUrl);
          return res.redirect(redirectUrl);
        } catch (error) {
          console.error('Erro ao gerar token:', error);
          return res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }
      })(req, res, next);
  }
);

export { authRoutes }; 