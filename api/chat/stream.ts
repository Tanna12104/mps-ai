import type { Request, Response } from 'express';
import { handleChatStream } from '../../server/gateway';

export default async function handler(req: Request, res: Response) {
  try {
    return await handleChatStream(req, res);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API/CHAT/STREAM] Unhandled serverless execution error:', err.message || error);
    if (!res.headersSent) {
      return res.status(err.status || 500).json({
        error: err.message || 'Internal server error processing stream',
        status: err.status || 500,
      });
    }
    res.end();
  }
}
