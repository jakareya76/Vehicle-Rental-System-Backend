import { Request, Response } from "express";
import { authServices } from "./auth.service.js";

const SignUp = async (req: Request, res: Response) => {
  try {
    const result = await authServices.SignUp(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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

const SignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authServices.SignIn(
      email as string,
      password as string,
    );

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user,
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

export const authController = {
  SignUp,
  SignIn,
};
