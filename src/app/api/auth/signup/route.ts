import { Hono } from "hono";
import { hash } from "bcryptjs"; // or bcrypt
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handle } from "hono/vercel";
import { sign } from "jsonwebtoken";

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

  // Need to fix
  const token = sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return c.json({ message: "User created", token });
});

export const POST = handle(app);

