import { Request, Response } from 'express';
import { IUser } from '../schemas/user';
import mongoose, { Types } from 'mongoose';
import Review, { IMovie, IReviewDetail } from '../schemas/review';

// 리뷰 생성
export const createReview = async (req: Request, res: Response) => {
  try {
    const { review, author, movie } = req.body;

    const parsedReview = JSON.parse(review) as IReviewDetail;
    const parsedAuthor = JSON.parse(author) as IUser;
    const parsedMovie = JSON.parse(movie) as IMovie;

    const newReview = new Review({
      review: {
        content: parsedReview.content,
        rating: parsedReview.rating,
      },
      author: {
        _id: parsedAuthor._id,
        nickName: parsedAuthor.nickName,
        email: parsedAuthor.email,
      },
      movie: {
        id: parsedMovie.id,
        title: parsedMovie.title,
      },
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: '리뷰가 성공적으로 작성되었습니다.',
      data: { review: newReview },
    });
  } catch (error) {
    console.error('리뷰 생성 오류', error);

    if (error instanceof mongoose.Error.ValidationError) {
      const missingFields = Object.keys(error.errors);
      res.status(400).json({
        message: `필수 내용이 누락되었습니다: ${missingFields.join(', ')}`,
        success: false,
      });
      return;
    } else {
      res
        .status(500)
        .json({ message: '서버 오류로 인한 리뷰 작성 실패', success: false });
    }
  }
};

// 리뷰 목록 조회
export const viewReview = async (req: Request, res: Response) => {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({
      message: '해당 영화의 ID가 제공되지 않았습니다.',
      success: false,
    });
    return;
  }

  try {
    const reviews = await Review.find({ 'movie.id': id });
    res
      .status(200)
      .json({ message: '영화 리뷰 목록 조회', success: true, reviews });
  } catch (error) {
    res.status(500).json({
      message: '서버 오류로 인해 리뷰 조회에 실패했습니다.',
      success: false,
    });
  }
};

// 리뷰 수정
export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = JSON.parse(req.body.review) as IReviewDetail;
    const objectId = review._id;

    const updatedReview = await Review.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          'review.content': review.content,
          'review.rating': review.rating,
        },
      },
      { new: true }
    );

    if (!updatedReview) {
      res.status(404).json({
        message: '리뷰를 찾을 수 없습니다.',
        success: false,
      });
      return;
    }

    res.status(200).json({ message: '리뷰 수정', success: true });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const missingFields = Object.keys(error.errors);
      res.status(400).json({
        message: `다음 필드가 누락되었습니다: ${missingFields.join(', ')}`,
        success: false,
      });
      return;
    } else {
      res.status(500).json({
        message: '서버 오류로 인해 리뷰 수정에 실패했습니다.',
        success: false,
      });
    }
  }
};

// 리뷰 삭제
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const removedReview = await Review.findOneAndDelete({ _id: id });

    if (!removedReview) {
      res.status(404).json({
        message: '리뷰를 찾을 수 없거나 이미 삭제되었습니다.',
        success: false,
      });
      return;
    }

    res.status(200).json({ message: '리뷰 삭제', success: true });
  } catch (error) {
    console.error('리뷰 삭제 오류', error);
    res.status(500).json({
      message: '서버 오류로 인해 리뷰 수정에 실패했습니다.',
      success: false,
    });
  }
};

// 리뷰 조회
export const findReview = async (req: Request, res: Response) => {
  const { userId, movieId } = req.query;

  try {
    const review = await Review.findOne({
      'author._id': new Types.ObjectId(userId as string),
      'movie.id': movieId,
    });

    if (!review) {
      res.status(500).json({
        message: '리뷰가 존재하지 않습니다.',
        success: false,
      });
    }

    res.status(200).json({ message: '리뷰 조회', success: true, review });
  } catch (error) {
    console.error('리뷰 조회 오류', error);
    res.status(500).json({
      message: '서버 오류로 인해 리뷰 조회에 실패했습니다.',
      success: false,
    });
  }
};

// 사용자 작성 리뷰 조회
export const findUserReviews = async (req: Request, res: Response) => {
  const { userId } = req.query;

  try {
    const reviews = await Review.find({
      'author._id': new Types.ObjectId(userId as string),
    });

    if (!reviews) {
      res.status(500).json({
        message: '사용자가 작성한 리뷰가 없습니다.',
        success: false,
      });
      return;
    }

    res
      .status(200)
      .json({ message: '사용자 리뷰 조회', success: true, data: reviews });
  } catch (error) {
    console.error('사용자의 리뷰를 가져오는데 실패했습니다.', error);
    res.status(500).json({
      message: '서버 오류로 인해 사용자의 리뷰를 조회에 실패했습니다.',
      success: false,
    });
  }
};
