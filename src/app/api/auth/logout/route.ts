// app/api/auth/logout/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { setCookie } from "hono/cookie";

const app = new Hono();

app.post("/api/auth/logout", async (c) => {
  // Clear the auth cookie by setting it to expire immediately
  setCookie(c, "authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // Expire immediately
    path: "/",
    sameSite: "strict"
  });

  return c.json({ success: true, message: "Logged out successfully" });
});

export const POST = handle(app);