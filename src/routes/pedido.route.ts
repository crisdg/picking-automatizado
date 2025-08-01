import { Router } from "express";
import { pedidoController } from "../controllers";

const router = Router();

router.get("/", pedidoController.getAllPedidos);
router.post("/", pedidoController.createPedido);
router.put("/:id", pedidoController.updatePedido);
router.delete("/:id", pedidoController.deletePedido);
router.get("/:id", pedidoController.getPedidoById);

export default router;