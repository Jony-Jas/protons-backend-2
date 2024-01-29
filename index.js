const findNearest = require("./utils/findNearest");
const findOptimal = require("./utils/optimalRoute");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const UserModel = require("./Models/Users");
const StationModel = require("./Models/ChargingStations");
const app = express();
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose.connect(
  "mongodb+srv://Subha-admin:8HwDCsK4EktIdnIa@cluster0.xhhtsqg.mongodb.net/protonsDB"
);

// Global variable to store Stations data
var globalStationsData = [];

const fetchStationData = async (req, res, next) => {
  try {
    const stationsData = await StationModel.find();
    globalStationsData = stationsData;
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

app.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      pwd,
      country,
      license,
      vehicletype,
      modelname,
      mileage,
      batterycapacity,
      chargingtype,
    } = req.body;

    const newUser = await UserModel.create({
      username,
      email,
      pwd,
      country,
      license,
      vehicles: [
        {
          vehicletype,
          modelname,
          mileage: Number(mileage),
          batterycapacity: Number(batterycapacity),
          chargingtype,
        },
      ],
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getAllStations", async (req, res) => {
  const user = await StationModel.find();
  if (user) {
    res.status(200).json({ user });
  } else {
    res.status(404).json({
      message: "No users found",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, pwd } = req.body;

    // Find the user with the provided email
    const user = await UserModel.findOne({
      email,
    });

    if (user) {
      if (user.pwd === pwd) {
        res.status(200).json({
          message: "Login successful",
          user,
        });
      } else {
        res.status(401).json({
          message: "Invalid password",
        });
      }
    } else {
      res.status(401).json({
        message: "Invalid email",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Route to handle finding the nearest charging station
app.post("/findnearest", fetchStationData, async (req, res) => {
  try {
    // user location is sent in the request body
    const userLocation = req.body;
    
    // Transforming globalStationsData into the desired charging station format
    

    
    const nearestStations = findNearest(globalStationsData, userLocation);
    console.log(nearestStations);
    res.status(200).json({
      nearestStations,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

//router to post stations data--->testing purpose
app.post('/setstation', async (req, res) => {
  try {
    const newStation = await StationModel.create(req.body);
    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json(error);
  }
});
app.get("/station", async (req, res) => {
  try {
    const stationData = await StationModel.find();
    res.send(stationData);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/station/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const stationData = await StationModel.findById(id);
    if (!stationData) {
      return res.status(404).send({ message: "Station not found" });
    }
    res.send(stationData);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.post('/addTimeslot/:stationId', async (req, res) => {
  console.log(req.body);

  const stationId = req.params.stationId;
  
  const selectedslot  = req.body;
  console.log("selecte",selectedslot);

  try {
    const station = await StationModel.findById(stationId);

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Add the booked timeslot to the availability array
    station.chargers.forEach((charger) => {
      charger.availability.push({ bookedtime: selectedslot.bookedtime });
    });

    await station.save();

    res.status(200).json({ message: 'Timeslot added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post("/getPath", async (req, res) => {
  const { travelRoute, mileage, batteryLevel } = req.body;

  try {
    const stationData = await StationModel.find();
    //     const chargingStations = [
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
    const result = await findOptimal(
      travelRoute,
      stationData,
      mileage,
      batteryLevel
    );
    console.log(result);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Something went Wrong!" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});