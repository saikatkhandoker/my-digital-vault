export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'unknown';

// YouTube patterns
const youtubePatterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/shorts\/([^&\n?#]+)/,
];

// Facebook patterns
const facebookPatterns = [
  /facebook\.com\/.*\/videos\/(\d+)/,
  /facebook\.com\/watch\/?\?v=(\d+)/,
  /fb\.watch\/([^/?]+)/,
  /facebook\.com\/reel\/(\d+)/,
];

// Instagram patterns
const instagramPatterns = [
  /instagram\.com\/reel\/([^/?]+)/,
  /instagram\.com\/p\/([^/?]+)/,
  /instagram\.com\/reels\/([^/?]+)/,
  /instagr\.am\/reel\/([^/?]+)/,
  /instagr\.am\/p\/([^/?]+)/,
];

// TikTok patterns
const tiktokPatterns = [
  /tiktok\.com\/@[^/]+\/video\/(\d+)/,
  /tiktok\.com\/t\/([^/?]+)/,
  /vm\.tiktok\.com\/([^/?]+)/,
  /tiktok\.com\/v\/(\d+)/,
];

export function detectPlatform(url: string): VideoPlatform {
  for (const pattern of youtubePatterns) {
    if (pattern.test(url)) return 'youtube';
  }
  for (const pattern of facebookPatterns) {
    if (pattern.test(url)) return 'facebook';
  }
  for (const pattern of instagramPatterns) {
    if (pattern.test(url)) return 'instagram';
  }
  for (const pattern of tiktokPatterns) {
    if (pattern.test(url)) return 'tiktok';
  }
  return 'unknown';
}

export function extractVideoId(url: string): string | null {
  // Try YouTube patterns
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // Try Facebook patterns
  for (const pattern of facebookPatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // Try Instagram patterns
  for (const pattern of instagramPatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // Try TikTok patterns
  for (const pattern of tiktokPatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function isValidVideoUrl(url: string): boolean {
  return detectPlatform(url) !== 'unknown';
}

// Legacy function for backwards compatibility
export function isValidYouTubeUrl(url: string): boolean {
  return detectPlatform(url) === 'youtube';
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// Get thumbnail for any platform
export function getThumbnail(url: string, platform: VideoPlatform, videoId: string | null): string {
  if (platform === 'youtube' && videoId) {
    return getYouTubeThumbnail(videoId);
  }
  // Other platforms don't provide easy thumbnail access, use a placeholder
  return '/placeholder.svg';
}

// Fetch metadata for different platforms
export async function fetchVideoMetadata(url: string): Promise<{
  title: string;
  channelName: string;
  channelUrl: string;
  thumbnail: string;
} | null> {
  const platform = detectPlatform(url);
  
  if (platform === 'youtube') {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (response.ok) {
        const data = await response.json();
        const videoId = extractVideoId(url);
        return {
          title: data.title || '',
          channelName: data.author_name || '',
          channelUrl: data.author_url || '',
          thumbnail: videoId ? getYouTubeThumbnail(videoId) : '',
        };
      }
    } catch (error) {
      console.error('Failed to fetch YouTube metadata:', error);
    }
  }
  
  // Facebook, Instagram, and TikTok oEmbed require access tokens
  // Return partial data - user will need to enter title manually
  if (platform === 'facebook' || platform === 'instagram' || platform === 'tiktok') {
    return {
      title: '',
      channelName: '',
      channelUrl: '',
      thumbnail: '/placeholder.svg',
    };
  }
  
  return null;
}

// Get platform display name
export function getPlatformDisplayName(platform: VideoPlatform): string {
  switch (platform) {
    case 'youtube': return 'YouTube';
    case 'facebook': return 'Facebook';
    case 'instagram': return 'Instagram';
    case 'tiktok': return 'TikTok';
    default: return 'Unknown';
  }
}
