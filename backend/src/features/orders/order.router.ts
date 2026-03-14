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

router.post('/', authMiddleware, createOrderController);

router.get('/my', authMiddleware, getMyOrdersController);
router.get('/store', authMiddleware, getStoreOrdersController);

router.get('/available', authMiddleware, getAvailableOrdersController);
router.get('/accepted', authMiddleware, getAcceptedOrdersController);

router.get('/:id', authMiddleware, getOrderByIdController);

router.patch('/:id/accept', authMiddleware, acceptOrderController);
router.patch('/:id/decline', authMiddleware, declineOrderController);