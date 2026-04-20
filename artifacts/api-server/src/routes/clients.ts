import { Router } from "express";
import { db } from "@workspace/db";
import { clientsTable } from "@workspace/db";
import { eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createClientSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

async function enrichClient(client: typeof clientsTable.$inferSelect) {
  const r = await db.execute(
    sql`SELECT COUNT(*) as count FROM cases WHERE client_id = ${client.id} AND status IN ('active', 'pending')`
  );
  const activeCaseCount = parseInt((r.rows[0] as any)?.count ?? "0");
  return { ...client, activeCaseCount };
}

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const offset = (page - 1) * limit;

  let clients;
  let total: number;

  if (search) {
    const searchPct = `%${search}%`;
    const allClients = await db.query.clientsTable.findMany();
    clients = allClients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    );
    total = clients.length;
    clients = clients.slice(offset, offset + limit);
  } else {
    const allClients = await db.query.clientsTable.findMany();
    total = allClients.length;
    clients = allClients.slice(offset, offset + limit);
  }

  const enriched = await Promise.all(clients.map(enrichClient));
  return res.json({ data: enriched, total, page, limit });
});

router.post("/", async (req, res) => {
  const parsed = createClientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const [client] = await db.insert(clientsTable).values(parsed.data).returning();
  return res.status(201).json({ ...client, activeCaseCount: 0 });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const client = await db.query.clientsTable.findFirst({
    where: eq(clientsTable.id, id),
  });
  if (!client) return res.status(404).json({ error: "Not found" });
  return res.json(await enrichClient(client));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateClientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const [client] = await db.update(clientsTable)
    .set(parsed.data)
    .where(eq(clientsTable.id, id))
    .returning();

  if (!client) return res.status(404).json({ error: "Not found" });
  return res.json(await enrichClient(client));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(clientsTable).where(eq(clientsTable.id, id));
  return res.json({ success: true, message: "Client deleted" });
});

export default router;
