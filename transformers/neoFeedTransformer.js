export const parseDataFromNeoFeedApi = (neoFeedData) => {
  const totalNeosInTheDateRange = neoFeedData?.element_count;
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
      }
    });
    return {
      totalNeos: totalNeosInTheDateRange,
      hazardousNeos,
      objectClosestToEarth,
      highestVelocityObject,
    };
  } else
    return {
      message:
        "No response received for this selected period. Please try a shorter date range period.",
    };
};
