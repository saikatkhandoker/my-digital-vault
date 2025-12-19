import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

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

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: 'NEON_DATABASE_URL not configured' });
  }

  const sql = neon(databaseUrl);

  try {
    // Initialize tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        thumbnail TEXT,
        channel_title TEXT,
        category_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `;
    
    // Insert default categories if none exist
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    if (Number(categoryCount[0].count) === 0) {
      await sql`
        INSERT INTO categories (id, name, color) VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Music', '340 82% 52%'),
        ('22222222-2222-2222-2222-222222222222', 'Education', '200 98% 39%'),
        ('33333333-3333-3333-3333-333333333333', 'Entertainment', '262 83% 58%')
      `;
    }

    const { action } = req.query;

    console.log('Neon videos action:', action);

    if (action === 'getVideos') {
      const videos = await sql`SELECT * FROM videos ORDER BY created_at DESC`;
      return res.status(200).json({ videos });
    }

    if (action === 'getCategories') {
      const categories = await sql`SELECT * FROM categories`;
      return res.status(200).json({ categories });
    }

    if (action === 'addVideo') {
      const { title, url, thumbnail, channelTitle, categoryId } = req.body;
      const result = await sql`
        INSERT INTO videos (title, url, thumbnail, channel_title, category_id) 
        VALUES (${title}, ${url}, ${thumbnail}, ${channelTitle}, ${categoryId}) 
        RETURNING *
      `;
      console.log('Video added:', result[0]);
      return res.status(200).json({ video: result[0] });
    }

    if (action === 'deleteVideo') {
      const { id } = req.body;
      await sql`DELETE FROM videos WHERE id = ${id}`;
      console.log('Video deleted:', id);
      return res.status(200).json({ success: true });
    }

    if (action === 'addCategory') {
      const { name, color } = req.body;
      const result = await sql`
        INSERT INTO categories (name, color) VALUES (${name}, ${color}) RETURNING *
      `;
      console.log('Category added:', result[0]);
      return res.status(200).json({ category: result[0] });
    }

    if (action === 'updateCategory') {
      const { id, name, color } = req.body;
      const result = await sql`
        UPDATE categories SET name = ${name}, color = ${color} WHERE id = ${id} RETURNING *
      `;
      console.log('Category updated:', result[0]);
      return res.status(200).json({ category: result[0] });
    }

    if (action === 'deleteCategory') {
      const { id } = req.body;
      await sql`UPDATE videos SET category_id = NULL WHERE category_id = ${id}`;
      await sql`DELETE FROM categories WHERE id = ${id}`;
      console.log('Category deleted:', id);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Neon error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
