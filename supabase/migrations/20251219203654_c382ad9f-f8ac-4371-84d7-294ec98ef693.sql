-- Add sharing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN share_videos BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN share_links BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN public_slug TEXT UNIQUE;

-- Create index for public slug lookups
CREATE INDEX idx_profiles_public_slug ON public.profiles(public_slug) WHERE public_slug IS NOT NULL;

-- Add policy for public profile viewing
CREATE POLICY "Anyone can view public profiles"
ON public.profiles
FOR SELECT
USING (is_public = true);

-- Add policies for public video viewing
CREATE POLICY "Anyone can view videos of public profiles"
ON public.videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = videos.user_id 
    AND profiles.is_public = true 
    AND profiles.share_videos = true
  )
);

-- Add policies for public link viewing
CREATE POLICY "Anyone can view links of public profiles"
ON public.links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = links.user_id 
    AND profiles.is_public = true 
    AND profiles.share_links = true
  )
);

-- Add policies for public category viewing (needed to display categories on public pages)
CREATE POLICY "Anyone can view video categories of public profiles"
ON public.video_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = video_categories.user_id 
    AND profiles.is_public = true 
    AND profiles.share_videos = true
  )
);

CREATE POLICY "Anyone can view link categories of public profiles"
ON public.link_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = link_categories.user_id 
    AND profiles.is_public = true 
    AND profiles.share_links = true
  )
);