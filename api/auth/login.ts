import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  const username = email ? email.split('@')[0] : 'Intelligence Member';

  res.json({
    success: true,
    token: 'demo-session-token',
    user: {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: email || 'member@mps.ai',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      tier: 'Enterprise Pro',
      tokensRemaining: 1000000,
    },
  });
}
