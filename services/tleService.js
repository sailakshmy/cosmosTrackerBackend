export const getTleList = async () => {
  let tleListData;
  let message;
  try {
    const tleRes = await fetch(`${process.env.TLE_API}`);
    if (tleRes.ok) {
      const tleData = await tleRes?.json();
      message = "NASA TLE List Route is working";
      tleListData = { ...tleData };
    } else {
      throw new Error(`NASA TLE List API returned ${tleRes.status}`);
    }
  } catch (e) {
    console.error("Error while fetching TLE List from NASA");
    throw e;
  }
  return {
    tleListData,
    message,
  };
};
