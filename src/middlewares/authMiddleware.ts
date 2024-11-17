// middlewares/authMiddleware.ts

import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/userModel';
import { CustomRequest } from '../types/custom';

export const isAuthenticated = async (req: CustomRequest, res: Response,next: NextFunction): Promise<void> => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.redirect('/auth/login');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.redirect('/auth/login');
      return;
    }

    //if already logged in, redirect to homepage
    if (req.originalUrl == "/auth/login" || req.originalUrl == "/auth/signup"){
      res.redirect('/');
    }

    req.username = user.username;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/auth/login');
    return;
  }
};