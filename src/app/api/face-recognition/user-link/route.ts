import { Hono } from 'hono';
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handle } from "hono/vercel";

const app = new Hono();

app.post('/api/face-recognition/user-link', async (c) => {
  try {
    const json = await c.req.json();
    const { web_user_id, name } = json;

    if (!web_user_id || !name) {
      return c.json({ error: 'web_user_id and name are required' }, 400);
    }

    // Verify the web user exists in our database
    const existingUser = await db.select().from(users).where(eq(users.id, web_user_id));

    if (existingUser.length === 0) {
      return c.json({ error: 'Web user not found' }, 404);
    }

    const user = existingUser[0];

    // Optional: Verify the name matches for security
    if (user.name !== name) {
      return c.json({ error: 'Name does not match user record' }, 400);
    }

    // Forward to FastAPI - it will handle creating API user and linking
    const fastapiUrl = 'http://127.0.0.1:8000/user/link-user';

    const response = await fetch(fastapiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        web_user_id,  // UUID from web app
        name          // Username to create in API's users table
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return c.json({ error: data.detail || 'FastAPI linking failed' }, 400);
    }

    return c.json({
      success: true,
      message: 'User successfully linked to face recognition system',
      web_user_id: web_user_id,
      api_user_id: data.api_user_id || data.user_id,
      data
    }, 200);

  } catch {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export const POST = handle(app);