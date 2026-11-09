import type { Request, Response } from 'express';

const ADMIN_EMAILS = ['gut6762@gmail.com'];

export default function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return res.json({
      authorized: true,
      role: 'admin',
      tier: 'Superuser Executive',
    });
  }

  return res.status(403).json({
    authorized: false,
    message: 'Access denied: User is not authorized to access administrative control.',
  });
}
