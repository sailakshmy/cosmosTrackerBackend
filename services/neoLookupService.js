const getNeoLookUpUrl = (neoId) => {
  const params = new URLSearchParams({ api_key: process.env.NASA_API_KEY });

  return `${process.env.NASA_BASE_URL}/neo/rest/v1/neo/${neoId}?${params.toString()}`;
};

export const getNeoLookUp = async (neoId) => {
  const neoLookUpRes = await fetch(getNeoLookUpUrl(neoId));
  const neoLookUpResJSON = await neoLookUpRes.json();
  return neoLookUpResJSON;
};
