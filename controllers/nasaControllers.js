import { getFeed } from "../services/neoFeedService.js";
import { getApod } from "../services/apodService.js";
import { getNeoLookUp } from "../services/neoLookupService.js";
export const getApodController = async (req, res) => {
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
};

export const getNeoFeedController = async (req, res) => {
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
};

export const getTLEListController = async (req, res) => {
  try {
    const tleListRes = await getNeoLookUp(neoId);
    console.log("Data from the tle list route", tleListRes);
    return res.status(200).json(tleListRes);
  } catch (err) {
    return res.status(500).json({
      message: "Could not fetch the tle list data from NASA",
      error: err.message,
    });
  }
};
