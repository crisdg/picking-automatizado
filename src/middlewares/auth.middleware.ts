import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    userId?: number;
    nickname?: string;
}

interface JwtPayload {
    userId: number;
    nickname: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            message: 'Access token is required'
        });
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'default-secret-key';
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

        req.userId = decoded.userId;
        req.nickname = decoded.nickname;

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({
            message: 'Invalid or expired token'
        });
    }
};

export default { authenticateToken }; 