// app/api/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/announcements?classId={classId}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: "classId parameter is required" },
        { status: 400 }
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

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/announcements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { classId, teacherId, title } = body;

    if (!classId || !teacherId || !title) {
      return NextResponse.json(
        { error: "classId, teacherId, and title are required" },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
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

    return NextResponse.json(createdAnnouncement[0], { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/{id} - Optional: Update announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    const { title, message } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and cannot be empty" },
        { status: 400 }
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
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}