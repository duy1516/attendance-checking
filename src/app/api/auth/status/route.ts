// app/api/auth/status/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.get("/api/auth/status", async (c) => {
  const token = getCookie(c, "authToken");

  if (!token) {
    return c.json({ isAuthenticated: false });
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };

    // Get user from DB
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!user.length) {
      return c.json({ isAuthenticated: false });
    }

    return c.json({
      isAuthenticated: true,
      user: user[0],
    });
  } catch (err) {
    return c.json({ isAuthenticated: false });
  }
});

export const GET = handle(app);
