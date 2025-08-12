import { Request } from 'express';

export interface AuthRequest extends Request {
    userId?: number;
    nickname?: string;
}

export interface JwtPayload {
    userId: number;
    nickname: string;
}

export interface LoginRequest {
    nickname: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        nickname: string;
        createdAt: Date;
        updatedAt: Date;
    };
} 