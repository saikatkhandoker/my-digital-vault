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

// Get platform-specific placeholder thumbnail
export function getPlatformPlaceholder(platform: VideoPlatform): string {
  switch (platform) {
    case 'facebook':
      return 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none">
          <rect width="400" height="225" fill="#1877F2"/>
          <path d="M200 45c-37.5 0-67.5 30-67.5 67.5 0 33.75 24.75 61.5 57 66.75v-47.25h-17.25v-19.5h17.25v-15c0-17.25 10.5-26.25 25.5-26.25 7.5 0 15 1.5 15 1.5v16.5h-8.25c-8.25 0-10.5 5.25-10.5 10.5v12.75h18.75l-3 19.5h-15.75v47.25c32.25-5.25 57-33 57-66.75 0-37.5-30-67.5-67.5-67.5z" fill="white"/>
        </svg>
      `);
    case 'instagram':
      return 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none">
          <defs>
            <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#FCAF45"/>
              <stop offset="25%" style="stop-color:#F77737"/>
              <stop offset="50%" style="stop-color:#E1306C"/>
              <stop offset="75%" style="stop-color:#C13584"/>
              <stop offset="100%" style="stop-color:#833AB4"/>
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill="url(#ig)"/>
          <rect x="150" y="62.5" width="100" height="100" rx="25" stroke="white" stroke-width="8" fill="none"/>
          <circle cx="200" cy="112.5" r="25" stroke="white" stroke-width="8" fill="none"/>
          <circle cx="235" cy="77.5" r="8" fill="white"/>
        </svg>
      `);
    case 'tiktok':
      return 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none">
          <rect width="400" height="225" fill="#010101"/>
          <path d="M235 55c0 22 18 40 40 40v25c-14 0-27-4.5-38-12.5v57c0 33.5-27 60.5-60 60.5s-60-27-60-60.5c0-33.5 27-60.5 60-60.5v25c-19.5 0-35 16-35 35.5s15.5 35.5 35 35.5 35-16 35-35.5V55h23z" fill="#25F4EE"/>
          <path d="M240 50c0 22 18 40 40 40v25c-14 0-27-4.5-38-12.5v57c0 33.5-27 60.5-60 60.5s-60-27-60-60.5c0-33.5 27-60.5 60-60.5v25c-19.5 0-35 16-35 35.5s15.5 35.5 35 35.5 35-16 35-35.5V50h23z" fill="#FE2C55"/>
          <path d="M237.5 52.5c0 22 18 40 40 40v25c-14 0-27-4.5-38-12.5v57c0 33.5-27 60.5-60 60.5s-60-27-60-60.5c0-33.5 27-60.5 60-60.5v25c-19.5 0-35 16-35 35.5s15.5 35.5 35 35.5 35-16 35-35.5V52.5h23z" fill="white"/>
        </svg>
      `);
    case 'youtube':
      return 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none">
          <rect width="400" height="225" fill="#FF0000"/>
          <path d="M160 82.5v60l52-30-52-30z" fill="white"/>
        </svg>
      `);
    default:
      return '/placeholder.svg';
  }
}

// Get thumbnail for any platform
export function getThumbnail(url: string, platform: VideoPlatform, videoId: string | null): string {
  if (platform === 'youtube' && videoId) {
    return getYouTubeThumbnail(videoId);
  }
  // Other platforms don't provide easy thumbnail access, use platform-specific placeholder
  return getPlatformPlaceholder(platform);
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
      thumbnail: getPlatformPlaceholder(platform),
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
