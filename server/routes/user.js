import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addUser, deleteUser, getUser , getUsers, updateUser, updateProfile, updatePassword} from '../controllers/userController.js';

 const router = express.Router();
 

 router.post('/add', authMiddleware, addUser);
 router.get('/', authMiddleware, getUsers);
 router.get('/profile', authMiddleware, getUser);
 router.put('/profile', authMiddleware, updateProfile);
 router.put('/profile/password', authMiddleware, updatePassword);
 router.put('/:id', authMiddleware, updateUser);
 router.delete('/:id', authMiddleware, deleteUser);

 export default  router;