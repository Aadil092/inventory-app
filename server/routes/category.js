import express from 'express';
import { addCategory,deleteCategory,getCategory, updateCategory } from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

 const router = express.Router();
 

 router.post('/add', addCategory);
 router.get('/', authMiddleware, getCategory);
 router.put('/:id', authMiddleware, updateCategory);
 router.delete('/:id', authMiddleware, deleteCategory);

 export default  router;