import { Router } from 'express';
import EmailMonitorController from '../controllers/EmailMonitorController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas para monitoramento de emails
router.post('/start', EmailMonitorController.startMonitoring);
router.post('/stop', EmailMonitorController.stopMonitoring);
router.get('/status', EmailMonitorController.getStatus);

export default router; 