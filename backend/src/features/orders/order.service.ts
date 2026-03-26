//logica
import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import {
    CreateOrderDTO,
    Order,
    OrderItem,
    OrderStatus,
} from './order.types';

//crear orden
export const createOrderService = async (
    consumerId: string, //el que compra
    data: CreateOrderDTO //info de la orden
): Promise<Order> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (!data.items || data.items.length === 0) {
            throw Boom.badRequest('Order must contain at least one item!');
        }

        //selecciona la tienda
        const storeQuery = `
      SELECT id
      FROM stores
      WHERE id = $1
    `;
        const storeResult = await client.query(storeQuery, [data.storeId]);

        //valida si existe o no
        if (storeResult.rows.length === 0) {
            throw Boom.notFound('Store not found');
        }

        //valida que seleccione mas de 1 producto no 0
        for (const item of data.items) {
            if (item.quantity <= 0) {
                throw Boom.badRequest('Quantity must be greater than 0!');
            }

            //selecciona productos
            const productQuery = `
        SELECT id, storeid
        FROM products
        WHERE id = $1
      `;
            const productResult = await client.query(productQuery, [item.productId]);
            
            //valida si el producto seleccionado existe
            if (productResult.rows.length === 0) {
                throw Boom.notFound(`Product not found: ${item.productId}`);
            }

            const product = productResult.rows[0];

            //productos solo de una tienda
            if (product.storeid !== data.storeId) {
                throw Boom.badRequest('All products must belong to the selected store!');
            }
        }

        //crea la orden
        const createOrderQuery = `
      INSERT INTO orders (consumerid, storeid, deliveryid, createdat, status)
      VALUES ($1, $2, $3, NOW(), $4)
      RETURNING
        id,
        consumerid AS "consumerId",
        storeid AS "storeId",
        deliveryid AS "deliveryId",
        createdat AS "createdAt",
        status
    `;

        const orderResult = await client.query(createOrderQuery, [
            consumerId,
            data.storeId,
            null,
            OrderStatus.PENDING,
        ]);

        const order = orderResult.rows[0];

        //guarda los productos de la orden en order_items
        for (const item of data.items) {
            const createOrderItemQuery = `
        INSERT INTO order_items (orderid, productid, quantity)
        VALUES ($1, $2, $3)
      `;

            await client.query(createOrderItemQuery, [
                order.id,
                item.productId,
                item.quantity,
            ]);
        }

        //verificar que todo salio bien
        await client.query('COMMIT');
        return order;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

//trae mis ordenes (ordenes del consumidor)
export const getMyOrdersService = async (consumerId: string): Promise<any[]> => {
    //selecciona la orden
    const ordersQuery = `
    SELECT
      id,
      consumerid AS "consumerId",
      storeid AS "storeId",
      deliveryid AS "deliveryId",
      createdat AS "createdAt",
      status
    FROM orders
    WHERE consumerid = $1
    ORDER BY createdat DESC
  `;

    const ordersResult = await pool.query(ordersQuery, [consumerId]);
    const orders = ordersResult.rows;

    const fullOrders = [];

    //tienda de donde viene la orden
    for (const order of orders) {
        const storeQuery = `
      SELECT
        id,
        name
      FROM stores
      WHERE id = $1
    `;

        const storeResult = await pool.query(storeQuery, [order.storeId]);
        const store = storeResult.rows[0] || null;

        //items de la orden
        const itemsQuery = `
      SELECT
        oi.id,
        oi.orderid AS "orderId",
        oi.productid AS "productId",
        oi.quantity,
        p.id AS "productRealId",
        p.name AS "productName",
        p.price AS "productPrice"
      FROM order_items oi
      INNER JOIN products p ON oi.productid = p.id
      WHERE oi.orderid = $1
    `;

        const itemsResult = await pool.query(itemsQuery, [order.id]);

        const orderItems = itemsResult.rows.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            products: {
                id: item.productRealId,
                name: item.productName,
                price: item.productPrice,
            },
        }));

        fullOrders.push({
            ...order,
            stores: store
                ? {
                    id: store.id,
                    name: store.name,
                }
                : null,
            order_items: orderItems,
        });
    }

    return fullOrders;
};

//traer las ordenes de una tienda
export const getStoreOrdersService = async (userId: string): Promise<any[]> => {
    //selecciona orden de la tienda
    const ordersQuery = `
    SELECT
      o.id,
      o.consumerid AS "consumerId",
      o.storeid AS "storeId",
      o.deliveryid AS "deliveryId",
      o.createdat AS "createdAt",
      o.status
    FROM orders o
    INNER JOIN stores s ON o.storeid = s.id
    WHERE s.userid = $1
    ORDER BY o.createdat DESC
  `;

    const ordersResult = await pool.query(ordersQuery, [userId]);
    const orders = ordersResult.rows;

    const fullOrders = [];

    for (const order of orders) {
        const itemsQuery = `
      SELECT
        oi.id,
        oi.orderid AS "orderId",
        oi.productid AS "productId",
        oi.quantity,
        p.id AS "productRealId",
        p.name AS "productName",
        p.price AS "productPrice"
      FROM order_items oi
      INNER JOIN products p ON oi.productid = p.id
      WHERE oi.orderid = $1
    `;

        const itemsResult = await pool.query(itemsQuery, [order.id]);

        const orderItems = itemsResult.rows.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            products: {
                id: item.productRealId,
                name: item.productName,
                price: item.productPrice,
            },
        }));

        fullOrders.push({
            ...order,
            order_items: orderItems,
        });
    }

    return fullOrders;
};

//traer las ordenes disponibñes para el delivery
export const getAvailableOrdersService = async (): Promise<any[]> => {
    //selecciona la orden el consumidor
    const ordersQuery = `
    SELECT
      id,
      consumerid AS "consumerId",
      storeid AS "storeId",
      deliveryid AS "deliveryId",
      createdat AS "createdAt",
      status
    FROM orders
    WHERE status = $1
      AND deliveryid IS NULL
    ORDER BY createdat DESC
  `;

    const ordersResult = await pool.query(ordersQuery, [OrderStatus.PENDING]);
    const orders = ordersResult.rows;

    const fullOrders = [];

    for (const order of orders) {
        const storeQuery = `
      SELECT
        id,
        name
      FROM stores
      WHERE id = $1
    `;

        const storeResult = await pool.query(storeQuery, [order.storeId]);
        const store = storeResult.rows[0] || null;

        //que items tiene la orden
        const itemsQuery = `
      SELECT
        oi.id,
        oi.orderid AS "orderId",
        oi.productid AS "productId",
        oi.quantity,
        p.id AS "productRealId",
        p.name AS "productName",
        p.price AS "productPrice"
      FROM order_items oi
      INNER JOIN products p ON oi.productid = p.id
      WHERE oi.orderid = $1
    `;

        const itemsResult = await pool.query(itemsQuery, [order.id]);

        const orderItems = itemsResult.rows.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            products: {
                id: item.productRealId,
                name: item.productName,
                price: item.productPrice,
            },
        }));

        fullOrders.push({
            ...order,
            stores: store
                ? {
                    id: store.id,
                    name: store.name,
                }
                : null,
            order_items: orderItems,
        });
    }

    return fullOrders;
};

//trae las ordenes que acepto el delivery
export const getAcceptedOrdersService = async (
    deliveryId: string
): Promise<any[]> => {
    const ordersQuery = `
    SELECT
      id,
      consumerid AS "consumerId",
      storeid AS "storeId",
      deliveryid AS "deliveryId",
      createdat AS "createdAt",
      status
    FROM orders
    WHERE deliveryid = $1
      AND status = $2
    ORDER BY createdat DESC
  `;

    const ordersResult = await pool.query(ordersQuery, [
        deliveryId,
        OrderStatus.ACCEPTED,
    ]);
    const orders = ordersResult.rows;

    const fullOrders = [];

    for (const order of orders) {
        const storeQuery = `
      SELECT
        id,
        name
      FROM stores
      WHERE id = $1
    `;

        const storeResult = await pool.query(storeQuery, [order.storeId]);
        const store = storeResult.rows[0] || null;

        //o ó p son alias, sirven para simplificar la consulta y evitar ambiguedades
        const itemsQuery = `
      SELECT
        oi.id,
        oi.orderid AS "orderId",
        oi.productid AS "productId",
        oi.quantity,
        p.id AS "productRealId",
        p.name AS "productName",
        p.price AS "productPrice"
      FROM order_items oi
      INNER JOIN products p ON oi.productid = p.id
      WHERE oi.orderid = $1
    `;

        const itemsResult = await pool.query(itemsQuery, [order.id]);

        const orderItems = itemsResult.rows.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId, //el id guardado en la orden
            quantity: item.quantity,
            products: {
                id: item.productRealId, //el id del producto con toda su info
                name: item.productName,
                price: item.productPrice,
            },
        }));

        fullOrders.push({
            ...order,
            stores: store
                ? {
                    id: store.id,
                    name: store.name,
                }
                : null,
            order_items: orderItems,
        });
    }

    return fullOrders;
};

//busca orden por su id 
export const getOrderByIdService = async (orderId: string): Promise<Order> => {
    //Selecciona orden por su id
    const query = `
    SELECT
      id,
      consumerid AS "consumerId",
      storeid AS "storeId",
      deliveryid AS "deliveryId",
      createdat AS "createdAt",
      status
    FROM orders
    WHERE id = $1
  `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
        throw Boom.notFound('Order not found :('); //si no encuentra el id, muestra esto
    }

    return result.rows[0];
};

//trae solo los items de una orden
export const getOrderItemsService = async (
    orderId: string
): Promise<OrderItem[]> => {
    const query = `
    SELECT
      id,
      orderid AS "orderId",
      productid AS "productId",
      quantity
    FROM order_items
    WHERE orderid = $1
  `;

    const result = await pool.query(query, [orderId]);
    return result.rows;
};

//para que el delivery acepte la orden
export const acceptOrderService = async (
    orderId: string,
    deliveryId: string
): Promise<Order> => {
    const order = await getOrderByIdService(orderId);

    //validar que la orden siga disponible
    if (order.status !== OrderStatus.PENDING || order.deliveryId !== null) {
        throw Boom.badRequest('Order is no longer available :(');
    }

    //se cambia el estado de pending a accepted
    const query = `
    UPDATE orders
    SET deliveryid = $1, status = $2
    WHERE id = $3
    RETURNING
      id,
      consumerid AS "consumerId",
      storeid AS "storeId",
      deliveryid AS "deliveryId",
      createdat AS "createdAt",
      status
  `;

    const result = await pool.query(query, [
        deliveryId,
        OrderStatus.ACCEPTED,
        orderId,
    ]);

    return result.rows[0];
};

//para que el delivery rechace la orden
export const declineOrderService = async (orderId: string): Promise<Order> => {
    const order = await getOrderByIdService(orderId);

    if (order.status !== OrderStatus.PENDING || order.deliveryId !== null) {
        throw Boom.badRequest('Order is no longer available :(');
    }

    //actualiza el estado
    const query = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    RETURNING
      id,
      consumerid AS "consumerId",
      storeid AS "storeId",
      deliveryid AS "deliveryId",
      createdat AS "createdAt",
      status
  `;

    const result = await pool.query(query, [OrderStatus.DECLINED, orderId]);
    return result.rows[0];
};