import express from "express";
import "dotenv/config";

const nasaRouter = express.Router();

nasaRouter.get("/", async (req, res, next) => {
  const { date } = req.query;
  console.log("Req", req.query);
  let apodPictureOfTheDay = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${date}`,
  );
  let apodData = await apodPictureOfTheDay.json();
  if (apodData?.msg?.includes("No data available for date")) {
    console.log("No available data block");
    const previousDate = new Date();
    previousDate?.setDate(previousDate?.getDate() - 1);
    const priorDate = previousDate?.toISOString()?.split("T")?.[0];
    apodPictureOfTheDay = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${priorDate}`,
    );
    apodData = await apodPictureOfTheDay.json();
    apodData = { ...apodData, updatedDate: priorDate };
  }
  console.log("Apod", apodData);
  res.json({ message: "NASA get route is working", data: { ...apodData } });
});

export default nasaRouter;
