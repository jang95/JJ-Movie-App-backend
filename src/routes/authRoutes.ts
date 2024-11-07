import express from 'express';
import multer from 'multer';
import {
  logout,
  register,
  login,
  withdrawal,
  refreshAccessToken,
} from '../controllers/userController';

const router = express.Router();
const upload = multer();

router.post('/register', upload.none(), register);
router.post('/login', upload.none(), login);
router.post('/logout', logout);
router.delete('/withdrawal', withdrawal);
router.post('/refreshToken', refreshAccessToken);

export default router;
