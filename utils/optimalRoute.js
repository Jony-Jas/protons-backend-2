const findNearest = require("./findNearest");

// const mileage = 6; //kms //get from user or db
// let batteryLevel = 100; //% //get from user

async function calculateDistance(route, stations) {
  let path = "";
  path = path + route[0][1] + "," + route[0][0] + ";";
  stations.forEach((station) => {
    path = path + station[1] + "," + station[0] + ";";
  });
  path = path + route[1][1] + "," + route[1][0];

  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${path}`;
  const data = await (await fetch(url)).json();
  return data.routes[0].distance / 1000;
}

async function findOptimal(travelRoute, chargingStations, mileage, batteryLevel) {
  try {
    const userLoc = {
      lat: travelRoute[0][0],
      lng: travelRoute[0][1],
    };
    let distanceTravelled = 0;
    let totalDistance = 0;
    const visitedChargingStations = [];

    totalDistance = await calculateDistance(travelRoute, visitedChargingStations);

    while (distanceTravelled < totalDistance) {
      let canTravelDistance = (batteryLevel / 100) * mileage;
      if (canTravelDistance > totalDistance - distanceTravelled) {
        return [travelRoute[0], ...visitedChargingStations, travelRoute[1]];
      }

      const sortedChargingStations = findNearest(chargingStations, userLoc);
      if (sortedChargingStations.length == 0) {
        throw new Error("Cant travel with current battery level");
      }
      const nrstChargingStation = sortedChargingStations[0];
      chargingStations.splice(0, 1);
      const chargingStationDistance = await calculateDistance(
        [
          [userLoc.lat, userLoc.lng],
          [nrstChargingStation.lat, nrstChargingStation.lng],
        ],
        []
      );

      if (chargingStationDistance < canTravelDistance) {
        visitedChargingStations.push([
          nrstChargingStation.lat,
          nrstChargingStation.lng,
        ]);
      } else {
        throw new Error("Cant travel with current battery level");
      }

      batteryLevel = 100;
      distanceTravelled += chargingStationDistance;
      userLoc.lat = nrstChargingStation.lat;
      userLoc.lng = nrstChargingStation.lng;
      totalDistance = await calculateDistance(
        travelRoute,
        visitedChargingStations
      );
    }

    return [travelRoute[0], ...visitedChargingStations, travelRoute[1]];
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
}

// Example format
// const travelRoute = [
//   [8.369144, 77.299071],
//   [8.305849, 77.226091],
// ];
// const chargingStations = [
//   {
//     id: "Thiruvattar",
//     lat: 8.335736,
//     lng: 77.273402,
//   },
//   {
//     id: "UK",
//     lat: 8.307578,
//     lng: 77.241398,
//   },
//   {
//     id: "Marthandam",
//     lat: 8.306234,
//     lng: 77.224973,
//   },
// ];
// findOptimal(travelRoute, chargingStations, 6, 100).then((res) => {
//   console.log(res);
// });

module.exports = findOptimal;
