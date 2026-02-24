import { Router, Request, Response, NextFunction } from 'express';
import {
  login,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Wrapper for async errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Public routes
router.post('/login', asyncHandler(login));

// Protected routes
router.post('/logout', authenticate, asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(getCurrentUser));

export default router;
