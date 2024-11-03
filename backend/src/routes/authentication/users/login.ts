import { Router, Request, Response } from "express";
import login from "../../../data/authentication/users/login";
import verify from "../../../data_validation";

const router = Router();

// Define a route for the login page (optional for documentation)
router.get("/", (req: Request, res: Response): void => {
  // You can return a message or status if you want
  res.status(200).json({ message: "Login endpoint. Use POST to log in." });
});

// Handle login requests
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // Validate the email and password
    const email = verify.email(data.email);
    const password = verify.password(data.password);

    // Attempt to log in
    const result = await login(email, password);

    // If login is successful, set session variables (optional for API)
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
