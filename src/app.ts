import express from "express";
import db from "./db/models";
import { userRoutes, clienteRoutes, pedidoRoutes, entregaRoutes, entregaProductoRoutes, csvUploadRoutes } from "./routes/index";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3005;
const app = express();

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