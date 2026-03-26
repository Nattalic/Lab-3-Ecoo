import Boom from '@hapi/boom';
import { supabase } from '../../config/supabase';
import { pool } from '../../config/database';
import {
    AuthResponse,
    AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { AuthenticateUserDTO, CreateUserDTO, UserRole } from './auth.types';

// autenticación
export const authenticateUserService = async (
    credentials: AuthenticateUserDTO
): Promise<AuthTokenResponsePassword['data']> => {
    const signInResponse = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
    });

    if (signInResponse.error) {
        throw Boom.unauthorized(signInResponse.error.message);
    }

    return signInResponse.data;
};

// crea la info del usuario
export const createUserService = async (
    user: CreateUserDTO
): Promise<AuthResponse['data']> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingUserQuery = `
      SELECT id
      FROM users
      WHERE email = $1
    `; //$1 aqui va un valor pero lo pondre despues  (primer valor del array) evita errores

        const existingUserResult = await client.query(existingUserQuery, [user.email]);

        if (existingUserResult.rows.length > 0) {
            throw Boom.badRequest('Email already registered!');
        }

        const signUpResponse = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    name: user.name,
                    role: user.role,
                },
            },
        });

        if (signUpResponse.error) {
            throw Boom.badRequest(signUpResponse.error.message);
        }

        const authUserId = signUpResponse.data.user?.id;

        if (!authUserId) {
            throw Boom.badRequest('User could not be created in Supabase Auth');
        }

        const createUserQuery = `
      INSERT INTO users (id, name, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role
    `;

        await client.query(createUserQuery, [
            authUserId,
            user.name,
            user.email,
            user.password,
            user.role,
        ]);

        //si el rol es store, crea la tienda
        if (user.role === UserRole.STORE) {
            const createStoreQuery = `
        INSERT INTO stores (name, isopen, userid)
        VALUES ($1, $2, $3)
      `;

            await client.query(createStoreQuery, [user.storeName, false, authUserId]);
        }

        await client.query('COMMIT');

        return signUpResponse.data;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
    
};