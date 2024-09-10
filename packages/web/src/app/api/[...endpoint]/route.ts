import { handle } from '@hono/node-server/vercel'
import { app } from './index'

export const OPTIONS = handle(app)
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
