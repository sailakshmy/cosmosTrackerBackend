import NodeCache from "node-cache";

const nasaCache = new NodeCache({ stdTTL: 86400 });

const getNeoLookUpUrl = (neoId) => {
  const params = new URLSearchParams({ api_key: process.env.NASA_API_KEY });

  return `${process.env.NASA_BASE_URL}/neo/rest/v1/neo/${neoId}?${params.toString()}`;
};

export const getNeoLookUp = async (neoId) => {
  const neoLookUpDataCache = nasaCache.get(neoId);
  let neoLookUpData;
  let message;
  if (!neoLookUpDataCache) {
    try {
      const neoLookUpRes = await fetch(getNeoLookUpUrl(neoId));
      if (neoLookUpRes.ok) {
        const neoLookUpResJSON = await neoLookUpRes.json();
        nasaCache.set(neoId, neoLookUpResJSON);
        message = "NASA Neo LookUp Route is working";
        neoLookUpData = { ...neoLookUpResJSON };
      } else {
        throw new Error(`NASA Neo Lookup API returned ${neoLookUpRes.status}`);
      }
    } catch (err) {
      console.error("Error while fetching NEO LookUp details from NASA");
      throw err;
    }
  } else {
    message = "NASA Neo LookUp Route fetched data from the server cache";
    neoLookUpData = { ...neoLookUpDataCache };
  }
  return {
    message,
    neoLookUpData,
  };
};
