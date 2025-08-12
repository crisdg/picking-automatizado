import { Router } from "express";
import { userController } from "../controllers";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Rutas públicas
router.post("/login", userController.login);
router.post("/", userController.createUser);

// Rutas protegidas (requieren autenticación)
router.get("/profile", authenticateToken, userController.getProfile);
router.get("/", authenticateToken, userController.getAllUsers);
router.put("/:id", authenticateToken, userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);
router.get("/:id", authenticateToken, userController.getUserById);

export default router;