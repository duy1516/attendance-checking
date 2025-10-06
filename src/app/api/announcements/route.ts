// app/api/announcements/route.ts
import { handle } from "hono/vercel";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { announcements, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

// GET /api/announcements?classId={classId}
app.get("/api/announcements", async (c) => {
  try {
    const classId = c.req.query('classId');

    if (!classId) {
      return c.json(
        { error: "classId parameter is required" },
        400
      );
    }

    // Fetch announcements with teacher information
    const results = await db
      .select({
        id: announcements.id,
        classId: announcements.classId,
        teacherId: announcements.teacherId,
        title: announcements.title,
        message: announcements.message,
        createdAt: announcements.createdAt,
        teacherName: users.name,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.teacherId, users.id))
      .where(eq(announcements.classId, classId))
      .orderBy(desc(announcements.createdAt));

    return c.json(results);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return c.json(
      { error: "Failed to fetch announcements" },
      500
    );
  }
});

// POST /api/announcements
app.post("/api/announcements", async (c) => {
  try {
    const body = await c.req.json();

    // Validate required fields
    const { classId, teacherId, title } = body;

    if (!classId || !teacherId || !title) {
      return c.json(
        { error: "classId, teacherId, and title are required" },
        400
      );
    }

    // Validate title length
    if (title.trim().length === 0) {
      return c.json(
        { error: "Title cannot be empty" },
        400
      );
    }

    // Insert new announcement
    const result = await db
      .insert(announcements)
      .values({
        classId,
        teacherId,
        title: title.trim(),
        message: body.message?.trim() || null,
      })
      .returning();

    // Fetch the created announcement with teacher info
    const createdAnnouncement = await db
      .select({
        id: announcements.id,
        classId: announcements.classId,
        teacherId: announcements.teacherId,
        title: announcements.title,
        message: announcements.message,
        createdAt: announcements.createdAt,
        teacherName: users.name,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.teacherId, users.id))
      .where(eq(announcements.id, result[0].id))
      .limit(1);

    return c.json(createdAnnouncement[0], 201);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return c.json(
      { error: "Failed to create announcement" },
      500
    );
  }
});

// PUT /api/announcements?id={id}
app.put("/api/announcements", async (c) => {
  try {
    const body = await c.req.json();
    const id = c.req.query('id');

    if (!id) {
      return c.json(
        { error: "Announcement ID is required" },
        400
      );
    }

    const { title, message } = body;

    if (!title || title.trim().length === 0) {
      return c.json(
        { error: "Title is required and cannot be empty" },
        400
      );
    }

    const result = await db
      .update(announcements)
      .set({
        title: title.trim(),
        message: message?.trim() || null,
      })
      .where(eq(announcements.id, id))
      .returning();

    if (result.length === 0) {
      return c.json(
        { error: "Announcement not found" },
        404
      );
    }

    return c.json(result[0]);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return c.json(
      { error: "Failed to update announcement" },
      500
    );
  }
});

// DELETE /api/announcements?id={id}
app.delete("/api/announcements", async (c) => {
  try {
    // Check authentication
    const token = getCookie(c, "authToken");

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { id: string; role: string };
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }

    // Check if user is a teacher
    if (decoded.role !== "teacher") {
      return c.json({ error: "Only teachers can delete announcements" }, 403);
    }

    const id = c.req.query('id');

    if (!id) {
      return c.json(
        { error: "Announcement ID is required" },
        400
      );
    }

    const result = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning();

    if (result.length === 0) {
      return c.json(
        { error: "Announcement not found" },
        404
      );
    }

    return c.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return c.json(
      { error: "Failed to delete announcement" },
      500
    );
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
