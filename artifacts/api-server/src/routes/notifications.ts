import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, lawyersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createNotificationSchema = z.object({
  recipientId: z.number().int(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["case_assigned", "case_updated", "deadline_reminder", "message", "system"]),
  caseId: z.number().int().optional(),
});

async function enrichNotification(n: typeof notificationsTable.$inferSelect) {
  const sender = n.senderId ? await db.query.lawyersTable.findFirst({
    where: eq(lawyersTable.id, n.senderId),
  }) : null;
  const senderSafe = sender ? (({ password, ...rest }) => rest)(sender) : null;
  return { ...n, sender: senderSafe ? { ...senderSafe, activeCaseCount: 0 } : null };
}

router.get("/", async (req, res) => {
  const lawyerId = (req.session as any).lawyerId;
  if (!lawyerId) {
    const all = await db.query.notificationsTable.findMany();
    const enriched = await Promise.all(all.map(enrichNotification));
    return res.json(enriched);
  }

  const notifications = await db.query.notificationsTable.findMany({
    where: eq(notificationsTable.recipientId, lawyerId),
  });
  const enriched = await Promise.all(notifications.map(enrichNotification));
  return res.json(enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.post("/", async (req, res) => {
  const parsed = createNotificationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const senderId = (req.session as any).lawyerId || null;

  const [notification] = await db.insert(notificationsTable).values({
    ...parsed.data,
    senderId,
  }).returning();

  return res.status(201).json(await enrichNotification(notification));
});

router.put("/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);
  const [notification] = await db.update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, id))
    .returning();

  if (!notification) return res.status(404).json({ error: "Not found" });
  return res.json(await enrichNotification(notification));
});

export default router;
