import { handle } from "hono/vercel";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { classes, classStudents } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define the shape of your JWT payload
interface AuthTokenPayload {
  id: string;
  role: "student" | "teacher";
}

// Define a type for the class item you return
interface ClassItem {
  id: string;
  className: string;
  classLink: string | null;
}

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

app.get("/api/class/list", async (c) => {
  const token = await getCookie(c, "authToken");
  if (!token) return c.json({ classes: [] }, 200); // Not logged in → return empty list

  let decoded: AuthTokenPayload;
  try {
    decoded = verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return c.json({ classes: [] }, 200); // Invalid token → return empty list
  }

  const userId = decoded.id;
  const userRole = decoded.role;

  let classList: ClassItem[] = [];

  if (userRole === "teacher") {
    classList = await db
      .select({
        id: classes.id,
        className: classes.className,
        classLink: classes.classLink,
      })
      .from(classes)
      .where(eq(classes.teacherId, userId));

  } else if (userRole === "student") {
    classList = await db
      .select({
        id: classes.id,
        className: classes.className,
        classLink: classes.classLink,
      })
      .from(classStudents)
      .innerJoin(classes, eq(classStudents.classId, classes.id))
      .where(eq(classStudents.studentId, userId));
  }

  return c.json({ classes: classList });
});

export const GET = handle(app);
