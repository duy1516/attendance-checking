//check for open sessions 

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { attendanceSessions } from "@/db/schema";

const app = new Hono();

app.get("/api/session/status/:classId", async (c) => {
  const { classId } = c.req.param();

  const sessions = await db
    .select()
    .from(attendanceSessions)
    .where(and(eq(attendanceSessions.classId, classId), eq(attendanceSessions.status, "open")));

  if (sessions.length === 0) {
    return c.json({ sessionOpen: false });
  }

  return c.json({ sessionOpen: true, session: sessions[0] });
});

export const GET = handle(app);