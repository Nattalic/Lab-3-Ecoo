import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import { Store, UpdateStoreStatusDTO } from './store.types';

//traer y ver todas las tiendas 
export const getStoresService = async (): Promise<Store[]> => {
    //trae todas las tiendas ordenadas por nombre alfabetico
    const query = `
    SELECT id, name, isopen AS "isOpen", userid AS "userId"
    FROM stores
    ORDER BY name ASC
  `;

    const result = await pool.query(query);
    return result.rows;
};

//trae solo las tiendas del usuario 
export const getMyStoresService = async (userId: string): Promise<Store[]> => {
    //retorna tiendas que pertenecen a un usuario especifico
    const query = `
    SELECT id, name, isopen AS "isOpen", userid AS "userId"
    FROM stores
    WHERE userid = $1
    ORDER BY name ASC
  `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};

//trae una tienda por su id
export const getStoreByIdService = async (storeId: string): Promise<Store> => {
    const query = `
    SELECT id, name, isopen AS "isOpen", userid AS "userId"
    FROM stores
    WHERE id = $1
  `;

    const result = await pool.query(query, [storeId]);

    //valida si la tienda existe o no
    if (result.rows.length === 0) {
        throw Boom.notFound('Store not found');
    }

    return result.rows[0];
};

//actualiza el estado de la tienda
export const updateStoreStatusService = async (
    storeId: string,
    data: UpdateStoreStatusDTO
    //$1 es true o false
): Promise<Store> => {
    const query = `
    UPDATE stores
    SET isopen = $1
    WHERE id = $2
    RETURNING id, name, isopen AS "isOpen", userid AS "userId"
  `;

    const result = await pool.query(query, [data.isOpen, storeId]);

    if (result.rows.length === 0) {
        throw Boom.notFound('Store not found :(');
    }

    return result.rows[0];
};