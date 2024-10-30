import express from 'express';
import multer from 'multer';
import {
  createReview,
  updateReview,
  deleteReview,
  viewReview,
  findReview,
  findUserReviews,
} from '../controllers/reviewController';

const router = express.Router();
const upload = multer();

router.post('/create', upload.none(), createReview);
router.post('/update', upload.none(), updateReview);
router.delete('/delete', deleteReview);
router.get('/view', upload.none(), viewReview);
router.get('/find', upload.none(), findReview);

// 마이페이지 관련
router.get('/findUserReviews', upload.none(), findUserReviews);

export default router;
