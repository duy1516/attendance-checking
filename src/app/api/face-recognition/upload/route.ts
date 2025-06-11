// app/api/face-recognition/upload/route.ts
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getCookie } from 'hono/cookie';
import { verify } from 'jsonwebtoken';

const app = new Hono().basePath('/api/face-recognition/upload');

const JWT_SECRET = process.env.JWT_SECRET!;
const FASTAPI_BASE = 'https://face-regognition-api.onrender.com';

app.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No valid file uploaded' }, 400);
    }

    // Step 1: Upload to FastAPI
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch(`${FASTAPI_BASE}/image/`, {
      method: 'POST',
      body: formData,
    });
    // Add detailed logging in your Hono route
    const uploadData = await uploadRes.json();
    const imageId = uploadData.detail?.data?.image_id;
    const validImageId = parseInt(imageId);

    if (isNaN(validImageId)) {
      return c.json({ error: 'Invalid image ID' }, 500);
    }

    const requestBody = { image_id: validImageId };
    const validateRes = await fetch(`${FASTAPI_BASE}/facenet/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!validateRes.ok) {
      const validateData = await validateRes.json();
      return c.json({ error: 'Face validation failed', detail: validateData }, 400);
    }

    // Step 3: Get current user from JWT
    const token = getCookie(c, 'authToken');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    const decoded = verify(token, JWT_SECRET) as { id: string; name?: string };

    // Step 4: Lookup face_api_user_id from web_user_id
    const linkRes = await fetch(`${FASTAPI_BASE}/user/link-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        web_user_id: decoded.id,
        name: decoded.name || 'User'
      }),
    });

    const linkData = await linkRes.json();
    if (!linkRes.ok) {
      return c.json({ error: 'Failed to link user', detail: linkData }, 400);
    }

    const faceApiUserId = linkData.api_user_id;
    if (!faceApiUserId) {
      return c.json({ error: 'API user ID not found in link response' }, 500);
    }

    // Step 5: Embed the image using the correct structure
    const embedRes = await fetch(`${FASTAPI_BASE}/facenet/embedding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: {
          image_id: imageId
        },
        user_id: faceApiUserId,
      }),
    });

    const embedData = await embedRes.json();
    if (!embedRes.ok) {
      return c.json({ error: 'Embedding failed', detail: embedData }, 400);
    }

    return c.json({
      success: true,
      message: 'Image uploaded successfully',
      image_id: imageId,
      api_user_id: faceApiUserId,
      embed: embedData,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal error', detail: String(err) }, 500);
  }
});

export const POST = handle(app);