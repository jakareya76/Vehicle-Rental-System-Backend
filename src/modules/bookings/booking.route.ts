import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { bookingController } from "./booking.controller.js";

const router = Router();

router.post("/", auth(), bookingController.CreateBooking);
router.get("/", auth(), bookingController.GetAllBookings);
router.put("/:bookingId", auth(), bookingController.UpdateBooking);

export const bookingRoutes = router;

