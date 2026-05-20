import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const startedAt = Date.now();

router.get("/healthz", (_req, res) => {
  // Liveness: fast, no external deps. Used by the platform to know the
  // process is up. Keep this cheap so platform restarts complete quickly.
  res.setHeader("Cache-Control", "no-store");
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, uptimeMs: Date.now() - startedAt });
});

export default router;
