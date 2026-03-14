import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
    getStoresService,
    getMyStoresService,
    getStoreByIdService,
    updateStoreStatusService,
} from './store.service';
import {
    AuthenticatedRequest,
    getUserFromRequest,
} from '../../middlewares/authMiddleware';

export const getStoresController = async (req: Request, res: Response) => {
    const stores = await getStoresService();
    return res.json(stores);
};

export const getMyStoresController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const authUser = getUserFromRequest(req);
    const stores = await getMyStoresService(authUser.id);

    return res.json(stores);
};

export const getStoreByIdController = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Store id is required!');
    }

    const store = await getStoreByIdService(id);
    return res.json(store);
};

export const updateStoreStatusController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Store id is required!');
    }

    if (!req.body) {
        throw Boom.badRequest('Request body is required!');
    }

    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
        throw Boom.badRequest('isOpen must be a boolean!');
    }

    const authUser = getUserFromRequest(req);
    const store = await getStoreByIdService(id);

    if (store.userId !== authUser.id) {
        throw Boom.forbidden('You are not allowed to update this store :(');
    }

    const updatedStore = await updateStoreStatusService(id, { isOpen });

    return res.json(updatedStore);
};