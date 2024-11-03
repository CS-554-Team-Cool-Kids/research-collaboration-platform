import { Router, Request, Response } from "express";
import verify from "../../../data_validation";
import getUserByID from "../../../data/authentication/users/getUserInfoByID";
import getRegistrationInfo from "../../../data/authentication/users/getRegistrationInfo";
import setPassword from "../../../data/authentication/users/setPasswordByID";
import routeError from "../../routeerror";

const router = Router();

router.get(
  "/setpassword",
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.session.registrationuserid) {
        res.status(401).json({ message: "Unauthorized access attempt" });
        return;
      }

      const userinfo = await getUserByID(req.session.registrationuserid, {
        _id: 0,
        firstname: 1,
        lastname: 1,
      });

      res.json({ userinfo, script: "users/setpassword" });
    } catch (e) {
      routeError(res, e as Error);
    }
  }
);

router.patch(
  "/setpassword",
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.session.registrationuserid) {
        res.status(401).json({ message: "Unauthorized access attempt" });
        return;
      }

      const password = verify.password(req.body.password);
      const passwordconf = verify.password(req.body.passwordconf);

      if (password !== passwordconf) {
        res.status(400).json({ message: "Passwords do not match" });
        return;
      }

      const result = await setPassword(
        req.session.registrationuserid,
        password
      );

      if (result.acknowledged) {
        delete req.session.registrationuserid;
        res.json({ successful: true });
      } else {
        res
          .status(500)
          .json({ message: "Database did not acknowledge request" });
      }
    } catch (e) {
      const error = e as { status?: number; message?: string };
      res
        .status(error.status || 500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }
);

router.get(
  "/:registrationcode",
  async (req: Request, res: Response): Promise<void> => {
    if (req.session.registrationuserid) {
      res.status(400).json({ message: "User already registered" });
      return;
    }
    try {
      const registrationcode = verify.UUID(req.params.registrationcode);
      const user = await getRegistrationInfo(registrationcode);

      res.json({
        identification: user.identification.type,
        identificationverification: `users/registerby${user.identification.type}`,
        script: "users/registration",
      });
    } catch (e) {
      routeError(res, e as Error);
    }
  }
);

router.post(
  "/:registrationcode",
  async (req: Request, res: Response): Promise<void> => {
    if (req.session.registrationuserid) {
      res.status(400).json({ message: "User already registered" });
      return;
    }
    try {
      const registrationcode = verify.UUID(req.params.registrationcode);
      const user = await getRegistrationInfo(registrationcode);

      const idnum = req.body.idconf;
      const idtype = req.body.idtype;

      if (
        user.identification.type === idtype &&
        user.identification.number === idnum
      ) {
        req.session.registrationuserid = user._id;
        res.json({ successful: true, redirect: "/register/setpassword/" });
      } else {
        res.status(400).json({ message: "Invalid identification details" });
      }
    } catch (e) {
      routeError(res, e as Error);
    }
  }
);

export default router;
