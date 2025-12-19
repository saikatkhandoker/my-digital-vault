import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    const validUsername = process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;

    console.log('Auth attempt for username:', username);

    if (!validUsername || !validPassword) {
      console.error('Auth credentials not configured');
      return res.status(500).json({ error: 'Authentication not configured' });
    }

    if (username === validUsername && password === validPassword) {
      // Generate a simple session token
      const token = crypto.randomUUID();
      
      console.log('Auth successful');
      return res.status(200).json({ success: true, token, username });
    } else {
      console.log('Auth failed - invalid credentials');
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
