import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startServer } from './server';
import authRoutes from './routes/authRoutes';

const app = express();

// cloudtype에서는 cors가 먹히지 않는가?
// 배포하는 서비스가 서로 다를 경우 cors 사용이 제한적일 수 있다.
// app.use(
//   cors({
//     origin: ['https://localhost:5173', 'https://jj-movie-engine.netlify.app'],
//     credentials: true,
//   })
// );

app.use((req, res, next) => {
  const allowedOrigins = [
    'https://localhost:5173',
    'https://jj-movie-engine.netlify.app',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
// app.use('/review', reviewRoutes);

startServer(app);

export default app;
