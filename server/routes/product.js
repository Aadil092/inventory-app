import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addProducts, deleteProduct, getProducts, updateProducts } from '../controllers/productController.js';

 const router = express.Router();
 

 router.post('/add', authMiddleware, addProducts);
 router.get('/', authMiddleware, getProducts);
 router.put('/:id', authMiddleware, updateProducts);
 router.delete('/:id', authMiddleware, deleteProduct);

 export default  router;