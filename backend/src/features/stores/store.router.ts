//El router define las rutas del API y a que controller llamar
//si no hay router no  hay forma de organizar ni dirigir peticion http
import { Router } from 'express';
import {
  getStoresController,
  getMyStoresController,
  getStoreByIdController,
  updateStoreStatusController,
} from './store.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.get('/', getStoresController);
router.get('/my', authMiddleware, getMyStoresController);
router.get('/:id', getStoreByIdController);
router.patch('/:id/status', authMiddleware, updateStoreStatusController);