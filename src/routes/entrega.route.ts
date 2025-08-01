import { Router } from "express";
import { entregaController } from "../controllers";

const router = Router();

router.get("/", entregaController.getAllEntregas);
router.post("/", entregaController.createEntrega);
router.put("/:id", entregaController.updateEntrega);
router.delete("/:id", entregaController.deleteEntrega);
router.get("/:id", entregaController.getEntregaById);

export default router;