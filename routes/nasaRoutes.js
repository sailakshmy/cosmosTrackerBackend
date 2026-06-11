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

  return `${process.env.NASA_BASE_URL}/planetary/apod?${params.toString()}`;
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

nasaRouter.get(/(.*)/, (req, res, next) => {
  res.set("Cache-Control", "public, max-age=3600");
  next();
});

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
      console.error("Error while fetching APOD from NASA");
      res.status(502).json({
        message: "Could not fetch data from NASA",
        error: error.message,
      });
    }
  }
});

const parseDataFromNeoFeedApi = (neoFeedData) => {
  const totalNeosInTheDateRange = neoFeedData.element_count;
  let hazardousNeos = 0;
  let closestToEarthDistance = Infinity;
  let objectClosestToEarth;
  let highestVelocity = 0;
  let highestVelocityObject;
  // console.log("neoFeedData.near_earth_objects", neoFeedData.near_earth_objects);
  // console.log(
  //   "  Object.keys(neoFeedData.near_earth_objects)",
  //   Object.keys(neoFeedData.near_earth_objects),
  // );
  const nearEarthObjects = neoFeedData.near_earth_objects;
  // Iterate through the near_earth_objects
  Object.keys(nearEarthObjects)?.forEach((nearEarthObject) => {
    const nearEarthObjectDate = nearEarthObjects[nearEarthObject];
    if (nearEarthObjectDate?.length) {
      nearEarthObjectDate?.forEach((nearEarthObjectDay) => {
        if (nearEarthObjectDay?.is_potentially_hazardous_asteroid)
          hazardousNeos++;
        if (nearEarthObjectDay?.close_approach_data?.length) {
          const closeApproachData =
            nearEarthObjectDay?.close_approach_data?.[0];
          closestToEarthDistance = Math.min(
            closestToEarthDistance,
            closeApproachData?.miss_distance?.kilometers,
          );
          if (
            closestToEarthDistance ===
            Number(closeApproachData?.miss_distance?.kilometers)
          ) {
            objectClosestToEarth = {
              name: nearEarthObjectDay?.name,
              id: nearEarthObjectDay?.id,
              neo_reference_id: nearEarthObjectDay?.neo_reference_id,
              ...closeApproachData,
            };
          }
          if (closeApproachData?.relative_velocity) {
            highestVelocity = Math.max(
              highestVelocity,
              closeApproachData?.relative_velocity?.kilometers_per_hour,
            );
            if (
              highestVelocity ===
              Number(closeApproachData?.relative_velocity?.kilometers_per_hour)
            ) {
              highestVelocityObject = {
                ...closeApproachData,
                name: nearEarthObjectDay?.name,
                id: nearEarthObjectDay?.id,
                neo_reference_id: nearEarthObjectDay?.neo_reference_id,
              };
            }
          }
        }
      });
    }
  });
  return {
    totalNeos: totalNeosInTheDateRange,
    hazardousNeos,
    objectClosestToEarth,
    highestVelocityObject,
  };
};

nasaRouter.get("/neo", async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const neoFeedRes = await fetch(
      `${process.env.NASA_BASE_URL}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${process.env.NASA_API_KEY}`,
    );
    const neoFeedData = await neoFeedRes.json();
    // console.log("neoFeedData", neoFeedData);
    const {
      totalNeos: totalNeosInTheDateRange,
      hazardousNeos,
      objectClosestToEarth,
      highestVelocityObject,
    } = parseDataFromNeoFeedApi(neoFeedData);

    res.status(200).json({
      message: "NASA neo get route is working",
      totalNeos: totalNeosInTheDateRange,
      hazardousNeos,
      objectClosestToEarth,
      highestVelocityObject,
      // neoFeedData,
    });
  } catch (e) {
    console.error("Error while fetching NEO Feed from NASA");
    res.status(502).json({
      message: "Could not fetch NEO Feed from NASA",
      error: error.message,
    });
  }
});

export default nasaRouter;
