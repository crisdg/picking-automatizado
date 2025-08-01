import { Request, Response } from "express";
import { EntregaProducto } from "../db/models/entregaproducto";

const getAllEntregaProductos = async (req: Request, res: Response) => {
    const entregaProductos = await EntregaProducto.findAll();
    res.json(entregaProductos);
}
const createEntregaProducto = async (req: Request, res: Response) => {
    const { entregaId, puesto, nivel, ubicacion, cantidad, ean, estado, timestamp_scan, user_scan } = req.body;
    const entregaProducto = await EntregaProducto.create({ entregaId, puesto, nivel, ubicacion, cantidad, ean, estado, timestamp_scan, user_scan });
    res.json(entregaProducto);
}
const updateEntregaProducto = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { entregaId, puesto, nivel, ubicacion, cantidad, ean, estado, timestamp_scan, user_scan } = req.body;
    const entregaProducto = await EntregaProducto.update({ entregaId, puesto, nivel, ubicacion, cantidad, ean, estado, timestamp_scan, user_scan }, { where: { entregaProductoId: id } });
    res.json(entregaProducto);
}
const deleteEntregaProducto = async (req: Request, res: Response) => {
    const { id } = req.params;
    const entregaProducto = await EntregaProducto.destroy({ where: { entregaProductoId: id } });
    res.json(entregaProducto);
}
const getEntregaProductoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const entregaProducto = await EntregaProducto.findByPk(id);
    res.json(entregaProducto);
}

export default { getAllEntregaProductos, createEntregaProducto, updateEntregaProducto, deleteEntregaProducto, getEntregaProductoById };