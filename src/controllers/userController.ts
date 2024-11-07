import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { IUser } from '../schemas/user';
import {
  loginService,
  LoginDataType,
  createAccessTokenForUser,
} from '../services/authService';

interface IUserRequest {
  email: string;
  password: string;
}

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nickName } = req.body as IUser;

    // 기존 사용자가 있는지 확인
    const findUser = await User.findOne({ email });

    if (findUser) {
      res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
      return;
    }

    const hashPasswoard = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const newUser = new User({
      nickName,
      email,
      password: hashPasswoard,
      refreshToken: '',
    });

    // 사용자 저장
    await newUser.save();

    res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.' });
  } catch (error) {
    console.error('회원가입 오류:', error);

    // error가 MongoError와 같은 데이터베이스 관련 오류인지 확인
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({ message: '중복된 계정이 존재합니다.' });
    }

    // mongoose의 ValidationError 처리
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: '입력 데이터가 유효하지 않습니다.' });
    }

    res.status(500).json({ message: '서버 오류로 회원가입에 실패했습니다.' });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as IUserRequest;

    const { user, accessToken, refreshToken } = (await loginService(
      email,
      password
    )) as LoginDataType;

    if (!user) {
      res.status(400).json({
        message: '이메일 또는 비밀번호가 잘못되었습니다.',
        success: false,
      });
      return;
    }

    if (user) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      const updateRefreshToken = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { refreshToken: refreshToken } },
        { new: true }
      );

      if (!updateRefreshToken) {
        res.status(401).json({
          message: 'refreshToken 갱신 실패',
          success: false,
        });
        return;
      }

      res.status(200).json({
        message: '로그인 성공',
        success: true,
        accessToken: accessToken,
        user: user,
      });
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 로그아웃
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  try {
    // DB에서 지우기
    const deleteRefreshToken = await User.findOneAndUpdate(
      { refreshToken: refreshToken },
      { $unset: { refreshToken: '' } },
      { new: true }
    );

    if (!deleteRefreshToken) {
      res
        .status(400)
        .json({ message: '서버에서 refreshToken를 찾지 못했습니다.' });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: '로그아웃 성공' });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 회원탈퇴
export const withdrawal = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as IUserRequest;
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      res.status(404).json({
        message: '해당 이메일의 사용자가 존재하지 않습니다.',
        success: false,
      });
    }
    res.status(200).json({ message: '회원탈퇴 완료', success: true });
  } catch (error) {
    console.error('회원탈퇴 오류:', error);
    res.status(500).json({ message: '서버 오류로 회원탈퇴에 실패했습니다.' });
  }
};

// 토큰 재발급
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res
      .status(401)
      .json({ message: 'RefreshToken 확인되지 않습니다', success: false });
    return;
  }

  const checkUser = await User.findOne({ refreshToken });

  if (checkUser) {
    const { user, accessToken } = createAccessTokenForUser(checkUser);

    res.status(201).json({
      message: '토큰 재발급',
      sucess: true,
      userData: user,
      accessToken,
    });
    return;
  }
};
