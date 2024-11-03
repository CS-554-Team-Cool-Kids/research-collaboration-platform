import { Request, Response, NextFunction } from "express";

const adminsOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.type === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};

export default adminsOnly;
