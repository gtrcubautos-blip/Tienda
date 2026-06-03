import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { verifyAdminPassword, createAdminToken } from "../lib/adminAuth";

const router = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Entrada inválida" });
    return;
  }
  if (!verifyAdminPassword(parsed.data.password)) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }
  const token = createAdminToken();
  if (!token) {
    req.log.error("Cannot issue admin token: ADMIN_PASSWORD not configured");
    res.status(500).json({ error: "Autenticación no configurada" });
    return;
  }
  res.json({ token });
});

export default router;
