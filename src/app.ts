import express from "express";
import db from "./db/models";
import userRoutes from "./routes/user.route";
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});