//El router define las rutas del API y a que controller llamar
//si no hay router no  hay forma de organizar ni dirigir peticion http
import { Router } from 'express';
import {
    acceptOrderController,
    createOrderController,
    declineOrderController,
    getAcceptedOrdersController,
    getAvailableOrdersController,
    getMyOrdersController,
    getOrderByIdController,
    getStoreOrdersController,
} from './order.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.post('/', authMiddleware, createOrderController); //publicar crear

router.get('/my', authMiddleware, getMyOrdersController);
router.get('/store', authMiddleware, getStoreOrdersController);

router.get('/available', authMiddleware, getAvailableOrdersController);
router.get('/accepted', authMiddleware, getAcceptedOrdersController);

router.get('/:id', authMiddleware, getOrderByIdController); //traer

router.patch('/:id/accept', authMiddleware, acceptOrderController); //actualizar
router.patch('/:id/decline', authMiddleware, declineOrderController);