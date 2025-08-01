import { Request, Response } from "express";
import { Pedido } from "../db/models/pedido";

const getAllPedidos = async (req: Request, res: Response) => {
    const pedidos = await Pedido.findAll();
    res.json(pedidos);
}

const createPedido = async (req: Request, res: Response) => {
    const { clienteId, campania, zona } = req.body;
    const pedido = await Pedido.create({ clienteId, campania, zona, fecha_creacion: new Date() });
    res.json(pedido);
}

const updatePedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { clienteId, campania, zona } = req.body;
    const pedido = await Pedido.update({ clienteId, campania, zona }, { where: { pedidoId: id } });
    res.json(pedido);
}

const deletePedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    const pedido = await Pedido.destroy({ where: { pedidoId: id } });
    res.json(pedido);
}

const getPedidoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id);
    res.json(pedido);
}

export default { getAllPedidos, createPedido, updatePedido, deletePedido, getPedidoById };