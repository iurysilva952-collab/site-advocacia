import { Router } from "express";
import { db } from "@workspace/db";
import { lawyersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", message: "Email and password required" });
  }

  const { email, password } = parsed.data;
  const lawyer = await db.query.lawyersTable.findFirst({
    where: eq(lawyersTable.email, email),
  });

  if (!lawyer || lawyer.password !== password) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
  }

  (req.session as any).lawyerId = lawyer.id;

  const { password: _pw, ...safeResult } = lawyer;
  const activeCaseCount = 0;
  return res.json({ lawyer: { ...safeResult, activeCaseCount }, message: "Login successful" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  return res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const lawyerId = (req.session as any).lawyerId;
  if (!lawyerId) {
    return res.status(401).json({ error: "Unauthorized", message: "Not authenticated" });
  }

  const lawyer = await db.query.lawyersTable.findFirst({
    where: eq(lawyersTable.id, lawyerId),
  });

  if (!lawyer) {
    return res.status(401).json({ error: "Unauthorized", message: "Lawyer not found" });
  }

  const activeCaseCountResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${lawyer.id} AND status IN ('active', 'pending')`
  );
  const activeCaseCount = parseInt((activeCaseCountResult.rows[0] as any)?.count ?? "0");

  const { password, ...safeResult } = lawyer;
  return res.json({ ...safeResult, activeCaseCount });
});

export default router;
