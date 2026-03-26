//donde se conecta todo
import express from 'express';
import cors from 'cors';
import { NODE_ENV, PORT } from './config';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { authRouter as authRouter } from './features/auth/auth.router';
import { router as storeRouter } from './features/stores/store.router';
import { router as productRouter } from './features/products/product.router';
import { router as orderRouter } from './features/orders/order.router'; 

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello! Rappi server running :3');
});

//Rutasss
app.use('/api/auth', authRouter);

// Error de middleware
app.use(errorsMiddleware);

//store
app.use('/api/stores', storeRouter);

//productoss
app.use('/api/products', productRouter);

//ordersss
app.use('/api/orders', orderRouter);


if (NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('Server is running on http://localhost:' + PORT);
    });
}

export default app;