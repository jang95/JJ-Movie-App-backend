import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startServer } from './server';
import authRoutes from './routes/authRoutes';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(
  cors({
    origin: ['https://localhost:5173', 'https://jj-movie-engine.netlify.app'], // 허용할 origin 설정
    credentials: true,
  })
);

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

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
