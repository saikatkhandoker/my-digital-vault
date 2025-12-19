// API configuration for switching between Lovable Cloud and Vercel
// In development/preview: uses Lovable Cloud edge functions
// In production (Vercel): uses Vercel serverless functions

const isVercel = import.meta.env.VITE_USE_VERCEL_API === 'true';

// Lovable Cloud base URL
const cloudBaseUrl = import.meta.env.VITE_SUPABASE_URL;

export const apiConfig = {
  isVercel,
  
  getAuthUrl: () => {
    if (isVercel) {
      return '/api/auth';
    }
    return `${cloudBaseUrl}/functions/v1/auth`;
  },
  
  getVideosUrl: (action: string) => {
    if (isVercel) {
      return `/api/videos?action=${action}`;
    }
    return `${cloudBaseUrl}/functions/v1/neon-videos?action=${action}`;
  },
};
