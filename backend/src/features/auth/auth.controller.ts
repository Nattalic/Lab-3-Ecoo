//intermediario entre el frontend y el service 
//El controller recibe la request, valida datos básicos, llama al service y devuelve la respuesta
//solo  maneja la request y el response
import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import { authenticateUserService, createUserService, } from './auth.service';
import { UserRole } from './auth.types';

export const authenticateUserController = async (
    req: Request,
    res: Response
) => {
    if (!req.body) {
        throw Boom.badRequest('Request body is required');
    }

    const { email, password } = req.body;

    if (email === undefined) {
        throw Boom.badRequest('Email is required');
    }

    if (password === undefined) {
        throw Boom.badRequest('Password is required');
    }

    const user = await authenticateUserService({ email, password });
    return res.json(user);
};

export const createUserController = async (req: Request, res: Response) => {
    if (!req.body) {
        throw Boom.badRequest('Request body is required');
    }

    const { name, email, password, role, storeName } = req.body;

    if (name === undefined) {
        throw Boom.badRequest('Name is required!');
    }

    if (email === undefined) {
        throw Boom.badRequest('Email is required!');
    }

    if (password === undefined) {
        throw Boom.badRequest('Password is required!');
    }

    if (role === undefined) {
        throw Boom.badRequest('Role is required!');
    }

    if (!Object.values(UserRole).includes(role)) {
        throw Boom.badRequest(
            `Role must be one of: ${Object.values(UserRole).join(', ')}`
        );
    }

    if (role === UserRole.STORE && storeName === undefined) {
        throw Boom.badRequest('Store name is required for store users :)');
    }

    const user = await createUserService({
        name,
        email,
        password,
        role,
        storeName,
    });

    return res.status(201).json(user);
};