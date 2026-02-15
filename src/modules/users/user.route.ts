import { Router } from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { userController } from "./user.controller.js";

const router = Router();

router.get("/", auth(), authorize("admin"), userController.GetAllUsers);
router.put("/:userId", auth(), userController.UpdateUser);
router.delete(
  "/:userId",
  auth(),
  authorize("admin"),
  userController.DeleteUser,
);

export const userRoutes = router;
