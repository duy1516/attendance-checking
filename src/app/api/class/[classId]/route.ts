import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.delete("/api/class/:classId", async (c) => {
  const { classId } = c.req.param();

  try {
    const token = getCookie(c, "authToken");

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };

    if (decoded.role !== "teacher") {
      return c.json({ error: "Only teachers can delete classes" }, 403);
    }

    await db.delete(classes).where(eq(classes.id, classId));

    return c.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to delete class" }, 500);
  }
});

export const DELETE = handle(app);
