import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export default async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // Buscar usuário pelo email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      // Gerar token JWT
      const token = app.jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        {
          expiresIn: '7d'
        }
      );

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados de login inválidos' });
      }
      console.error('Erro no login:', error);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/register', async (request, reply) => {
    // TODO: Implementar lógica de registro
    return { message: 'Register route' };
  });
} 