import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
    acceptOrderService,
    createOrderService,
    declineOrderService,
    getAcceptedOrdersService,
    getAvailableOrdersService,
    getMyOrdersService,
    getOrderByIdService,
    getOrderItemsService,
    getStoreOrdersService,
} from './order.service';
import {
    AuthenticatedRequest,
    getUserFromRequest,
} from '../../middlewares/authMiddleware';

export const createOrderController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    if (!req.body) {
        throw Boom.badRequest('Request body is required!');
    }

    const { storeId, items } = req.body;

    if (!storeId) {
        throw Boom.badRequest('Store id is required!');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw Boom.badRequest('Items are required!');
    }

    const authUser = getUserFromRequest(req);

    const order = await createOrderService(authUser.id, {
        storeId,
        items,
    });

    return res.status(201).json(order);
};

export const getMyOrdersController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const authUser = getUserFromRequest(req);
    const orders = await getMyOrdersService(authUser.id);

    return res.json(orders);
};

export const getStoreOrdersController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const authUser = getUserFromRequest(req);
    const orders = await getStoreOrdersService(authUser.id);

    return res.json(orders);
};

export const getAvailableOrdersController = async (
    req: Request,
    res: Response
) => {
    const orders = await getAvailableOrdersService();
    return res.json(orders);
};

export const getAcceptedOrdersController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const authUser = getUserFromRequest(req);
    const orders = await getAcceptedOrdersService(authUser.id);

    return res.json(orders);
};

export const getOrderByIdController = async (
    req: Request,
    res: Response
) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Order id is required!');
    }

    const order = await getOrderByIdService(id);
    const items = await getOrderItemsService(id);

    return res.json({
        ...order,
        items,
    });
};

export const acceptOrderController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Order id is required!');
    }

    const authUser = getUserFromRequest(req);
    const order = await acceptOrderService(id, authUser.id);

    return res.json(order);
};

export const declineOrderController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Order id is required!');
    }

    const order = await declineOrderService(id);

    return res.json({
        message: 'Order declined :(',
        order,
    });
};