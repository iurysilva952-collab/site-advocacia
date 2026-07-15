import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable, lawyersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createBlogPostSchema = z.object({
  title: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  category: z.string().optional(),
  published: z.boolean().default(false),
});

const updateBlogPostSchema = createBlogPostSchema.partial();

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() + `-${Date.now()}`;
}

async function enrichPost(post: typeof blogPostsTable.$inferSelect) {
  const author = post.authorId ? await db.query.lawyersTable.findFirst({
    where: eq(lawyersTable.id, post.authorId),
  }) : null;
  const authorSafe = author ? (({ password, ...rest }) => rest)(author) : null;
  const authorWithCount = authorSafe ? { ...authorSafe, activeCaseCount: 0 } : null;
  return { ...post, author: authorWithCount };
}

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const allPosts = await db.query.blogPostsTable.findMany();
  const total = allPosts.length;
  const paginated = allPosts.slice(offset, offset + limit);
  const enriched = await Promise.all(paginated.map(enrichPost));

  return res.json({ data: enriched, total, page, limit });
});

router.post("/", async (req, res) => {
  const parsed = createBlogPostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const lawyerId = (req.session as any).lawyerId;
  const slug = generateSlug(parsed.data.title);
  const publishedAt = parsed.data.published ? new Date() : null;

  const [post] = await db.insert(blogPostsTable).values({
    ...parsed.data,
    slug,
    authorId: lawyerId || null,
    publishedAt,
  }).returning();

  return res.status(201).json(await enrichPost(post));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const post = await db.query.blogPostsTable.findFirst({ where: eq(blogPostsTable.id, id) });
  if (!post) return res.status(404).json({ error: "Not found" });
  return res.json(await enrichPost(post));
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateBlogPostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const existing = await db.query.blogPostsTable.findFirst({ where: eq(blogPostsTable.id, id) });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updates: any = { ...parsed.data };
  if (parsed.data.published === true && !existing.publishedAt) {
    updates.publishedAt = new Date();
  }

  const [post] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, id)).returning();
  return res.json(await enrichPost(post));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  return res.json({ success: true, message: "Blog post deleted" });
});

export default router;
