import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';

// 토큰 생성
export const generateToken = (
  user: {
    email: string;
    nickName: string;
    _id: Schema.Types.ObjectId | undefined;
  },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign({ user }, secret, { expiresIn });
};
