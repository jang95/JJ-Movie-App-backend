import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startServer } from './server';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://jj-movie-engine.netlify.app'],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
// app.use('/review', reviewRoutes);

startServer(app);

export default app;
