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
        description TEXT,
        channel_name TEXT,
        channel_url TEXT,
        category_id TEXT,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Add new columns if they don't exist (for existing tables)
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='channel_name') THEN
          ALTER TABLE videos ADD COLUMN channel_name TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='channel_url') THEN
          ALTER TABLE videos ADD COLUMN channel_url TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='tags') THEN
          ALTER TABLE videos ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='description') THEN
          ALTER TABLE videos ADD COLUMN description TEXT;
        END IF;
      END $$;
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `;

    // Create links table
    await sql`
      CREATE TABLE IF NOT EXISTS links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        favicon TEXT,
        description TEXT,
        category_id TEXT,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Add columns to links if they don't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='category_id') THEN
          ALTER TABLE links ADD COLUMN category_id TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='description') THEN
          ALTER TABLE links ADD COLUMN description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='tags') THEN
          ALTER TABLE links ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
      END $$;
    `;

    // Create link_categories table
    await sql`
      CREATE TABLE IF NOT EXISTS link_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `;
    
    // Insert default video categories if none exist
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    if (Number(categoryCount[0].count) === 0) {
      await sql`
        INSERT INTO categories (id, name, color) VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Music', '340 82% 52%'),
        ('22222222-2222-2222-2222-222222222222', 'Education', '200 98% 39%'),
        ('33333333-3333-3333-3333-333333333333', 'Entertainment', '262 83% 58%')
      `;
    }

    // Insert default link categories if none exist
    const linkCatCount = await sql`SELECT COUNT(*) as count FROM link_categories`;
    if (Number(linkCatCount[0].count) === 0) {
      await sql`
        INSERT INTO link_categories (id, name, color) VALUES 
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Articles', '220 70% 50%'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tools', '150 60% 45%'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Reference', '35 90% 55%')
      `;
    }

    const { action } = req.query;
    console.log('Neon videos action:', action);

    // ============ VIDEOS ============
    if (action === 'getVideos') {
      const videos = await sql`SELECT * FROM videos ORDER BY created_at DESC`;
      return res.status(200).json({ videos });
    }

    if (action === 'getCategories') {
      const categories = await sql`SELECT * FROM categories`;
      return res.status(200).json({ categories });
    }

    if (action === 'addVideo') {
      const { title, url, thumbnail, channelName, channelUrl, categoryId, tags, description } = req.body;
      const result = await sql`
        INSERT INTO videos (title, url, thumbnail, channel_name, channel_url, category_id, tags, description) 
        VALUES (${title}, ${url}, ${thumbnail}, ${channelName}, ${channelUrl}, ${categoryId}, ${tags || []}, ${description || null}) 
        RETURNING *
      `;
      console.log('Video added:', result[0]);
      return res.status(200).json({ video: result[0] });
    }

    if (action === 'updateVideo') {
      const { id, title, url, thumbnail, channelName, channelUrl, categoryId, tags, description } = req.body;
      const result = await sql`
        UPDATE videos SET 
          title = ${title}, 
          url = ${url}, 
          thumbnail = ${thumbnail}, 
          channel_name = ${channelName}, 
          channel_url = ${channelUrl}, 
          category_id = ${categoryId}, 
          tags = ${tags || []},
          description = ${description || null}
        WHERE id = ${id} 
        RETURNING *
      `;
      console.log('Video updated:', result[0]);
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

    // ============ LINKS ============
    if (action === 'getLinks') {
      const links = await sql`SELECT * FROM links ORDER BY created_at DESC`;
      return res.status(200).json({ links });
    }

    if (action === 'addLink') {
      const { title, url, favicon, categoryId, tags, description } = req.body;
      const result = await sql`
        INSERT INTO links (title, url, favicon, category_id, tags, description) 
        VALUES (${title}, ${url}, ${favicon}, ${categoryId}, ${tags || []}, ${description || null}) 
        RETURNING *
      `;
      console.log('Link added:', result[0]);
      return res.status(200).json({ link: result[0] });
    }

    if (action === 'updateLink') {
      const { id, title, url, favicon, categoryId, tags, description } = req.body;
      const result = await sql`
        UPDATE links SET 
          title = ${title}, 
          url = ${url}, 
          favicon = ${favicon}, 
          category_id = ${categoryId}, 
          tags = ${tags || []},
          description = ${description || null}
        WHERE id = ${id} 
        RETURNING *
      `;
      console.log('Link updated:', result[0]);
      return res.status(200).json({ link: result[0] });
    }

    if (action === 'deleteLink') {
      const { id } = req.body;
      await sql`DELETE FROM links WHERE id = ${id}`;
      console.log('Link deleted:', id);
      return res.status(200).json({ success: true });
    }

    // ============ LINK CATEGORIES ============
    if (action === 'getLinkCategories') {
      const categories = await sql`SELECT * FROM link_categories`;
      return res.status(200).json({ categories });
    }

    if (action === 'addLinkCategory') {
      const { name, color } = req.body;
      const result = await sql`
        INSERT INTO link_categories (name, color) VALUES (${name}, ${color}) RETURNING *
      `;
      console.log('Link category added:', result[0]);
      return res.status(200).json({ category: result[0] });
    }

    if (action === 'updateLinkCategory') {
      const { id, name, color } = req.body;
      const result = await sql`
        UPDATE link_categories SET name = ${name}, color = ${color} WHERE id = ${id} RETURNING *
      `;
      console.log('Link category updated:', result[0]);
      return res.status(200).json({ category: result[0] });
    }

    if (action === 'deleteLinkCategory') {
      const { id } = req.body;
      await sql`UPDATE links SET category_id = NULL WHERE category_id = ${id}`;
      await sql`DELETE FROM link_categories WHERE id = ${id}`;
      console.log('Link category deleted:', id);
      return res.status(200).json({ success: true });
    }

    // ============ FETCH TITLE ============
    if (action === 'fetchTitle') {
      const { url: targetUrl } = req.body;
      console.log('Fetching title for:', targetUrl);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        clearTimeout(timeoutId);
        
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        
        let title = null;
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1]
            .trim()
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
        }
        
        console.log('Fetched title:', title);
        return res.status(200).json({ title });
      } catch (error) {
        console.error('Title fetch error:', error);
        return res.status(200).json({ title: null, error: 'Failed to fetch title' });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Neon error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
