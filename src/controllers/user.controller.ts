import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcryptjs";

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

export default { getAllUsers, createUser, updateUser, deleteUser, getUserById };