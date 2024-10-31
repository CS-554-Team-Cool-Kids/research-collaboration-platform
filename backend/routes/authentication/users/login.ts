import { Router, Request, Response } from "express";
import login from "../../../data/authentication/users/login";
import verify from "../../../data_validation";

const router = Router();

router.get("/", (req: Request, res: Response): void => {
  const renderObjs = {
    script: "login",
  };
  res.render("public/login", renderObjs);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // Validate the email and password
    const email = verify.email(data.email);
    const password = verify.password(data.password);

    // Attempt to log in
    const result = await login(email, password);

    // If login is successful, set session variables
    if (result.successful) {
      req.session.userid = result.id;
      req.session.type = result.type;
      req.session.name = result.name;
      req.session.email = result.email;
      req.session.darkmode = result.preferences.darkmode || 0;
    }

    // Respond with login status
    res.json({ loggedin: result.successful });
  } catch (e: any) {
    // Handle errors appropriately
    if (e.status && e.status !== 500) {
      res.status(e.status).json({ error: e.message });
    } else {
      console.error("Error:", e.message || e);
      res.status(500).json({ error: "Login error" });
    }
  }
});

export default router;
