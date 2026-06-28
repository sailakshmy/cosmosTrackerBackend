import express from "express";
import "dotenv/config";
// import NodeCache from "node-cache";
// import { parseDataFromNeoFeedApi } from "../transformers/neoFeedTransformer.js";
import { getFeed } from "../services/neoFeedService.js";
import { getApod } from "../services/apodService.js";

const nasaRouter = express.Router();

nasaRouter.use((req, res, next) => {
  res.set("Cache-Control", "public, max-age=3600");
  next();
});

nasaRouter.get("/", async (req, res) => {
  const { date: queryParamsDate, firstLoad } = req.query;
  try {
    const apodDataRes = await getApod(queryParamsDate, firstLoad);
    return res.status(200).json(apodDataRes);
  } catch (err) {
    return res.status(502).json({
      message: "Could not fetch data from NASA",
      error: err.message,
    });
  }
});

nasaRouter.get("/neo", async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const data = await getFeed({ startDate, endDate });
    console.log("Feed data from route", data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      message: "Could not fetch NEO Feed from NASA",
      error: err.message,
    });
  }
});

export default nasaRouter;
