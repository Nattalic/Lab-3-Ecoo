//intermediario entre el frontend y el service 
//El controller recibe la request, valida datos básicos, llama al service y devuelve la respuesta
//solo  maneja la request y el response
import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
    createProductService,
    getProductByIdService,
    getProductsByStoreService,
    getProductOwnerService,
    updateProductService,
} from './product.service';
import {
    AuthenticatedRequest,
    getUserFromRequest,
} from '../../middlewares/authMiddleware';
import { getStoreByIdService } from '../stores/store.service';

export const getProductsByStoreController = async (
    req: Request,
    res: Response
) => {
    const storeId = Array.isArray(req.params.storeId)
        ? req.params.storeId[0]
        : req.params.storeId;

    if (!storeId) {
        throw Boom.badRequest('Store id is required');
    }

    const products = await getProductsByStoreService(storeId);
    return res.json(products);
};

export const getProductByIdController = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Product id is required');
    }

    const product = await getProductByIdService(id);
    return res.json(product);
};

export const createProductController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    if (!req.body) {
        throw Boom.badRequest('Request body is required');
    }

    const { name, price, storeId } = req.body;

    if (!name) {
        throw Boom.badRequest('Name is required');
    }

    if (price === undefined) {
        throw Boom.badRequest('Price is required');
    }

    if (typeof price !== 'number') {
        throw Boom.badRequest('Price must be a number');
    }

    if (!storeId) {
        throw Boom.badRequest('Store id is required');
    }

    const authUser = getUserFromRequest(req);
    const store = await getStoreByIdService(storeId);

    if (store.userId !== authUser.id) {
        throw Boom.forbidden('You are not allowed to create products for this store');
    }

    const product = await createProductService({
        name,
        price,
        storeId,
    });

    return res.status(201).json(product);
};

export const updateProductController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        throw Boom.badRequest('Product id is required');
    }

    if (!req.body) {
        throw Boom.badRequest('Request body is required');
    }

    const { name, price } = req.body;

    if (name === undefined && price === undefined) {
        throw Boom.badRequest('At least one field must be provided');
    }

    if (price !== undefined && typeof price !== 'number') {
        throw Boom.badRequest('Price must be a number');
    }

    const authUser = getUserFromRequest(req);
    const ownerUserId = await getProductOwnerService(id);

    if (ownerUserId !== authUser.id) {
        throw Boom.forbidden('You are not allowed to update this product');
    }

    const product = await updateProductService(id, { name, price });

    return res.json(product);
};
