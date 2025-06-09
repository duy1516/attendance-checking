// src/app/api/attendance/class/[classId]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { attendanceRecords, attendanceSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

app.get("/api/attendance/class/:classId", async (c) => {
  const classId = c.req.param("classId");

  const records = await db
    .select({
      id: attendanceRecords.id,
      studentId: attendanceRecords.studentId,
      status: attendanceRecords.status,
      scannedAt: attendanceRecords.scannedAt,
      sessionId: attendanceRecords.sessionId,
      sessionDate: attendanceSessions.sessionDate,
    })
    .from(attendanceRecords)
    .innerJoin(attendanceSessions, eq(attendanceSessions.id, attendanceRecords.sessionId))
    .where(eq(attendanceSessions.classId, classId));

  return c.json({ records });
});

export const GET = handle(app);
