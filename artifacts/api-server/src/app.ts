import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import honeypotRouter from "./routes/honeypot";
import { logger } from "./lib/logger";

const app: Express = express();

// ── Security headers (Helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // handled by Vite frontend
    crossOriginEmbedderPolicy: false,
  })
);

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General: 200 requests / 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict: 20 requests / 15 min — for write operations and sensitive data
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests on this endpoint." },
});

app.use("/api", generalLimiter);
app.use("/api/admin/login", strictLimiter);
app.use("/api/customers", strictLimiter);
app.use("/api/orders", strictLimiter);

// ── Remove server fingerprinting ──────────────────────────────────────────────
app.disable("x-powered-by");
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("Server");
  next();
});

// ── Honeypot traps (before real routes — catch scanners early) ────────────────
app.use("/api", honeypotRouter);

// ── Real API routes ───────────────────────────────────────────────────────────
app.use("/api", router);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
