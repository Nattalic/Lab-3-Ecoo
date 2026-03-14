export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
}

//tabla order
export interface Order {
    id: string;
    consumerId: string;
    storeId: string;
    deliveryId: string | null;
    createdAt: string;
    status: OrderStatus;
}

//tabla order_items
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
}

export interface CreateOrderItemDTO {
    productId: string;
    quantity: number;
}

export interface CreateOrderDTO {
    storeId: string;
    items: CreateOrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
    status: OrderStatus;
}
