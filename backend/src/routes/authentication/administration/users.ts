import { Router, Request, Response } from "express";
import verify from "../../../data_validation";
import createUser from "../../../data/authentication/administration/createuser";

const router = Router();

// Optional: You can keep this route for documentation or testing purposes
router.get("/create", (req: Request, res: Response): void => {
  // This can just return a message or an empty object as you're not rendering a view
  res
    .status(200)
    .json({ message: "User creation endpoint. Use POST to create a user." });
});

// Handle user creation requests
router.put("/create", async (req: Request, res: Response): Promise<void> => {
  try {
    const firstname = verify.name(req.body.firstname);
    const lastname = verify.name(req.body.lastname);
    const email = verify.email(req.body.email);
    const accountType = verify.accountType(req.body.accountype);

    const status = await createUser(firstname, lastname, email, accountType);

    if (status.successful) {
      res.status(201).json(status); // Use 201 for created resource
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
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
