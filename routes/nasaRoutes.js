import express from "express";
import "dotenv/config";
import NodeCache from "@cacheable/node-cache";

const nasaRouter = express.Router();
const nasaCache = new NodeCache({ stdTTL: 8640000 });

const getApodUrl = (date) => {
  const params = new URLSearchParams({ api_key: process.env.NASA_API_KEY });

  if (date) {
    params.set("date", date);
  }

  return `https://api.nasa.gov/planetary/apod?${params.toString()}`;
};

const fetchApod = async (date) => {
  const response = await fetch(getApodUrl(date));
  const body = await response.text();

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(
      `NASA API returned non-JSON response (${response.status}): ${body.slice(
        0,
        120,
      )}`,
    );
  }

  if (!response.ok && !data?.msg?.includes("No data available for date")) {
    throw new Error(
      data?.msg ||
        data?.error?.message ||
        `NASA API request failed with status ${response.status}`,
    );
  }

  return data;
};

nasaRouter.get("/", async (req, res) => {
  const { date, firstLoad } = req.query;
  console.log("Req", req.query);
  const cachedResponse = nasaCache.get(date);
  if (cachedResponse) {
    res
      .status(200)
      .json({ message: "NASA cache is working", data: { ...cachedResponse } });
  } else {
    try {
      let apodData = await fetchApod(date);
      if (
        firstLoad !== "true" &&
        apodData?.msg?.includes("No data available for date")
      ) {
        console.log("No available data block");
        const previousDate = new Date();
        previousDate.setDate(previousDate.getDate() - 1);
        const priorDate = previousDate.toISOString().split("T")[0];
        apodData = await fetchApod(priorDate);
        apodData = { ...apodData, updatedDate: priorDate };
      }

      console.log("Apod", apodData);
      nasaCache.set(date, apodData);
      res
        .status(200)
        .json({ message: "NASA get route is working", data: { ...apodData } });
    } catch (error) {
      console.error(error);
      res.status(502).json({
        message: "Could not fetch data from NASA",
        error: error.message,
      });
    }
  }
});

export default nasaRouter;
