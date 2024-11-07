import User, { IUser } from '../schemas/user';
import dotenv from 'dotenv';
import { generateToken } from '../utils/authUtils';
import bcrypt from 'bcryptjs';
import { Schema } from 'mongoose';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export interface LoginDataType {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    nickName: string;
    _id: Schema.Types.ObjectId | undefined;
  };
}

/**
 * 사용자가 입력한 이메일과 비밀번호로 로그인 처리
 *
 * @param email - 사용자의 이메일 주소
 * @param password - 사용자가 입력한 비밀번호
 * @returns 로그인 성공 시 사용자 정보, 액세스 토큰, 리프레시 토큰을 포함한 객체 반환
 *          로그인 실패 시 null 반환
 *
 * @throws JWT 환경 변수가 설정되지 않은 경우 에러 발생
 *
 * - 로그인 성공 시 사용자의 정보를 기반으로 액세스 토큰과 리프레시 토큰을 생성하여 반환
 */
export const loginService = async (
  email: string,
  password: string
): Promise<LoginDataType | null> => {
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

  // 환경 변수 확인
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT 환경 변수가 설정되지 않았습니다.');
  }

  const { user, accessToken } = createAccessTokenForUser(checkUser);

  const refreshToken = generateToken(
    user,
    process.env.JWT_REFRESH_SECRET!,
    REFRESH_TOKEN_EXPIRES
  );

  return { accessToken, refreshToken, user };
};

/**
 *
 * @param userData DB에서 찾아온 사용자 정보
 * @returns 로그인 인증에 성공한 사용자 정보 및 accessToken
 */
export const createAccessTokenForUser = (userData: IUser) => {
  const user = {
    email: userData.email,
    nickName: userData.nickName,
    _id: userData._id,
  };

  const accessToken = generateToken(
    user,
    process.env.JWT_SECRET!,
    ACCESS_TOKEN_EXPIRES
  );

  return { user, accessToken };
};
