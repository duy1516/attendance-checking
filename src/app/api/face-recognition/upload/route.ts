import { Hono } from 'hono'
import { handle } from 'hono/vercel'

// FastAPI endpoint URL
const FASTAPI_URL = 'http://127.0.0.1:8000/image/image/'

const app = new Hono().basePath('/api/face-recognition/upload')

app.post('/', async (c) => {
  const body = await c.req.parseBody()

  const file = body['file']
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No valid file uploaded' }, 400)
  }

  // Forward file to FastAPI
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(FASTAPI_URL, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    // Cast the status to the expected type
    return c.json(data, response.status as any)

  } catch (error) {
    return c.json({ error: 'Failed to forward file to FastAPI', detail: String(error) }, 500)
  }
})

export const POST = handle(app)