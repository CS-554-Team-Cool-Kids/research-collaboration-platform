import { rateLimit, Options } from "express-rate-limit";

const ratelimit: { [key: string]: ReturnType<typeof rateLimit> } = {
  login: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 50,
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  } as Options),

  registration: rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    limit: 50,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  } as Options),

  passwordresets: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 12, // Strict to prevent spamming
    standardHeaders: "draft-7",
    legacyHeaders: false,
  } as Options),

  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  } as Options),
};

export default ratelimit;
