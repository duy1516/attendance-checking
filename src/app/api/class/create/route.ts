import { handle } from "hono/vercel";
import { Hono } from "hono";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { z } from "zod";

const app = new Hono();

const classSchema = z.object({
  className: z.string().min(1),
  description: z.string().optional(),
});

app.post("/api/class/create", async (c) => {
  const body = await c.req.json();
  const parsed = classSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }

  const mockTeacherId = "11111111-1111-1111-1111-111111111111";
  const classLink = crypto.randomUUID().slice(0, 8);

  await db.insert(classes).values({
    teacherId: mockTeacherId,
    className: parsed.data.className,
    description: parsed.data.description || null,
    classLink,
  });

  return c.json({ success: true });
});

export const POST = handle(app);
