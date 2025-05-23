import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { classStudents } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const app = new Hono();

const JWT_SECRET = process.env.JWT_SECRET!;

app.delete("/api/class/:classId/students/:studentId", async (c) => {
  const { classId, studentId } = c.req.param();

  try {
    const token = getCookie(c, "authToken");
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== "teacher") {
      return c.json({ error: "Only teachers can remove students" }, 403);
    }

    await db
      .delete(classStudents)
      .where(and(eq(classStudents.classId, classId), eq(classStudents.studentId, studentId)));

    return c.json({ message: "Student removed successfully" });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to remove student" }, 500);
  }
});

export const DELETE = handle(app);
