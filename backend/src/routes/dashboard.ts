import { FastifyInstance } from 'fastify';
import { dashboardController } from '../controllers/dashboard';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    await request.jwtVerify();
  });

  app.get('/stats', dashboardController.getStats);
} 