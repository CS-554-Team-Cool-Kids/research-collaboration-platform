// express-session.d.ts
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      session: any; // You can specify a more detailed structure if needed
    }
  }
}
