// src/app/api/class/[classId]/leave/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { classStudents } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.delete("/api/class/:classId/leave", async (c) => {
  const { classId } = c.req.param();

  try {
    const token = getCookie(c, "authToken");
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== "student") {
      return c.json({ error: "Only students can leave classes" }, 403);
    }

    await db
      .delete(classStudents)
      .where(and(eq(classStudents.classId, classId), eq(classStudents.studentId, decoded.id)));

    return c.json({ message: "Left class successfully" });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to leave class" }, 500);
  }
});

export const DELETE = handle(app);
