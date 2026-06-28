import NodeCache from "node-cache";
import { parseDataFromNeoFeedApi } from "../transformers/neoFeedTransformer.js";
const nasaCache = new NodeCache({ stdTTL: 86400 });
export const getFeed = async ({ startDate, endDate }) => {
  const neoCache = nasaCache.get(`${startDate}-${endDate}`);
  let neoFeedData;
  let message;
  if (!neoCache) {
    try {
      const neoFeedRes = await fetch(
        `${process.env.NASA_BASE_URL}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${process.env.NASA_API_KEY}`,
      );
      if (neoFeedRes.ok) {
        neoFeedData = await neoFeedRes.json();
        nasaCache.set(`${startDate}-${endDate}`, neoFeedData);
        message = "NASA neo get route is working";
        // console.log("neoFeedData", neoFeedData);
      } else throw new Error(`NASA API returned ${neoFeedRes.status}`);
    } catch (error) {
      console.error("Error while fetching NEO Feed from NASA");
      throw error;
    }
  } else {
    neoFeedData = { ...neoCache };
    message = "NASA Neo GET Route fetched data from the server cache";
  }
  const {
    totalNeos: totalNeosInTheDateRange,
    hazardousNeos,
    objectClosestToEarth,
    highestVelocityObject,
    nearEarthObjectList,
    message: errorMessageFromNeoApi,
  } = parseDataFromNeoFeedApi(neoFeedData);
  if (errorMessageFromNeoApi) {
    throw Error(errorMessageFromNeoApi);
  } else
    return {
      message,
      totalNeos: totalNeosInTheDateRange,
      hazardousNeos,
      objectClosestToEarth,
      highestVelocityObject,
      nearEarthObjectList,
    };
};
