import { Hono } from "hono";
import { handle } from "hono/vercel";
import { db } from "@/db";
import { classStudents, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

app.get("/api/class/:classId/students", async (c) => {
  const classId = c.req.param("classId");

  if (!classId) {
    return c.json({ error: "Missing class ID" }, 400);
  }

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(classStudents)
    .innerJoin(users, eq(classStudents.studentId, users.id))
    .where(eq(classStudents.classId, classId));

  return c.json({ students: result });
});

export const GET = handle(app);
