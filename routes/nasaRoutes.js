import express from "express";
import "dotenv/config";
// import NodeCache from "node-cache";
// import { parseDataFromNeoFeedApi } from "../transformers/neoFeedTransformer.js";

import {
  getApodController,
  getNeoFeedController,
  getNeoLookUpController,
} from "../controllers/nasaControllers.js";

const nasaRouter = express.Router();

nasaRouter.use((req, res, next) => {
  res.set("Cache-Control", "public, max-age=3600");
  next();
});

nasaRouter.get("/", getApodController);

nasaRouter.get("/neo", getNeoFeedController);

nasaRouter.get("/neo/:neoId", getNeoLookUpController);

export default nasaRouter;
