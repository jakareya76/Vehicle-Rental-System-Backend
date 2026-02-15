import { NextFunction, Request, Response } from "express";

const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

export default authorize;
