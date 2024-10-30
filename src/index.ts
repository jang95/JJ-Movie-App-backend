import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startServer } from './server';
import authRoutes from './routes/authRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://jj-movie-engine.netlify.app'],
  credentials: true, // 쿠키 전송 허용
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/review', reviewRoutes);

startServer(app);

export default app;
