import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable, lawyersTable, clientsTable, timelineEventsTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createCaseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["active", "pending", "closed", "archived"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  caseType: z.string().optional(),
  clientId: z.number().int(),
  lawyerId: z.number().int(),
  deadline: z.coerce.date().optional(),
});

const updateCaseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "pending", "closed", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  caseType: z.string().optional(),
  lawyerId: z.number().int().optional(),
  deadline: z.coerce.date().optional(),
});

const addTimelineEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  eventType: z.enum(["note", "hearing", "document", "deadline", "update", "status_change"]).default("note"),
  eventDate: z.coerce.date(),
});

async function enrichCase(c: typeof casesTable.$inferSelect) {
  const lawyer = await db.query.lawyersTable.findFirst({ where: eq(lawyersTable.id, c.lawyerId) });
  const client = await db.query.clientsTable.findFirst({ where: eq(clientsTable.id, c.clientId) });
  const lawyerSafe = lawyer ? (({ password, ...rest }) => rest)(lawyer) : null;

  const clientActiveCases = await db.execute(
    sql`SELECT COUNT(*) as count FROM cases WHERE client_id = ${c.clientId} AND status IN ('active', 'pending')`
  );
  const lawyerActiveCases = await db.execute(
    sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${c.lawyerId} AND status IN ('active', 'pending')`
  );

  return {
    ...c,
    lawyer: lawyerSafe ? { ...lawyerSafe, activeCaseCount: parseInt((lawyerActiveCases.rows[0] as any)?.count ?? "0") } : null,
    client: client ? { ...client, activeCaseCount: parseInt((clientActiveCases.rows[0] as any)?.count ?? "0") } : null,
  };
}

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `${year}-${rand}`;
}

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const lawyerId = req.query.lawyerId ? parseInt(req.query.lawyerId as string) : undefined;
  const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;

  let allCases = await db.query.casesTable.findMany();

  if (status) allCases = allCases.filter(c => c.status === status);
  if (lawyerId) allCases = allCases.filter(c => c.lawyerId === lawyerId);
  if (clientId) allCases = allCases.filter(c => c.clientId === clientId);
  if (search) {
    allCases = allCases.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = allCases.length;
  const paginated = allCases.slice(offset, offset + limit);
  const enriched = await Promise.all(paginated.map(enrichCase));

  return res.json({ data: enriched, total, page, limit });
});

router.post("/", async (req, res) => {
  const parsed = createCaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error });

  const caseNumber = generateCaseNumber();
  const [newCase] = await db.insert(casesTable).values({ ...parsed.data, caseNumber }).returning();

  const lawyerId = (req.session as any).lawyerId;
  if (lawyerId) {
    await db.insert(timelineEventsTable).values({
      caseId: newCase.id,
      lawyerId,
      title: "Processo aberto",
      description: `Processo ${caseNumber} foi criado`,
      eventType: "update",
      eventDate: new Date(),
    });
  }

  return res.status(201).json(await enrichCase(newCase));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const c = await db.query.casesTable.findFirst({ where: eq(casesTable.id, id) });
  if (!c) return res.status(404).json({ error: "Not found" });

  const enriched = await enrichCase(c);
  const timeline = await db.query.timelineEventsTable.findMany({
    where: eq(timelineEventsTable.caseId, id),
  });

  const enrichedTimeline = await Promise.all(timeline.map(async (t) => {
    const lawyer = t.lawyerId ? await db.query.lawyersTable.findFirst({ where: eq(lawyersTable.id, t.lawyerId) }) : null;
    const lawyerSafe = lawyer ? (({ password, ...rest }) => rest)(lawyer) : null;
    const lawyerActiveCases = lawyer ? await db.execute(
      sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${lawyer.id} AND status IN ('active', 'pending')`
    ) : null;
    return {
      ...t,
      lawyer: lawyerSafe ? { ...lawyerSafe, activeCaseCount: parseInt((lawyerActiveCases?.rows[0] as any)?.count ?? "0") } : null,
    };
  }));

  return res.json({ ...enriched, timeline: enrichedTimeline.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()) });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateCaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const [updated] = await db.update(casesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(casesTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(await enrichCase(updated));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(timelineEventsTable).where(eq(timelineEventsTable.caseId, id));
  await db.delete(casesTable).where(eq(casesTable.id, id));
  return res.json({ success: true, message: "Case deleted" });
});

router.post("/:id/timeline", async (req, res) => {
  const caseId = parseInt(req.params.id);
  const parsed = addTimelineEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const lawyerId = (req.session as any).lawyerId;

  const [event] = await db.insert(timelineEventsTable).values({
    ...parsed.data,
    caseId,
    lawyerId: lawyerId || null,
  }).returning();

  const lawyer = lawyerId ? await db.query.lawyersTable.findFirst({ where: eq(lawyersTable.id, lawyerId) }) : null;
  const lawyerSafe = lawyer ? (({ password, ...rest }) => rest)(lawyer) : null;

  return res.status(201).json({ ...event, lawyer: lawyerSafe ? { ...lawyerSafe, activeCaseCount: 0 } : null });
});

export default router;
