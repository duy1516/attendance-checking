import { handle } from "hono/vercel";
import { Hono } from "hono";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { z } from "zod";
import { verify } from "jsonwebtoken";
import { getCookie } from "hono/cookie";

const app = new Hono();

const classSchema = z.object({
  className: z.string().min(1),
  description: z.string().optional(),
});

const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

app.post("/api/class/create", async (c) => {
  const token = await getCookie(c, "authToken");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let decoded;
  try {
    decoded = verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  if (decoded.role !== "teacher") {
    return c.json({ error: "Only teachers can create classes" }, 403);
  }

  const body = await c.req.json();
  const parsed = classSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }

  const classLink = crypto.randomUUID().slice(0, 8);

  await db.insert(classes).values({
    teacherId: decoded.id,
    className: parsed.data.className,
    description: parsed.data.description || null,
    classLink,
  });

  return c.json({ success: true });
});

export const POST = handle(app);
