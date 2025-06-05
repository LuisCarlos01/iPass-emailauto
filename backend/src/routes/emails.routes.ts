import { Router } from 'express';
import EmailProcessorController from '../controllers/EmailProcessorController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas para processamento de emails
router.post('/process', EmailProcessorController.processEmail);
router.get('/logs', EmailProcessorController.getEmailLogs);

export default router; 