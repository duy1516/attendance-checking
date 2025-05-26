import { handle } from "hono/vercel";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { classes, classStudents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// JWT payload type
interface AuthTokenPayload {
  id: string;
  role: "student" | "teacher";
}

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

app.post("/api/class/join", async (c) => {
  const token = await getCookie(c, "authToken");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  let decoded: AuthTokenPayload;
  try {
    decoded = verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  // Only allow students to join classes
  if (decoded.role !== "student") {
    return c.json({ error: "Only students can join classes" }, 403);
  }

  const { classLink } = await c.req.json();
  if (!classLink) {
    return c.json({ error: "Missing classLink" }, 400);
  }

  const classResult = await db
    .select()
    .from(classes)
    .where(eq(classes.classLink, classLink));

  if (classResult.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }

  const classId = classResult[0].id;
  const studentId = decoded.id;

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
    return c.json({ error: "You have already joined this class" }, 400);
  }

  await db.insert(classStudents).values({
    classId,
    studentId,
  });

  return c.json({ message: "Joined successfully" });
});

export const POST = handle(app);
