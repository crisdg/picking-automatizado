import express from "express";
import cors from "cors";
import db from "./db/models";
import { userRoutes, clienteRoutes, pedidoRoutes, entregaRoutes, entregaProductoRoutes, csvUploadRoutes } from "./routes/index";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3005;
const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

db.sequelize.sync().then(() => {
    console.log("Database & tables created!");
}).catch((err) => {
    console.log(err);
});
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/entregas", entregaRoutes);
app.use("/api/entregaproductos", entregaProductoRoutes);
app.use("/api/csv", csvUploadRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});