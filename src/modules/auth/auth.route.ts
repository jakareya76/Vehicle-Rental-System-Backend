import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/signup", authController.SignUp);
router.post("/signin", authController.SignIn);

export const authRoutes = router;
