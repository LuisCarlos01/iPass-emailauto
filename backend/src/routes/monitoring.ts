import { FastifyInstance } from 'fastify';
import { startMonitoring, stopMonitoring, getMonitoringStatus } from '../controllers/EmailMonitorController';
import { authenticateToken } from '../middlewares/auth';

export default async function monitoringRoutes(fastify: FastifyInstance) {
  // Middleware de autenticação para todas as rotas
  fastify.addHook('preHandler', authenticateToken);

  // Iniciar monitoramento
  fastify.post('/start', startMonitoring);

  // Parar monitoramento
  fastify.post('/stop', stopMonitoring);

  // Status do monitoramento
  fastify.get('/status', getMonitoringStatus);
} 