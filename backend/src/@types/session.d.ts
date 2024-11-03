// @types/session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    [key: string]: any;
  }
}
