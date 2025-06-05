import { Router } from 'express';
import RuleController from '../controllers/RuleController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas para gerenciamento de regras
router.post('/', RuleController.create);
router.put('/:id', RuleController.update);
router.delete('/:id', RuleController.delete);
router.get('/:id', RuleController.findById);
router.get('/', RuleController.findByUser);
router.patch('/:id/toggle', RuleController.toggleActive);
router.patch('/:id/priority', RuleController.updatePriority);

export default router; 