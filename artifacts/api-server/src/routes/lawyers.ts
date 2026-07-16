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
  ufOab: z.string().optional(),

  cpf: z.string().optional(),
  rg: z.string().optional(),
  phone: z.string().optional(),

  specialty: z.string().optional(),
  role: z.string().optional(),

  bio: z.string().optional(),
  avatarUrl: z.string().optional(),

  isAdmin: z.boolean().optional(),
});

const updateLawyerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),

  oab: z.string().optional(),
  ufOab: z.string().optional(),

  cpf: z.string().optional(),
  rg: z.string().optional(),
  phone: z.string().optional(),

  specialty: z.string().optional(),
  role: z.string().optional(),

  bio: z.string().optional(),
  avatarUrl: z.string().optional(),

  isAdmin: z.boolean().optional(),
});

async function getLawyerWithCount(id: number) {
  const lawyer = await db.query.lawyersTable.findFirst({
    where: eq(lawyersTable.id, id),
  });

  if (!lawyer) return null;

  const result = await db.execute(
    sql`SELECT COUNT(*) as count
        FROM cases
        WHERE lawyer_id = ${id}
        AND status IN ('active', 'pending')`
  );

  const activeCaseCount = parseInt((result.rows[0] as any)?.count ?? "0");

  const { password, ...safe } = lawyer;

  return {
    ...safe,
    activeCaseCount,
  };
}

router.get("/", async (req, res) => {
  const lawyers = await db.query.lawyersTable.findMany();

  const result = await Promise.all(
    lawyers.map(async (lawyer) => {
      const r = await db.execute(
        sql`SELECT COUNT(*) as count
            FROM cases
            WHERE lawyer_id = ${lawyer.id}
            AND status IN ('active', 'pending')`
      );

      const activeCaseCount = parseInt(
        (r.rows[0] as any)?.count ?? "0"
      );

      const { password, ...safe } = lawyer;

      return {
        ...safe,
        activeCaseCount,
      };
    })
  );

  return res.json(result);
});

router.post("/", async (req, res) => {
  const parsed = createLawyerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten(),
    });
  }

  const [lawyer] = await db
    .insert(lawyersTable)
    .values(parsed.data)
    .returning();

  const { password, ...safe } = lawyer;

  return res.status(201).json({
    ...safe,
    activeCaseCount: 0,
  });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const lawyer = await getLawyerWithCount(id);

  if (!lawyer) {
    return res.status(404).json({
      error: "Not found",
    });
  }

  return res.json(lawyer);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const parsed = updateLawyerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten(),
    });
  }

  const [lawyer] = await db
    .update(lawyersTable)
    .set(parsed.data)
    .where(eq(lawyersTable.id, id))
    .returning();

  if (!lawyer) {
    return res.status(404).json({
      error: "Not found",
    });
  }

  const updatedLawyer = await getLawyerWithCount(id);

  return res.json(updatedLawyer);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const [lawyer] = await db
    .delete(lawyersTable)
    .where(eq(lawyersTable.id, id))
    .returning();

  if (!lawyer) {
    return res.status(404).json({
      error: "Not found",
    });
  }

  return res.status(204).send();
});

export default router;