export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
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

//DTO: para crear un producto solo necesito esto 
//Son los datos que el usuario manda
//datos que se esperan recibir
//sirve para organizar codigo y evitar que falte info o manden cosas raras
export interface CreateOrderItemDTO { //DTO es 
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
