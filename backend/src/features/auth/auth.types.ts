export enum UserRole {
    CONSUMER = 'consumer',
    STORE = 'store',
    DELIVERY = 'delivery',
}

//DTO: para crear un producto solo necesito esto 
//Son los datos que el usuario manda
//datos que se esperan recibir
//sirve para organizar codigo y evitar que falte info o manden cosas raras
export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    storeName?: string; //solo si el rol es store!
}

export interface AuthenticateUserDTO {
    email: string;
    password: string;
}