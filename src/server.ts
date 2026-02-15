import express from "express";

import config from "./config/index.js";
import initDB from "./config/db.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { vehicleRoutes } from "./modules/vehicles/vehicle.route.js";
import { userRoutes } from "./modules/users/user.route.js";
import { bookingRoutes } from "./modules/bookings/booking.route.js";

const app = express();
const port = config.port;

initDB();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`app is listing on port ${port}`);
});
