import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { attendanceSessions } from "@/db/schema";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.post("/api/session/create", async (c) => {
  const token = getCookie(c, "authToken");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const { id: userId, role } = verify(token, JWT_SECRET) as { id: string; role: string };
  if (role !== "teacher") return c.json({ error: "Forbidden" }, 403);

  const { classId, sessionDate } = await c.req.json();

  // Check if an open session already exists
  const existingSession = await db
    .select()
    .from(attendanceSessions)
    .where(
      and(
        eq(attendanceSessions.classId, classId),
        eq(attendanceSessions.status, "open")
      )
    )
    .limit(1);

  if (existingSession.length > 0) {
    return c.json({ error: "An open session already exists for this class." }, 400);
  }

  const [insertedSession] = await db
    .insert(attendanceSessions)
    .values({
      classId,
      teacherId: userId,
      sessionDate: new Date(sessionDate),
      status: "open",
    })
    .returning();

  return c.json({ success: true, sessionId: insertedSession.id });
});

export const POST = handle(app);
