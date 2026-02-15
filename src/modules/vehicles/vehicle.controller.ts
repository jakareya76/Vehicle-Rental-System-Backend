import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service.js";

const AddVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.AddVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

const GetAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.GetAllVehicles();

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

const GetSingleVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const result = await vehicleService.GetSingleVehicle(vehicleId as string);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

const UpdateVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;

  try {
    const result = await vehicleService.UpdateVehicle(
      vehicleId as string,
      vehicle_name as string,
      type as string,
      registration_number as string,
      daily_rent_price as string,
      availability_status as string,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

const DeleteVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const existing = await vehicleService.GetSingleVehicle(vehicleId as string);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle not found",
      });
    }

    const activeBookingCheck = await vehicleService.HasActiveBookings(
      vehicleId as string,
    );

    if (activeBookingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete vehicle with active bookings",
        errors: "Vehicle has active bookings",
      });
    }

    await vehicleService.DeleteVehicle(vehicleId as string);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

export const vehicleController = {
  AddVehicle,
  GetAllVehicles,
  GetSingleVehicle,
  UpdateVehicle,
  DeleteVehicle,
};
