// src/app/api/attendance/record/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { attendanceRecords } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const app = new Hono();

app.post("/api/attendance/record", async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    sessionId: z.string().uuid(),
    studentId: z.string().uuid(),
    status: z.enum(["present", "absent"]).default("present"),
  });

  const parsed = schema.parse(body);

  try {
    // First check if record exists
    const existing = await db
      .select()
      .from(attendanceRecords)
      .where(
        eq(attendanceRecords.sessionId, parsed.sessionId) &&
        eq(attendanceRecords.studentId, parsed.studentId)
      );

    if (existing.length > 0) {
      return c.json({ error: "Attendance already recorded" }, 400);
    }

    await db.insert(attendanceRecords).values(parsed);

    return c.json({ success: true });
  } catch {
    return c.json({ error: "Failed to record attendance" }, 500);
  }
});

export const POST = handle(app);
