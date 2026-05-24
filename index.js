import express from "express";
import "dotenv/config";
import nasaRoutes from "./routes/nasaRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/nasa", nasaRoutes);

app.listen(process.env.PORT, "", () => {
  console.log("Server started in port", process.env.PORT);
});
