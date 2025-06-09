// src/app/api/session/get/[classId]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { attendanceSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.get("/api/session/get/:classId", async (c) => {
  const token = getCookie(c, "authToken");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  try {
    verify(token, JWT_SECRET);
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  const classId = c.req.param("classId");

  const sessions = await db
    .select()
    .from(attendanceSessions)
    .where(eq(attendanceSessions.classId, classId))
    .orderBy(desc(attendanceSessions.sessionDate));

  return c.json({ sessions });
});

export const GET = handle(app);