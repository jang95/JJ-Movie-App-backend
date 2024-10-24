import User, { IUser } from '../schemas/user';
import { generateToken } from '../utils/authUtils';
import bcrypt from 'bcryptjs';
import { Schema } from 'mongoose';

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export const loginService = async (
  email: string,
  password: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    nickName: string;
    _id: Schema.Types.ObjectId | undefined;
  };
} | null> => {
  const checkUser = (await User.findOne({ email })) as IUser;

  if (!checkUser) {
    console.log(`로그인 실패: 존재하지 않는 이메일 (${email})`);
    return null;
  }

  const matchPassword = await bcrypt.compare(password, checkUser.password);

  if (!matchPassword) {
    console.log(`로그인 실패: 비밀번호 불일치 (${email})`);
    return null;
  }

  // 토큰에 들어갈 내용
  const user = {
    email: checkUser.email,
    nickName: checkUser.nickName,
    _id: checkUser._id,
  };

  const accessToken = generateToken(
    user,
    process.env.JWT_SECRET!,
    ACCESS_TOKEN_EXPIRES
  );

  const refreshToken = generateToken(
    user,
    process.env.JWT_REFRESH_SECRET!,
    REFRESH_TOKEN_EXPIRES
  );

  // refreshToken도 반환
  return { accessToken, refreshToken, user };
};
