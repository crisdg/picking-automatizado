import { Request, Response } from "express";
import { Entrega } from "../db/models/entrega";

const getAllEntregas = async (req: Request, res: Response) => {
    const entregas = await Entrega.findAll();
    res.json(entregas);
}

const createEntrega = async (req: Request, res: Response) => {
    const { pedidoId, nroEntrega, estado, timestamp_inicio, timestamp_fin } = req.body;
    const entrega = await Entrega.create({ pedidoId, nroEntrega, estado, timestamp_inicio, timestamp_fin });
    res.json(entrega);
}

const updateEntrega = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { pedidoId, nroEntrega, estado, timestamp_inicio, timestamp_fin } = req.body;
    const entrega = await Entrega.update({ pedidoId, nroEntrega, estado, timestamp_inicio, timestamp_fin }, { where: { entregaId: id } });
    res.json(entrega);
}

const deleteEntrega = async (req: Request, res: Response) => {
    const { id } = req.params;
    const entrega = await Entrega.destroy({ where: { entregaId: id } });
    res.json(entrega);
}

const getEntregaById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const entrega = await Entrega.findByPk(id);
    res.json(entrega);
}

export default { getAllEntregas, createEntrega, updateEntrega, deleteEntrega, getEntregaById };