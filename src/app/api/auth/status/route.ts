// app/api/auth/status/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { verify, JwtPayload } from "jsonwebtoken";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET!;

// Define the shape of our JWT payload
interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: string;
}

app.get("/api/auth/status", async (c) => {
  try {
    const token = getCookie(c, "authToken");

    if (!token) {
      return c.json({ isAuthenticated: false });
    }

    // Verify the token and cast to our custom type
    const decoded = verify(token, JWT_SECRET) as AuthTokenPayload;

    return c.json({
      isAuthenticated: true,
      user: {
        id: decoded.id,
        role: decoded.role
      }
    });
  } catch (error) {
    // Token invalid or expired
    return c.json({ isAuthenticated: false });
  }
});

export const GET = handle(app);