import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  const lawyerId = (req.session as any).lawyerId;

  const totalClientsResult = await db.execute(sql`SELECT COUNT(*) as count FROM clients`);
  const totalCasesResult = await db.execute(sql`SELECT COUNT(*) as count FROM cases`);
  const activeCasesResult = await db.execute(sql`SELECT COUNT(*) as count FROM cases WHERE status = 'active'`);
  const pendingCasesResult = await db.execute(sql`SELECT COUNT(*) as count FROM cases WHERE status = 'pending'`);
  const closedCasesResult = await db.execute(sql`SELECT COUNT(*) as count FROM cases WHERE status = 'closed'`);
  const urgentCasesResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM cases WHERE priority = 'urgent' AND status NOT IN ('closed', 'archived')`
  );

  const totalClientsRow = (totalClientsResult as any).rows?.[0];
  const totalCasesRow = (totalCasesResult as any).rows?.[0];
  const activeCasesRow = (activeCasesResult as any).rows?.[0];
  const pendingCasesRow = (pendingCasesResult as any).rows?.[0];
  const closedCasesRow = (closedCasesResult as any).rows?.[0];
  const urgentCasesRow = (urgentCasesResult as any).rows?.[0];

  let unreadNotifications = 0;

  if (lawyerId) {
    const unreadResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ${lawyerId} AND read = false`
    );

    const unreadRow = (unreadResult as any).rows?.[0];
    unreadNotifications = parseInt(unreadRow?.count ?? "0");
  }

  return res.json({
    totalClients: parseInt(totalClientsRow?.count ?? "0"),
    totalCases: parseInt(totalCasesRow?.count ?? "0"),
    activeCases: parseInt(activeCasesRow?.count ?? "0"),
    pendingCases: parseInt(pendingCasesRow?.count ?? "0"),
    closedCases: parseInt(closedCasesRow?.count ?? "0"),
    urgentCases: parseInt(urgentCasesRow?.count ?? "0"),
    unreadNotifications,
  });
});

router.get("/recent-activity", async (req, res) => {
  const recentCases = await db.query.casesTable.findMany();
  const recentTimeline = await db.query.timelineEventsTable.findMany();
  const recentClients = await db.query.clientsTable.findMany();

  const caseActivities = recentCases.slice(0, 5).map((c) => ({
    id: `case-${c.id}`,
    type: "case_created" as const,
    title: `Novo processo: ${c.title}`,
    description: `Processo ${c.caseNumber} criado`,
    caseId: c.id,
    createdAt: c.createdAt.toISOString(),
  }));

  const timelineActivities = recentTimeline.slice(0, 5).map((t) => ({
    id: `timeline-${t.id}`,
    type: "case_updated" as const,
    title: t.title,
    description: t.description || "",
    caseId: t.caseId,
    createdAt: t.createdAt.toISOString(),
  }));

  const clientActivities = recentClients.slice(0, 3).map((c) => ({
    id: `client-${c.id}`,
    type: "client_added" as const,
    title: `Novo cliente: ${c.name}`,
    description: `Cliente ${c.email} cadastrado`,
    clientId: c.id,
    createdAt: c.createdAt.toISOString(),
  }));

  const allActivities = [...caseActivities, ...timelineActivities, ...clientActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return res.json(allActivities);
});

router.get("/cases-by-status", async (req, res) => {
  const statuses = ["active", "pending", "closed", "archived"];
  const labels: Record<string, string> = {
    active: "Ativo",
    pending: "Pendente",
    closed: "Encerrado",
    archived: "Arquivado",
  };

  const results = await Promise.all(
    statuses.map(async (status) => {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM cases WHERE status = ${status}`);
      const row = (result as any).rows?.[0];

      return {
        status,
        count: parseInt(row?.count ?? "0"),
        label: labels[status] || status,
      };
    })
  );

  return res.json(results);
});

router.get("/workload", async (req, res) => {
  const lawyers = await db.query.lawyersTable.findMany();

  const workload = await Promise.all(
    lawyers.map(async (lawyer) => {
      const activeResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${lawyer.id} AND status = 'active'`
      );
      const pendingResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${lawyer.id} AND status = 'pending'`
      );
      const totalResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${lawyer.id}`
      );
      const urgentResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ${lawyer.id} AND priority = 'urgent' AND status NOT IN ('closed', 'archived')`
      );

      const activeRow = (activeResult as any).rows?.[0];
      const pendingRow = (pendingResult as any).rows?.[0];
      const totalRow = (totalResult as any).rows?.[0];
      const urgentRow = (urgentResult as any).rows?.[0];

      const { password, ...safeL } = lawyer;
      const activeCaseCount = parseInt(activeRow?.count ?? "0");

      return {
        lawyer: { ...safeL, activeCaseCount },
        activeCases: activeCaseCount,
        pendingCases: parseInt(pendingRow?.count ?? "0"),
        totalCases: parseInt(totalRow?.count ?? "0"),
        urgentCases: parseInt(urgentRow?.count ?? "0"),
      };
    })
  );

  return res.json(workload);
});

export default router;