//aqui se manejan todos los errores del sistema
//captura errores y devuelve una respuesta estrucutrada al cliente
import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';

//aqui se recibe el error
export const errorsMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //convierte el error a boom
    //si ya es error boom, lo usa
    //si no lo convierte a boom
    //para que todos los errores tengan el mismo formato
    const boomError = Boom.isBoom(error) ? error : Boom.boomify(error);
    //crea la estrucutra que se enviara
    const payload = {
        ...boomError.output.payload,
        message: boomError.message,
    };
    return res.status(boomError.output.statusCode).json(payload);
};

//convierte errores tecnicos en respuestas claras
//boom =  manejar errores de forma centralizada