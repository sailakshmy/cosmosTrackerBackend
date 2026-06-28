export const parseDataFromNeoFeedApi = (neoFeedData) => {
  const totalNeosInTheDateRange = neoFeedData?.element_count;
  let hazardousNeos = 0;
  let closestToEarthDistance = Infinity;
  let objectClosestToEarth;
  let highestVelocity = 0;
  let highestVelocityObject;
  const nearEarthObjectList = [];

  const nearEarthObjects = neoFeedData?.near_earth_objects;
  if (nearEarthObjects) {
    // Iterate through the near_earth_objects
    Object.keys(nearEarthObjects)?.forEach((nearEarthObject) => {
      const nearEarthObjectDate = nearEarthObjects?.[nearEarthObject];
      if (nearEarthObjectDate?.length) {
        nearEarthObjectDate?.forEach((nearEarthObjectDay) => {
          if (nearEarthObjectDay?.is_potentially_hazardous_asteroid)
            hazardousNeos++;
          if (nearEarthObjectDay?.close_approach_data?.length) {
            const closeApproachData =
              nearEarthObjectDay?.close_approach_data?.[0];
            const missDistanceKm = Number(
              closeApproachData?.miss_distance?.kilometers,
            );
            closestToEarthDistance = Math.min(
              closestToEarthDistance,
              missDistanceKm,
            );
            if (closestToEarthDistance === missDistanceKm) {
              objectClosestToEarth = {
                name: nearEarthObjectDay?.name,
                id: nearEarthObjectDay?.id,
                neo_reference_id: nearEarthObjectDay?.neo_reference_id,
                ...closeApproachData,
              };
            }
            if (closeApproachData?.relative_velocity) {
              const relativeVelKmPH = Number(
                closeApproachData?.relative_velocity?.kilometers_per_hour,
              );
              highestVelocity = Math.max(highestVelocity, relativeVelKmPH);
              if (highestVelocity === relativeVelKmPH) {
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
        if (nearEarthObjectDate?.length > 1) {
          nearEarthObjectDate?.sort((nearEarthObject1, nearEarthObject2) => {
            const epochDate1 =
              nearEarthObject1?.close_approach_data?.[0]
                ?.epoch_date_close_approach;
            const epochDate2 =
              nearEarthObject2?.close_approach_data?.[0]
                ?.epoch_date_close_approach;
            return new Date(epochDate1) - new Date(epochDate2);
          });
        }
        nearEarthObjectList.push({
          [nearEarthObject]: [...nearEarthObjectDate],
        });
      }
    });
    nearEarthObjectList?.sort((obj1, obj2) => {
      const date1 = Object.keys(obj1)?.[0];
      const date2 = Object.keys(obj2)?.[0];
      return new Date(date1) - new Date(date2);
    });
    return {
      totalNeos: totalNeosInTheDateRange,
      hazardousNeos,
      objectClosestToEarth,
      highestVelocityObject,
      nearEarthObjectList,
    };
  } else
    return {
      message:
        "No response received for this selected period. Please try a shorter date range period.",
    };
};
