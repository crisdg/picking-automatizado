import { Router } from "express";
import multer from "multer";
import { csvUploadController } from "../controllers";

// Configurar multer para manejar archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        cb(null, `${timestamp}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos CSV'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
});

const router = Router();

// Endpoint para cargar CSV con zona y ruta
router.post("/upload", upload.single('csvFile'), csvUploadController.uploadCSV);

// Endpoint para obtener estadísticas por zona
router.get("/stats/:zona", csvUploadController.getZoneStats);

// Endpoint para verificar relaciones entre tablas
router.get("/relationships/:zona", csvUploadController.getRelationships);

export default router; 