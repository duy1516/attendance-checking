import { handle } from "hono/vercel";
import { Hono } from "hono";
import { db } from "@/db";
import { classes, classStudents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const app = new Hono();

app.post("/api/class/join", async (c) => {
  const { classLink, studentId } = await c.req.json();

  if (!classLink || !studentId) {
    return c.json({ error: "Missing classLink or studentId" }, 400);
  }

  const classResult = await db
    .select()
    .from(classes)
    .where(eq(classes.classLink, classLink));

  if (classResult.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }

  const classId = classResult[0].id;

  const existing = await db
    .select()
    .from(classStudents)
    .where(
      and(
        eq(classStudents.classId, classId),
        eq(classStudents.studentId, studentId)
      )
    );

  if (existing.length > 0) {
    return c.json({ error: "You already joined this class" }, 400);
  }

  // Insert enrollment
  await db.insert(classStudents).values({
    classId,
    studentId,
  });

  return c.json({ message: "Joined successfully" });
});

export const POST = handle(app);