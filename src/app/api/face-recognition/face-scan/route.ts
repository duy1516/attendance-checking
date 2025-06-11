import { Hono } from 'hono'
import { handle } from 'hono/vercel';
import { HTTPException } from 'hono/http-exception'
import { getCookie } from "hono/cookie";
import { verify } from "jsonwebtoken";
import { db } from "@/db";
import { users, attendanceRecords, attendanceSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const app = new Hono().basePath('/api/face-recognition/face-scan');
const FASTAPI_BASE = 'https://face-regognition-api.onrender.com';
const JWT_SECRET = process.env.JWT_SECRET!;

app.post('/', async (c) => {
  // Step 1: Authenticate the current user
  const token = getCookie(c, "authToken");

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  let currentUser;
  try {
    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };

    // Get user from DB
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!userResult.length) {
      return c.json({ error: 'User not found' }, 401);
    }

    currentUser = userResult[0];
  } catch {
    return c.json({ error: 'Invalid authentication token' }, 401);
  }

  // Step 2: Get classId from request body or query params
  const body = await c.req.parseBody()
  const classId = body.classId as string; // You'll need to pass this from frontend

  if (!classId) {
    return c.json({ error: 'Class ID is required' }, 400);
  }

  // Step 3: Find active attendance session for this class
  const activeSession = await db
    .select({
      id: attendanceSessions.id,
      classId: attendanceSessions.classId,
      isActive: attendanceSessions.status,
    })
    .from(attendanceSessions)
    .where(
      and(
        eq(attendanceSessions.classId, classId),
        eq(attendanceSessions.status, 'open')
      )
    )
    .limit(1);

  if (!activeSession.length) {
    return c.json({ error: 'No active attendance session found for this class' }, 404);
  }

  const sessionId = activeSession[0].id;

  // Step 4: Check if attendance already recorded for this session
  const existingRecord = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.sessionId, sessionId),
        eq(attendanceRecords.studentId, currentUser.id)
      )
    )
    .limit(1);

  if (existingRecord.length > 0) {
    return c.json({
      error: 'Attendance already recorded for this session',
      status: 'already_recorded'
    }, 409);
  }

  // Step 5: Process the image (your existing face recognition code)
  const file = body.image as File

  if (!file) throw new HTTPException(400, { message: 'No image file provided' })

  const formData = new FormData()
  formData.append('file', file)

  // Upload the image to get image_id
  const uploadRes = await fetch(`${FASTAPI_BASE}/image/`, {
    method: 'POST',
    body: formData,
  })

  if (!uploadRes.ok) {
    return c.json({ error: 'Upload failed' }, 500)
  }

  const uploadData = await uploadRes.json();
  const imageId = uploadData.detail?.data?.image_id;
  const validImageId = parseInt(imageId);

  if (isNaN(validImageId)) {
    return c.json({ error: 'Invalid image ID' }, 500);
  }

  // Step 6: Validate and recognize
  const requestBody = { image_id: validImageId };
  const validateRes = await fetch(`${FASTAPI_BASE}/facenet/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!validateRes.ok) {
    return c.json({ error: 'Face validation failed' }, 400);
  }

  const recognizeRes = await fetch(`${FASTAPI_BASE}/facenet/name?image_id=${validImageId}`)
  const result = await recognizeRes.json()

  if (!recognizeRes.ok) {
    return c.json({ error: result.detail?.message || 'Recognition failed' }, 400)
  }

  const apiUserId = result.detail.data.id;

  // Step 7: Get the web user_id linked to this API user_id
  const linkRes = await fetch(`${FASTAPI_BASE}/user/get-web-user/${apiUserId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!linkRes.ok) {
    return c.json({ error: 'User not linked to face recognition system' }, 404);
  }

  const linkData = await linkRes.json();
  const linkedWebUserId = linkData.web_user_id;

  // Step 8: Compare with current logged-in user
  if (linkedWebUserId !== currentUser.id) {
    return c.json({
      error: 'Face recognition failed!',
      status: 'unauthorized'
    }, 401);
  }

  // Step 9: Check if session is still active before recording attendance
  const currentSession = await db
    .select({
      id: attendanceSessions.id,
      isActive: attendanceSessions.status,
    })
    .from(attendanceSessions)
    .where(eq(attendanceSessions.id, sessionId))
    .limit(1);

  if (!currentSession.length || !currentSession[0].isActive) {
    // Session closed during recognition - mark as absent
    try {
      const absentRecord = await db
        .insert(attendanceRecords)
        .values({
          sessionId: sessionId,
          studentId: currentUser.id,
          status: 'absent',
          scannedAt: new Date(),
        })
        .returning({
          id: attendanceRecords.id,
          sessionId: attendanceRecords.sessionId,
          studentId: attendanceRecords.studentId,
          status: attendanceRecords.status,
          scannedAt: attendanceRecords.scannedAt,
        });

      return c.json({
        status: 'session_closed',
        message: 'Session was closed during recognition. You have been marked as absent.',
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        },
        attendance: absentRecord[0]
      }, 409); // 409 Conflict status

    } catch (dbError) {
      console.error('Database error while recording absent attendance:', dbError);
      return c.json({
        error: 'Session closed and failed to record absence',
        status: 'error'
      }, 500);
    }
  }

  // Step 10: Create attendance record after successful face recognition
  try {
    // Get current timestamp in your timezone (adjust timezone as needed)
    const currentTime = new Date();

    const attendanceRecord = await db
      .insert(attendanceRecords)
      .values({
        sessionId: sessionId,
        studentId: currentUser.id,
        status: 'present',
        scannedAt: currentTime, // Explicitly set the current time
      })
      .returning({
        id: attendanceRecords.id,
        sessionId: attendanceRecords.sessionId,
        studentId: attendanceRecords.studentId,
        status: attendanceRecords.status,
        scannedAt: attendanceRecords.scannedAt,
      });

    return c.json({
      status: 'success',
      message: 'Face recognition successful and attendance recorded',
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email
      },
      attendance: attendanceRecord[0]
    });

  } catch (dbError) {
    console.error('Database error while recording attendance:', dbError);
    return c.json({
      error: 'Face recognized but failed to record attendance',
      status: 'partial_success'
    }, 500);
  }
})

export const POST = handle(app);