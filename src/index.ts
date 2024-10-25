import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startServer } from './server';
import authRoutes from './routes/authRoutes';

const app = express();

// CORS 설정
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/', authRoutes);
// app.use('/review', reviewRoutes);

// 서버 시작
startServer(app);

export default app;
