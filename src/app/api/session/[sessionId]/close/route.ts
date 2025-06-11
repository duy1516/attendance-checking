import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attendanceSessions } from "@/db/schema";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;
app.patch("/api/session/:sessionId/close", async (c) => {
  const token = getCookie(c, "authToken");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const { role } = verify(token, JWT_SECRET) as { id: string; role: string };
  if (role !== "teacher") return c.json({ error: "Forbidden" }, 403);

  const { sessionId } = c.req.param();

  await db.update(attendanceSessions).set({ status: "closed" }).where(eq(attendanceSessions.id, sessionId));

  return c.json({ success: true });
});

export const PATCH = handle(app);