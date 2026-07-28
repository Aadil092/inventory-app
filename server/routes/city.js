import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addCity, getCities, getCitiesByState } from '../controllers/cityController.js';

 const router = express.Router();
 

 router.post('/add', authMiddleware, addCity);
//  router.get('/', authMiddleware, getCities);
//  router.get('/state/:stateId', authMiddleware, getCitiesByState);
//  router.put('/:id', authMiddleware, updateCategory);
//  router.delete('/:id', authMiddleware, deleteCategory);

 export default  router;