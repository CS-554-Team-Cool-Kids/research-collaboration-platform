import { Router, Request, Response } from "express";
import verify from "../../../data_validation";
import createUser from "../../../data/authentication/administration/createuser";

const router = Router();

router.get("/create", (req: Request, res: Response): void => {
  const session = req.session as any; // Cast to any or define your session interface

  const renderObjs = {
    session_name: session.name,
    session_type: session.type,
    session_email: session.email,
    script: "users/createuser",
  };

  // Ensure to send a response
  res.render("admin/createuser", renderObjs);
});

router.put("/create", async (req: Request, res: Response): Promise<void> => {
  try {
    const firstname = verify.name(req.body.firstname);
    const lastname = verify.name(req.body.lastname);
    const email = verify.email(req.body.email);
    const accountType = verify.accountType(req.body.accountype);

    const status = await createUser(firstname, lastname, email, accountType);

    if (status.successful) {
      res.json(status);
    } else {
      const error = {
        status: 500,
        message: `An unexpected error has occurred. The request is as follows: 
        firstname: ${req.body.firstname}
        lastname: ${req.body.lastname}
        email: ${req.body.email}
        accounttype: ${req.body.accountype}
        `,
      };
      throw error;
    }
  } catch (e: any) {
    if (e.status && e.status !== 500) {
      res.status(e.status).json({ error: e.message });
    } else {
      console.log(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
