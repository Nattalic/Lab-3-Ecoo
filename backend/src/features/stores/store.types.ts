export interface Store {
    id: string;
    name: string;
    isOpen: boolean;
    userId: string;
}

//crear tienda

//DTO: para crear un producto solo necesito esto 
//Son los datos que el usuario manda
//datos que se esperan recibir
//sirve para organizar codigo y evitar que falte info o manden cosas raras
export interface CreateStoreDTO {
    name: string;
    userId: string;
    isOpen?: boolean;
}

//abrir y cerrar tienda
export interface UpdateStoreStatusDTO {
    isOpen: boolean;
}