import { Request, Response } from "express";
import { Cliente } from "../db/models/cliente";

const getAllClientes = async (req: Request, res: Response) => {
    try {
        const clientes = await Cliente.findAll();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los clientes" });
    }
}

const getClienteById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el cliente" });
    }
}

const createCliente = async (req: Request, res: Response) => {
    try {
        // Validar que req.body existe y tiene los campos requeridos
        if (!req.body) {
            return res.status(400).json({ error: "Body de la petición es requerido" });
        }

        const { firstName, lastName, nroCuenta, zona } = req.body;

        // Validar campos requeridos
        if (!firstName || !lastName || !nroCuenta) {
            return res.status(400).json({
                error: "firstName, lastName y nroCuenta son campos requeridos"
            });
        }

        const cliente = await Cliente.create({ firstName, lastName, nroCuenta, zona });
        res.status(201).json(cliente);
    } catch (error) {
        console.error("Error creating cliente:", error);
        res.status(500).json({ error: "Error al crear el cliente" });
    }
}

const updateCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.body) {
            return res.status(400).json({ error: "Body de la petición es requerido" });
        }

        const { firstName, lastName, nroCuenta, zona } = req.body;

        // Validar campos requeridos
        if (!firstName || !lastName || !nroCuenta) {
            return res.status(400).json({
                error: "firstName, lastName y nroCuenta son campos requeridos"
            });
        }

        const cliente = await Cliente.update(
            { firstName, lastName, nroCuenta, zona },
            { where: { clienteId: id } }
        );

        if (cliente[0] === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente actualizado correctamente" });
    } catch (error) {
        console.error("Error updating cliente:", error);
        res.status(500).json({ error: "Error al actualizar el cliente" });
    }
}

const deleteCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.destroy({ where: { clienteId: id } });

        if (cliente === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        console.error("Error deleting cliente:", error);
        res.status(500).json({ error: "Error al eliminar el cliente" });
    }
}

export default { getAllClientes, createCliente, updateCliente, deleteCliente, getClienteById };
