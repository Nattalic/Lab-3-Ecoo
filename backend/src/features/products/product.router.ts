//El router define las rutas del API y a que controller llamar
//si no hay router no  hay forma de organizar ni dirigir peticion http
import { Router } from 'express';
import {
    createProductController,
    getProductByIdController,
    getProductsByStoreController,
    updateProductController,
} from './product.controller';
//proeger las rutas
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.get('/store/:storeId', getProductsByStoreController);
router.get('/:id', getProductByIdController);
router.post('/', authMiddleware, createProductController);
router.patch('/:id', authMiddleware, updateProductController);
