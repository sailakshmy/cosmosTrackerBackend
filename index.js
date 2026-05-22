import express from "express";
import "dotenv/config";
import nasaRoutes from "./routes/nasaRoutes.js";

const app = express();

app.use(express.json());

app.use("/nasa", nasaRoutes);

app.listen(process.env.PORT, "", () => {
  console.log("Server started in port", process.env.PORT);
});
