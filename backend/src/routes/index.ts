import { Router } from 'express';
import authRoutes from './auth.routes';
import rulesRoutes from './rules.routes';
import emailsRoutes from './emails.routes';
import monitorRoutes from './monitor.routes';

const router = Router();

// Rota de status da API
router.get('/', (req, res) => {
  res.json({ message: 'iPass Email Auto API' });
});

// Registra as rotas
router.use('/auth', authRoutes);
router.use('/rules', rulesRoutes);
router.use('/emails', emailsRoutes);
router.use('/monitor', monitorRoutes);

export default router; 