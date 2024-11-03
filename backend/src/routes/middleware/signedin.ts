import { Request, Response, NextFunction } from "express";

const signin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.userid) {
    next();
  } else {
    res.redirect("/login/");
  }
};

export default signin;
