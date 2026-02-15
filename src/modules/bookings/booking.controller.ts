import { Request, Response } from "express";
import { bookingService } from "./booking.service.js";
import { dayDiff } from "../../utils/date.js";

const CreateBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing or invalid token",
      });
    }

    const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
      req.body;

    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: "Missing required fields",
      });
    }

    const role = req.user.role;
    const customerId =
      role === "admin" ? Number(customer_id) : Number(req.user.id);

    if (role === "admin" && !customer_id) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: "customer_id is required for admin booking",
      });
    }

    if (role !== "admin" && customer_id && Number(customer_id) !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You do not have permission to access this resource",
      });
    }

    const days = dayDiff(rent_start_date, rent_end_date);
    if (!Number.isFinite(days) || days <= 0) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: "Invalid rent dates",
      });
    }

    const vehicle = await bookingService.GetVehicle(String(vehicle_id));

    if (vehicle.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }

    if (vehicle.rows[0].availability_status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available",
        errors: "Vehicle is already booked",
      });
    }

    const daily = Number(vehicle.rows[0].daily_rent_price);
    const total_price = daily * days;

    const bookingResult = await bookingService.CreateBooking(
      customerId,
      Number(vehicle_id),
      rent_start_date,
      rent_end_date,
      total_price,
    );

    if (bookingResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available",
        errors: "Vehicle is already booked",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        ...bookingResult.rows[0],
        vehicle: {
          vehicle_name: vehicle.rows[0].vehicle_name,
          daily_rent_price: daily,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

const GetAllBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing or invalid token",
      });
    }

    await bookingService.AutoReturnExpiredBookings();

    if (req.user.role === "admin") {
      const result = await bookingService.GetAllBookingsForAdmin();
      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result.rows,
      });
    }

    const result = await bookingService.GetAllBookingsForCustomer(
      Number(req.user.id),
    );

    return res.status(200).json({
      success: true,
      message: "Your bookings retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

const UpdateBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing or invalid token",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: "Missing status",
      });
    }

    const booking = await bookingService.GetBookingById(String(bookingId));

    if (booking.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errors: "Booking not found",
      });
    }

    const bookingRow = booking.rows[0];

    if (bookingRow.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: "Only active bookings can be updated",
      });
    }

    if (req.user.role !== "admin") {
      if (Number(req.user.id) !== Number(bookingRow.customer_id)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You do not have permission to access this resource",
        });
      }

      if (status !== "cancelled") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "Customers can only cancel bookings",
        });
      }

      const startDate = new Date(bookingRow.rent_start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);

      if (startDate <= today) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel booking after start date",
          errors: "Cancellation not allowed",
        });
      }
    }

    if (req.user.role === "admin" && status !== "returned") {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        errors: "Admin can only mark booking as returned",
      });
    }

    const updated = await bookingService.UpdateBookingStatus(
      String(bookingId),
      status,
      Number(bookingRow.vehicle_id),
    );

    if (status === "returned") {
      return res.status(200).json({
        success: true,
        message: "Booking marked as returned. Vehicle is now available",
        data: {
          ...updated.rows[0],
          vehicle: { availability_status: "available" },
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updated.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

export const bookingController = {
  CreateBooking,
  GetAllBookings,
  UpdateBooking,
};
