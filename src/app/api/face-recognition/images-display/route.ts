// app/api/face-recognition/images/route.ts
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getCookie } from 'hono/cookie';
import { verify } from 'jsonwebtoken';

const app = new Hono().basePath('/api/face-recognition/images-display');

const JWT_SECRET = process.env.JWT_SECRET!;
const FASTAPI_BASE = 'http://127.0.0.1:8000';

app.get('/', async (c) => {
  try {
    // Step 1: Get current user from JWT
    const token = getCookie(c, 'authToken');
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const decoded = verify(token, JWT_SECRET) as { id: string; name: string };

    if (!decoded || !decoded.id) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Step 2: Convert web user ID to API user ID
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

    // Step 3: Get user's image IDs
    const userImagesRes = await fetch(`${FASTAPI_BASE}/image/user/${faceApiUserId}`);
    const userImagesData = await userImagesRes.json();

    if (!userImagesRes.ok) {
      return c.json({ error: 'Failed to fetch user images', detail: userImagesData }, 400);
    }

    const imageIds = userImagesData.detail?.data?.images || [];

    // Step 4: Fetch all images data
    const imagePromises = imageIds.map(async (imageId: number) => {
      try {
        const imageRes = await fetch(`${FASTAPI_BASE}/image/image/${imageId}`);
        if (imageRes.ok) {
          const imageBuffer = await imageRes.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

          return {
            id: imageId,
            src: `data:${mimeType};base64,${base64}`,
            success: true
          };
        } else {
          console.error(`Failed to fetch image ${imageId}:`, imageRes.status);
          return {
            id: imageId,
            src: null,
            success: false,
            error: `Failed to load image ${imageId}`
          };
        }
      } catch (error) {
        console.error(`Error fetching image ${imageId}:`, error);
        return {
          id: imageId,
          src: null,
          success: false,
          error: `Error loading image ${imageId}`
        };
      }
    });

    const images = await Promise.all(imagePromises);
    const successfulImages = images.filter(img => img.success);
    const failedImages = images.filter(img => !img.success);

    return c.json({
      success: true,
      data: {
        images: successfulImages,
        total_images: imageIds.length,
        successful_loads: successfulImages.length,
        failed_loads: failedImages.length,
        api_user_id: faceApiUserId
      },
      message: `Successfully loaded ${successfulImages.length}/${imageIds.length} images`
    });

  } catch (error) {
    console.error('Error in get user images:', error);
    return c.json({
      error: 'Internal server error',
      detail: String(error)
    }, 500);
  }
});

export const GET = handle(app);