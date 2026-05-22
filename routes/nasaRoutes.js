import express from "express";
import "dotenv/config";

const nasaRouter = express.Router();

nasaRouter.get("/", async (req, res, next) => {
  const { date } = req.query;
  console.log("Req", req.query);
  const apodPictureOfTheDay = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${date}`,
  );
  const apodData = await apodPictureOfTheDay.json();
  res.json({ message: "NASA get route is working", data: { ...apodData } });
});

export default nasaRouter;
