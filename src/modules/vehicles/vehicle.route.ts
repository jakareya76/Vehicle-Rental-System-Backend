import { Router } from "express";
import { vehicleController } from "./vehicle.controller.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const router = Router();

router.post("/", auth(), authorize("admin"), vehicleController.AddVehicle);
router.get("/", vehicleController.GetAllVehicles);
router.get("/:vehicleId", vehicleController.GetSingleVehicle);
router.put(
  "/:vehicleId",
  auth(),
  authorize("admin"),
  vehicleController.UpdateVehicle,
);
router.delete(
  "/:vehicleId",
  auth(),
  authorize("admin"),
  vehicleController.DeleteVehicle,
);

export const vehicleRoutes = router;
