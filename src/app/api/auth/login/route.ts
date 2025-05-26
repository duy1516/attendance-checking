// app/api/auth/login/route.ts
import { Hono } from "hono";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handle } from "hono/vercel";
import { sign } from "jsonwebtoken";
import { setCookie } from "hono/cookie";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const foundUsers = await db.select().from(users).where(eq(users.email, email));
  if (foundUsers.length === 0) {
    return c.json({ error: "Account does not exist" }, 401);
  }

  const user = foundUsers[0];

  const passwordValid = await compare(password, user.passwordHash);
  if (!passwordValid) {
    return c.json({ error: "Wrong password, please re-enter" }, 401);
  }

  // Generate JWT token
  const token = sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set token in HTTP-only cookie
  setCookie(c, "authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax"
  });

  return c.json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const POST = handle(app);
