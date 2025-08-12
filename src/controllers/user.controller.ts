import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Excluir password de la respuesta
        });
        console.log(users);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

const createUser = async (req: Request, res: Response) => {
    try {
        const { password, ...userData } = req.body;

        // Encriptar password con salt rounds de 12 (recomendado)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            ...userData,
            password: hashedPassword
        });

        // Excluir password de la respuesta
        const { password: _, ...userResponse } = user.toJSON();
        res.status(201).json(userResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating user" });
    }
};

const updateUser = async (req: Request, res: Response) => {
    try {
        const { password, ...updateData } = req.body;

        // Si se está actualizando el password, encriptarlo
        if (password) {
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.password = hashedPassword;
        }

        const user = await User.update(updateData, { where: { id: req.params.id } });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.destroy({ where: { id: req.params.id } });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] } // Excluir password de la respuesta
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { nickname, password } = req.body;

        // Validar que se envíen nickname y password
        if (!nickname || !password) {
            return res.status(400).json({
                message: "Nickname and password are required"
            });
        }

        // Buscar usuario por nickname
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Verificar password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Generar JWT token
        const secretKey = process.env.JWT_SECRET || 'default-secret-key';
        const token = jwt.sign(
            {
                userId: user.id,
                nickname: user.nickname
            },
            secretKey,
            {
                expiresIn: '24h'
            }
        );

        // Respuesta exitosa con token y datos del usuario (sin password)
        const { password: _, ...userResponse } = user.toJSON();

        res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

interface AuthRequest extends Request {
    userId?: number;
    nickname?: string;
}

const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: "Error fetching user profile"
        });
    }
};

export default { getAllUsers, createUser, updateUser, deleteUser, getUserById, login, getProfile };