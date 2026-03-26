export interface Product {
    id: string;
    name: string;
    price: number;
    storeId: string;
}

//DTO: para crear un producto solo necesito esto 
//Son los datos que el usuario manda
//datos que se esperan recibir
//sirve para organizar codigo y evitar que falte info o manden cosas raras
export interface CreateProductDTO {
    name: string;
    price: number;
    storeId: string;
}

export interface UpdateProductDTO {
    name?: string;
    price?: number;
}
