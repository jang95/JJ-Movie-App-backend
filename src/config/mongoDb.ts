import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const MONGO_URL = process.env.MONGO_URL;

console.log('mongoURI', MONGO_URL);

// mongoose.connection
// Mongoose와 MongoDB 서버 간의 연결 상태를 나타내는 객체
mongoose.connection.on('connected', () => {
  console.log('Mongoose가 MongoDB에 연결 성공!');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose 연결에 error 발생!!:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose의 MongoDB 연결 종료!');
});

let retryCount = 0;
const maxRetries = 5;

export const connectMongoDB = async () => {
  if (!MONGO_URL) {
    console.error('MONGO_URI 환경 변수가 설정되지 않았습니다.');
    process.exit(1); // 환경 변수 오류 발생 시 프로세스 종료
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log('MongoDB에 성공적으로 연결되었습니다!');
  } catch (error) {
    retryCount += 1;
    console.error(
      'MongoDB에 연결하지 못했습니다. 3초 후 재연결을 시도합니다.',
      error
    );

    if (retryCount >= maxRetries) {
      console.error('최대 재연결 시도 횟수를 초과했습니다. 서버를 종료합니다.');
      process.exit(1); // 최대 재연결 시도 횟수를 초과하면 프로세스 종료
    } else {
      setTimeout(connectMongoDB, Number(process.env.PORT)); // 3초 후 재연결 시도
    }
  }
};
