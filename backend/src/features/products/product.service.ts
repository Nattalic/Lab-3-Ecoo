import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import { CreateProductDTO, Product, UpdateProductDTO } from '../products/product.type';

//traer todos los productos de la tienda
export const getProductsByStoreService = async (
    storeId: string
): Promise<Product[]> => {
    const query = `
    SELECT id, name, price, storeid AS "storeId"
    FROM products
    WHERE storeid = $1
    ORDER BY name ASC
  `;

    const result = await pool.query(query, [storeId]);
    return result.rows;
};

//traer producto por id
export const getProductByIdService = async (
    productId: string
): Promise<Product> => {
    const query = `
    SELECT id, name, price, storeid AS "storeId"
    FROM products
    WHERE id = $1
  `;

    const result = await pool.query(query, [productId]);

    if (result.rows.length === 0) {
        throw Boom.notFound('Product not found'); //si no lo encuentra sale este error
    }

    return result.rows[0];
};

//saber quien es el dueño del producto (delvuelve quien es el dueño del producto)
export const getProductOwnerService = async (
    productId: string
): Promise<string> => {
    //busca el producto para obtener la tienda al que pertenece y luego al usuario dueño de esa tienda
    const query = `
    SELECT s.userid
    FROM products p
    INNER JOIN stores s ON p.storeid = s.id
    WHERE p.id = $1
  `;

    const result = await pool.query(query, [productId]);

    if (result.rows.length === 0) {
        throw Boom.notFound('Product not found');
    }

    return result.rows[0].userid;
};

//crear nuevo producto
export const createProductService = async (
    data: CreateProductDTO
): Promise<Product> => {
    //selecciona la tienda
    const checkStoreQuery = `
    SELECT id
    FROM stores
    WHERE id = $1
  `;

    const checkStoreResult = await pool.query(checkStoreQuery, [data.storeId]);
    //valida que la tienda exista
    if (checkStoreResult.rows.length === 0) {
        throw Boom.notFound('Store not found');
    }

    //si existe pues inserta el producto
    const query = `
    INSERT INTO products (name, price, storeid)
    VALUES ($1, $2, $3)
    RETURNING id, name, price, storeid AS "storeId"
  `;

    const result = await pool.query(query, [data.name, data.price, data.storeId]);

    return result.rows[0];
};

//actualizar products
export const updateProductService = async (
    productId: string,
    data: UpdateProductDTO
): Promise<Product> => {
    const currentProduct = await getProductByIdService(productId);

    const updatedName = data.name ?? currentProduct.name; //sino  mandas name dejara el mismo
    const updatedPrice = data.price ?? currentProduct.price; //si no mandas precio dejara el mismo

    const query = `
    UPDATE products
    SET name = $1, price = $2
    WHERE id = $3
    RETURNING id, name, price, storeid AS "storeId"
  `;

    const result = await pool.query(query, [
        updatedName,
        updatedPrice,
        productId,
    ]);

    return result.rows[0];
};
