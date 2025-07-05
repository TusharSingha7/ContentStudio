
import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

export const authMiddleware = async (req : AuthenticatedRequest,res : Response,next : NextFunction)=>{

const secret = process.env.JWT_SECRET || 'your_secret';
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing or malformed' });
    return;
}

const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'object' && 'id' in decoded && 'email' in decoded) {
      req.user = { id: decoded.id as number, email: decoded.email as string };
      next();
      return;
    }
    res.status(403).json({ message: 'Invalid' });
    return; 
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' ,
        error , token
     });
    return; 
  }
}