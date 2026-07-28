import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addOrder, deleteOrder, getOrder, getOrderByUser } from '../controllers/orderController.js';

 const router = express.Router();
 

 router.post('/add', authMiddleware, addOrder);
 router.get('/', authMiddleware, getOrder);
 router.get ('/all', authMiddleware, getOrderByUser);
//  router.put('/:id', authMiddleware, updateProducts);
 router.delete('/:id', authMiddleware, deleteOrder);

 export default  router;