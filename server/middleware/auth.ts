import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'sbfms_jwt_secret_key_cloud_native_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'student';
    name: string;
    studentId?: string;
  };
}

/**
 * Generate signed JWT Token for user authentication
 */
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Express Middleware: Verify JWT Bearer Token
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Access token missing or malformed' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden: Invalid or expired JWT access token' });
    return;
  }
};

/**
 * Express Middleware: Require specific administrative or student roles
 */
export const requireRole = (role: 'admin' | 'student') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }
    if (req.user.role !== role && req.user.role !== 'admin') { // Admin can access student endpoints
      res.status(403).json({ error: `Forbidden: Requires ${role.toUpperCase()} privileges` });
      return;
    }
    next();
  };
};
