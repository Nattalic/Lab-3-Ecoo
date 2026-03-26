//El router define las rutas del API y a que controller llamar
//si no hay router no  hay forma de organizar ni dirigir peticion http
import { Router } from 'express';
import {
    authenticateUserController,
    createUserController,
} from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', authenticateUserController);
authRouter.post('/register', createUserController);