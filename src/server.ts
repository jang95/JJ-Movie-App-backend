import { Application } from 'express';
import { connectMongoDB } from './config/mongoDb';
import https from 'https';
import path from 'path';
import fs from 'fs';

const certPath = path.resolve(__dirname, '../certs', 'cert.pem');
const keyPath = path.resolve(__dirname, '../certs', 'key.pem');

const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

export const startServer = async (app: Application) => {
  try {
    await connectMongoDB();
    // app.listen(process.env.PORT, () => {
    //   console.log(`${process.env.PORT}번 포트 실행 완료`);
    // });
    https.createServer(credentials, app).listen(process.env.PORT, () => {
      console.log(`${process.env.PORT}번 포트에서 HTTPS 서버 실행 완료`);
    });
  } catch (error) {
    console.error('서버 연결 실패', error);
    process.exit(1); // 프로세스 종료
  }
};
