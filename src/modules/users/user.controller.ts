import { Request, Response } from "express";
import { userService } from "./user.service.js";

const GetAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.GetAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
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

const UpdateUser = async (req: Request, res: Response) => {
  const { userId: id } = req.params;
  const { name, email, phone, role } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing or invalid token",
      });
    }

    if (req.user.role !== "admin") {
      if (req.user.id !== Number(id)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You do not have permission to access this resource",
        });
      }

      if (role) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You cannot change your role",
        });
      }
    }

    const result = await userService.UpdateUser(
      id as string,
      name,
      email,
      phone,
      role,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
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

const DeleteUser = async (req: Request, res: Response) => {
  const { userId: id } = req.params;

  try {
    const existing = await userService.GetSingleUser(id as string);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "User not found",
      });
    }

    const activeBookingCheck = await userService.HasActiveBookings(id as string);

    if (activeBookingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active bookings",
        errors: "User has active bookings",
      });
    }

    await userService.DeleteNonActiveBookings(id as string);
    await userService.DeleteUser(id as string);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.message,
    });
  }
};

export const userController = {
  GetAllUsers,
  UpdateUser,
  DeleteUser,
};
