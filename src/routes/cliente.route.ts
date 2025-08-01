import { Router } from "express";
import { clienteController } from "../controllers";

const router = Router();

router.get("/", clienteController.getAllClientes);
router.post("/", clienteController.createCliente);
router.put("/:id", clienteController.updateCliente);
router.delete("/:id", clienteController.deleteCliente);
router.get("/:id", clienteController.getClienteById);

export default router;