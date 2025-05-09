import { Hono } from "hono";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handle } from "hono/vercel";
import { sign } from "jsonwebtoken";
import { setCookie } from "hono/cookie";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

app.post("/api/auth/signup", async (c) => {
  const { name, email, password, role } = await c.req.json();

  if (!name || !email || !password || !role) {
    return c.json({ error: "All fields are required" }, 400);
  }

  // check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return c.json({ error: "Email already in use" }, 400);
  }

  const passwordHash = await hash(password, 10);

  const newUser = await db.insert(users).values({
    name,
    email,
    passwordHash,
    role,
  }).returning();

  const user = newUser[0];

  // Create JWT token
  const token = sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set token in HTTP-only cookie
  setCookie(c, "authToken", token, {
    httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
    secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in production
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/", // Cookie is available on all paths
    sameSite: "strict" // Protection against CSRF
  });

  return c.json({
    success: true,
    message: "User created successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const POST = handle(app);