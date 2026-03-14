export interface Product {
    id: string;
    name: string;
    price: number;
    storeId: string;
}

export interface CreateProductDTO {
    name: string;
    price: number;
    storeId: string;
}

export interface UpdateProductDTO {
    name?: string;
    price?: number;
}
