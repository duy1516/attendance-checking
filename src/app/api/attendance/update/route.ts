// src/app/api/attendance/update/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { attendanceRecords } from "@/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const app = new Hono();

app.patch("/api/attendance/update", async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    sessionId: z.string().uuid(),
    studentId: z.string().uuid(),
    status: z.enum(["present", "absent"]),
  });

  const parsed = schema.parse(body);

  try {
    // Check if attendance record exists
    const existing = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.sessionId, parsed.sessionId),
          eq(attendanceRecords.studentId, parsed.studentId)
        )
      );

    if (existing.length > 0) {
      if (parsed.status === "absent") {
        // Delete the record when marking as absent
        await db
          .delete(attendanceRecords)
          .where(
            and(
              eq(attendanceRecords.sessionId, parsed.sessionId),
              eq(attendanceRecords.studentId, parsed.studentId)
            )
          );
      } else {
        // Update to present
        await db
          .update(attendanceRecords)
          .set({ status: parsed.status })
          .where(
            and(
              eq(attendanceRecords.sessionId, parsed.sessionId),
              eq(attendanceRecords.studentId, parsed.studentId)
            )
          );
      }
    } else {
      // Create new record if toggling to "present"
      if (parsed.status === "present") {
        await db.insert(attendanceRecords).values({
          sessionId: parsed.sessionId,
          studentId: parsed.studentId,
          status: parsed.status,
        });
      }
      // If toggling to "absent" and record doesn't exist, no action needed
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update attendance:", error);
    return c.json({ error: "Failed to update attendance" }, 500);
  }
});

export const PATCH = handle(app);
