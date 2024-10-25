import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { IUser } from '../schemas/user';
import { loginService } from '../services/authService';

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

    const loginData = await loginService(email, password);

    if (!loginData) {
      res.status(400).json({
        message: '이메일 또는 비밀번호가 잘못되었습니다.',
        success: false,
      });
    }

    if (loginData) {
      res.status(200).json({
        message: '로그인 성공',
        success: true,
        accessToken: loginData.accessToken,
        user: loginData.user,
      });
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 로그아웃
export const logout = async (req: Request, res: Response) => {
  try {
    // Todo
    // 데이터베이스에서 refreshToken 삭제
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
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
