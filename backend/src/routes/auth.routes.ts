import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const router = Router();

// Rotas de autenticação
router.get('/google', AuthController.googleAuth);
router.get('/google/callback', AuthController.googleCallback);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/validate', AuthController.validateToken);

export default router; 