import { Router } from 'express';
import { authRoutes } from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

router.get('/', async (req, res) => {
  res.json({ message: 'iPass Email Auto API' });
});

export { router }; 