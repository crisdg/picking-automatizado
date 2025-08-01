import { Router } from "express";
import { entregaProductoController } from "../controllers";

const router = Router();

router.get("/", entregaProductoController.getAllEntregaProductos);
router.post("/", entregaProductoController.createEntregaProducto);
router.put("/:id", entregaProductoController.updateEntregaProducto);
router.delete("/:id", entregaProductoController.deleteEntregaProducto);
router.get("/:id", entregaProductoController.getEntregaProductoById);

export default router;