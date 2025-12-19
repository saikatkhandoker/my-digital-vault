import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize pool lazily
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = Deno.env.get('NEON_DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('NEON_DATABASE_URL not configured');
    }
    pool = new Pool(databaseUrl, 3, true);
  }
  return pool;
}

// Initialize the videos table if it doesn't exist
async function initTable(client: any) {
  await client.queryArray(`
    CREATE TABLE IF NOT EXISTS videos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail TEXT,
      channel_name TEXT,
      channel_url TEXT,
      category_id TEXT,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add new columns if they don't exist (for existing tables)
  await client.queryArray(`
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
    END $$;
  `);
  
  await client.queryArray(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `);
  
  // Insert default categories if none exist
  const result = await client.queryArray('SELECT COUNT(*) FROM categories');
  if (result.rows[0][0] === 0n || result.rows[0][0] === 0) {
    await client.queryArray(`
      INSERT INTO categories (id, name, color) VALUES 
      ('11111111-1111-1111-1111-111111111111', 'Music', '340 82% 52%'),
      ('22222222-2222-2222-2222-222222222222', 'Education', '200 98% 39%'),
      ('33333333-3333-3333-3333-333333333333', 'Entertainment', '262 83% 58%')
    `);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    // Ensure tables exist
    await initTable(client);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log('Neon videos action:', action);

    if (action === 'getVideos') {
      const result = await client.queryObject('SELECT * FROM videos ORDER BY created_at DESC');
      return new Response(
        JSON.stringify({ videos: result.rows }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'getCategories') {
      const result = await client.queryObject('SELECT * FROM categories');
      return new Response(
        JSON.stringify({ categories: result.rows }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'addVideo') {
      const { title, url: videoUrl, thumbnail, channelName, channelUrl, categoryId, tags } = await req.json();
      const result = await client.queryObject(
        `INSERT INTO videos (title, url, thumbnail, channel_name, channel_url, category_id, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [title, videoUrl, thumbnail, channelName, channelUrl, categoryId, tags || []]
      );
      console.log('Video added:', result.rows[0]);
      return new Response(
        JSON.stringify({ video: result.rows[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deleteVideo') {
      const { id } = await req.json();
      await client.queryArray('DELETE FROM videos WHERE id = $1', [id]);
      console.log('Video deleted:', id);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'updateVideo') {
      const { id, title, url, thumbnail, channelName, channelUrl, categoryId, tags } = await req.json();
      const result = await client.queryObject(
        `UPDATE videos SET title = $1, url = $2, thumbnail = $3, channel_name = $4, channel_url = $5, category_id = $6, tags = $7 
         WHERE id = $8 RETURNING *`,
        [title, url, thumbnail, channelName, channelUrl, categoryId, tags || [], id]
      );
      console.log('Video updated:', result.rows[0]);
      return new Response(
        JSON.stringify({ video: result.rows[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'addCategory') {
      const { name, color } = await req.json();
      const result = await client.queryObject(
        'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
        [name, color]
      );
      console.log('Category added:', result.rows[0]);
      return new Response(
        JSON.stringify({ category: result.rows[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'updateCategory') {
      const { id, name, color } = await req.json();
      const result = await client.queryObject(
        'UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *',
        [name, color, id]
      );
      console.log('Category updated:', result.rows[0]);
      return new Response(
        JSON.stringify({ category: result.rows[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deleteCategory') {
      const { id } = await req.json();
      // Update videos to remove category reference
      await client.queryArray('UPDATE videos SET category_id = NULL WHERE category_id = $1', [id]);
      await client.queryArray('DELETE FROM categories WHERE id = $1', [id]);
      console.log('Category deleted:', id);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Neon error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    client.release();
  }
});
