import { Router } from "express";
import { db } from "@workspace/db";
import { lawyersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createLawyerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  oab: z.string(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  isAdmin: z.boolean().optional(),
});

const updateLawyerSchema = z.object({
  name: z.string().optional(),
  oab: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

async function getLawyerWithCount(id: number) {
  const lawyer = await db.query.lawyersTable.findFirst({
    where: eq(lawyersTable.id, id),
  });
  if (!lawyer) return null;

  const result = await db.execute(
    sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${id} AND status IN ('active', 'pending')`
  );
  const activeCaseCount = parseInt((result.rows[0] as any)?.count ?? "0");
  const { password, ...safe } = lawyer;
  return { ...safe, activeCaseCount };
}

router.get("/", async (req, res) => {
  const lawyers = await db.query.lawyersTable.findMany();
  const result = await Promise.all(lawyers.map(async (l) => {
    const r = await db.execute(
      sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${l.id} AND status IN ('active', 'pending')`
    );
    const activeCaseCount = parseInt((r.rows[0] as any)?.count ?? "0");
    const { password, ...safe } = l;
    return { ...safe, activeCaseCount };
  }));
  return res.json(result);
});

router.post("/", async (req, res) => {
  const parsed = createLawyerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const [lawyer] = await db.insert(lawyersTable).values(parsed.data).returning();
  const { password, ...safe } = lawyer;
  return res.status(201).json({ ...safe, activeCaseCount: 0 });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const lawyer = await getLawyerWithCount(id);
  if (!lawyer) return res.status(404).json({ error: "Not found" });
  return res.json(lawyer);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateLawyerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const [lawyer] = await db.update(lawyersTable)
    .set(parsed.data)
    .where(eq(lawyersTable.id, id))
    .returning();

  if (!lawyer) return res.status(404).json({ error: "Not found" });
  const lawyer2 = await getLawyerWithCount(id);
  return res.json(lawyer2);
});

export default router;
