import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response): void => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }
    res.redirect("/login");
  });
});

export default router;
