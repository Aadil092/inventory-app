import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addState, getStates} from '../controllers/stateController.js';

 const router = express.Router();
 

 router.post('/add', authMiddleware, addState);
 router.get('/', authMiddleware, getStates);
//  router.put('/:id', authMiddleware, updateCategory);
//  router.delete('/:id', authMiddleware, deleteCategory);

 export default  router;