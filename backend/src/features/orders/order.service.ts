import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import {
    CreateOrderDTO,
    Order,
    OrderItem,
    OrderStatus,
} from './order.types';

export const createOrderService = async (
    consumerId: string,
    data: CreateOrderDTO
): Promise<Order> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (!data.items || data.items.length === 0) {
            throw Boom.badRequest('Order must contain at least one item!');
        }

        const storeQuery = `
      SELECT id
      FROM stores
      WHERE id = $1
    `;
        const storeResult = await client.query(storeQuery, [data.storeId]);

        if (storeResult.rows.length === 0) {
            throw Boom.notFound('Store not found');
        }

        for (const item of data.items) {
            if (item.quantity <= 0) {
                throw Boom.badRequest('Quantity must be greater than 0!');
            }

            const productQuery = `
        SELECT id, storeid
        FROM products
        WHERE id = $1
      `;
            const productResult = await client.query(productQuery, [item.productId]);

            if (productResult.rows.length === 0) {
                throw Boom.notFound(`Product not found: ${item.productId}`);
            }

            const product = productResult.rows[0];

            if (product.storeid !== data.storeId) {
                throw Boom.badRequest('All products must belong to the selected store!');
            }
        }

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

        await client.query('COMMIT');
        return order;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getMyOrdersService = async (consumerId: string): Promise<any[]> => {
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
export const getStoreOrdersService = async (userId: string): Promise<Order[]> => {
    const query = `
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

    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const getAvailableOrdersService = async (): Promise<Order[]> => {
    const query = `
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

    const result = await pool.query(query, [OrderStatus.PENDING]);
    return result.rows;
};

export const getAcceptedOrdersService = async (
    deliveryId: string
): Promise<Order[]> => {
    const query = `
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

    const result = await pool.query(query, [deliveryId, OrderStatus.ACCEPTED]);
    return result.rows;
};

export const getOrderByIdService = async (orderId: string): Promise<Order> => {
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
        throw Boom.notFound('Order not found :(');
    }

    return result.rows[0];
};

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

export const acceptOrderService = async (
    orderId: string,
    deliveryId: string
): Promise<Order> => {
    const order = await getOrderByIdService(orderId);

    if (order.status !== OrderStatus.PENDING || order.deliveryId !== null) {
        throw Boom.badRequest('Order is no longer available :(');
    }

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

export const declineOrderService = async (orderId: string): Promise<Order> => {
    const order = await getOrderByIdService(orderId);

    if (order.status !== OrderStatus.PENDING || order.deliveryId !== null) {
        throw Boom.badRequest('Order is no longer available :(');
    }

    return order;
};