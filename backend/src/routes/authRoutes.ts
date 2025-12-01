import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  listUsers,
  deleteUser,
} from '../controllers/authController';

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getCurrentUser);
router.post('/logout', logoutUser);

if (process.env.NODE_ENV === 'development') {
  router.get('/users', listUsers);
  router.delete('/users/:username', deleteUser);
}

export default router;
