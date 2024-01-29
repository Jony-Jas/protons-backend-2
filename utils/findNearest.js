function findNearest(chargingStations, userLocation) {
    // Sort based on distance between user and charging station
    chargingStations.sort(function (a, b) {
      return (
        getDistance(userLocation, a) - getDistance(userLocation, b)
      );
    });
  
    // Return the sorted chargingStations array
    return chargingStations;
  }
  
  function getDistance(userLocation, chargingStation) {
    return Math.sqrt(
      Math.pow(userLocation.lat - chargingStation.lat, 2) +
        Math.pow(userLocation.lng - chargingStation.lng, 2)
    );
  }
  

//Example format
//   const chargingStations = [
//     {
//       id: "A",
//       lat: 8.363712, 
//       lng: 77.297704,
//     },
//     {
//       id: "B",
//       lat: 8.366956, 
//       lng: 77.298635,
//     },
//     {
//       id: "C",
//       lat: 8.354564, 
//       lng: 77.287403,
//     },
//   ];
//   const userLocation = {
//     lat: 8.369144,
//     lng: 77.299071,
//   };

// fetch charging stations and get user location then call findNearest
//   console.log(findNearest(chargingStations, userLocation));


module.exports = findNearest;  