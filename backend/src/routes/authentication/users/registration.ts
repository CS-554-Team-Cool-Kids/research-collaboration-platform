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
        throw {
          status: 401,
          message:
            "You attempted to access a page without proper authentication",
        };
      }

      const userinfo = await getUserByID(req.session.registrationuserid, {
        _id: 0,
        firstname: 1,
        lastname: 1,
      });

      userinfo.script = "users/setpassword";
      res.render("public/setpassword", userinfo); // Render the view
    } catch (error: any) {
      routeError(res, error); // Handle error appropriately
    }
  }
);

router.patch(
  "/setpassword",
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.session.registrationuserid) {
        throw {
          status: 401,
          message:
            "You attempted to access a page without proper authentication",
        };
      }

      const password = verify.password(req.body.password);
      const passwordconf = verify.password(req.body.passwordconf);

      if (password !== passwordconf) {
        throw { status: 400, message: "Passwords do not match" };
      }

      const result = await setPassword(
        req.session.registrationuserid,
        password
      );

      if (result.acknowledged) {
        delete req.session.registrationuserid; // Prevent user from accessing password setting page
        res.json({ successful: result.acknowledged }); // Respond with success
      } else {
        throw {
          status: 500,
          message: "Password setting request not acknowledged by database",
        };
      }
    } catch (error: any) {
      const statusCode =
        error.status !== 500 && error.status ? error.status : 500;
      const errorMessage = error.message || "Internal Server Error";
      console.error("Error:", errorMessage);
      res.status(statusCode).json({ error: errorMessage }); // Respond with error
    }
  }
);

router.get(
  "/:registrationcode",
  async (req: Request, res: Response): Promise<void> => {
    if (req.session.registrationuserid) {
      res.redirect("/register/setpassword/"); // Redirect if user is authenticated
    } else {
      try {
        const registrationcode = verify.UUID(req.params.registrationcode);
        const user = await getRegistrationInfo(registrationcode);

        res.render("public/registration", {
          // Render the view
          identification: user.identification.type,
          identificationverification: `users/registerby${user.identification.type}`,
          script: "users/registration",
        });
      } catch (error: any) {
        routeError(res, error); // Handle error appropriately
      }
    }
  }
);

router.post(
  "/:registrationcode",
  async (req: Request, res: Response): Promise<void> => {
    if (req.session.registrationuserid) {
      res.redirect("/register/setpassword/"); // Redirect if user is authenticated
    } else {
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
          res.redirect("/register/setpassword/"); // Redirect on success
        } else {
          res.render("public/registration", {
            // Render the view on failure
            identification: user.identification.type,
            identificationverification: `users/registerby${user.identification.type}`,
            error: "Invalid identification",
            script: "users/registration",
          });
        }
      } catch (error: any) {
        routeError(res, error); // Handle error appropriately
      }
    }
  }
);

export default router;
