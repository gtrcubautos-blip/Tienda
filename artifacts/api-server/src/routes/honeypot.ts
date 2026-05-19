import { Router } from "express";

const router = Router();

// Decoy endpoints — return plausible fake data and log the requester
const FAKE_USERS = [
  { id: 1, username: "admin", role: "superuser", created: "2024-01-01" },
  { id: 2, username: "root", role: "admin", created: "2024-01-02" },
];

function logHoneypot(req: Parameters<Parameters<typeof router.use>[0]>[0], trap: string) {
  req.log.warn(
    { trap, ip: req.ip, ua: req.headers["user-agent"], path: req.originalUrl },
    "HONEYPOT triggered — possible scan/attack"
  );
}

router.post("/login", (req, res) => {
  logHoneypot(req, "/api/login");
  // Simulate slow auth check then reject
  setTimeout(() => res.status(401).json({ error: "Invalid credentials" }), 800);
});

router.get("/users", (req, res) => {
  logHoneypot(req, "/api/users");
  res.status(403).json({ error: "Access denied" });
});

router.get("/admin/users", (req, res) => {
  logHoneypot(req, "/api/admin/users");
  res.status(403).json({ error: "Forbidden" });
});

router.get("/database", (req, res) => {
  logHoneypot(req, "/api/database");
  res.status(403).json({ error: "Forbidden" });
});

router.get("/config", (req, res) => {
  logHoneypot(req, "/api/config");
  res.status(403).json({ error: "Forbidden" });
});

router.get("/env", (req, res) => {
  logHoneypot(req, "/api/env");
  res.status(403).json({ error: "Forbidden" });
});

router.get("/backup", (req, res) => {
  logHoneypot(req, "/api/backup");
  res.status(403).json({ error: "Forbidden" });
});

router.get("/phpinfo.php", (req, res) => {
  logHoneypot(req, "phpinfo.php");
  res.status(404).send("Not Found");
});

router.get("/wp-admin", (req, res) => {
  logHoneypot(req, "wp-admin");
  res.status(404).send("Not Found");
});

// Catch-all fake data leak (returns decoy user list to confuse automated tools)
router.get("/api-docs/users", (req, res) => {
  logHoneypot(req, "/api/api-docs/users");
  res.json(FAKE_USERS);
});

export default router;
