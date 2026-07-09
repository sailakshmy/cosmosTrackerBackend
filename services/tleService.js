export const getTleList = async () => {
  const tleRes = await fetch(`http://tle.ivanstanojevic.me/api/tle`);
  const tleData = await tleRes?.json();
  return tleData;
};
