import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import authRoutes from'./routes/auth.js';
import categoryRoutes from './routes/category.js';
import supplierRoutes from './routes/supplier.js';
import productsRoutes from './routes/product.js';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/order.js';
import statesRoutes from './routes/state.js';
import cityRoutes from './routes/city.js';
import settingRoutes from './routes/setting.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/settings', settingRoutes);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log('Server is runing on http://localhost:5000');
})