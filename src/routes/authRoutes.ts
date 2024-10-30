import express from 'express';
import multer from 'multer';
import {
  logout,
  register,
  login,
  withdrawal,
} from '../controllers/userController';
import { createReview, viewReview } from '../controllers/reviewController';
// import {
//   refreshAccessToken,
//   verifyToken,
//   verifyLogin,
// } from '../middleware/authMiddleware';

const router = express.Router();
const upload = multer();

router.post('/register', upload.none(), register);
router.post('/login', upload.none(), login);
router.post('/logout', logout);
router.delete('/withdrawal', withdrawal);

router.post('/create', upload.none(), createReview);
router.get('/view', upload.none(), viewReview);

// router.get('/token', verifyToken);
// router.get('/check', verifyLogin);
// router.post('/refresh', refreshAccessToken);

export default router;
