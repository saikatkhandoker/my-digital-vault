import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { Youtube, Facebook, Instagram, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectPlatform, VideoPlatform } from '@/lib/video-utils';

// TikTok icon component (not available in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

export function PlatformFilter() {
  const { videos, selectedPlatform, setSelectedPlatform } = useVideos();

  const getPlatformCount = (platform: VideoPlatform | null) => {
    if (platform === null) return videos.length;
    return videos.filter(v => detectPlatform(v.url) === platform).length;
  };

  const platforms: { id: VideoPlatform | null; label: string; icon: React.ReactNode; bgClass: string }[] = [
    { id: null, label: 'All', icon: <Video className="h-4 w-4" />, bgClass: '' },
    { id: 'youtube', label: 'YouTube', icon: <Youtube className="h-4 w-4" />, bgClass: 'bg-red-500 hover:bg-red-600 border-red-500' },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4" />, bgClass: 'bg-blue-600 hover:bg-blue-700 border-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4" />, bgClass: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 border-pink-500' },
    { id: 'tiktok', label: 'TikTok', icon: <TikTokIcon className="h-4 w-4" />, bgClass: 'bg-black hover:bg-gray-900 border-black' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const count = getPlatformCount(platform.id);
        const isSelected = selectedPlatform === platform.id;
        
        return (
          <Button
            key={platform.id ?? 'all'}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform(isSelected && platform.id !== null ? null : platform.id)}
            className={cn(
              'rounded-full gap-2 transition-all',
              isSelected && platform.id !== null && platform.bgClass,
            )}
          >
            {platform.icon}
            {platform.label} ({count})
          </Button>
        );
      })}
    </div>
  );
}
