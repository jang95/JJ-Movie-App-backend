import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startServer } from './server';
import authRoutes from './routes/authRoutes';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// CORS 설정
// const corsOptions = {
//   origin: '*',
//   credentials: true, // 쿠키 전송 허용
// };

// app.use(cors(corsOptions));

app.use(
  '/api',
  createProxyMiddleware({
    target:
      'https://port-0-jj-movie-app-backend-m2otldplb5943039.sel4.cloudtype.app',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/', authRoutes);
// app.use('/review', reviewRoutes);

// 서버 시작
startServer(app);

export default app;
