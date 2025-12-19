import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Loader2, Youtube, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideos } from '@/context/VideoContext';
import { detectPlatform, extractVideoId, isValidVideoUrl, fetchVideoMetadata, getThumbnail, getPlatformDisplayName } from '@/lib/video-utils';
import { useToast } from '@/hooks/use-toast';

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

export function VideoForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const { categories, addVideo } = useVideos();
  const { toast } = useToast();

  const platform = detectPlatform(url);

  // Auto-fetch video metadata when URL changes
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isValidVideoUrl(url)) {
        setThumbnail('');
        return;
      }
      
      setIsFetchingMetadata(true);
      try {
        const metadata = await fetchVideoMetadata(url);
        if (metadata) {
          setTitle(metadata.title);
          setChannelName(metadata.channelName);
          setChannelUrl(metadata.channelUrl);
          setThumbnail(metadata.thumbnail);
        } else {
          // Fallback for platforms without easy metadata
          const videoId = extractVideoId(url);
          setThumbnail(getThumbnail(url, platform, videoId));
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    const timeoutId = setTimeout(fetchMetadata, 500);
    return () => clearTimeout(timeoutId);
  }, [url, platform]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({ title: 'Please enter a video URL', variant: 'destructive' });
      return;
    }

    if (!isValidVideoUrl(url)) {
      toast({ 
        title: 'Invalid video URL', 
        description: 'Please enter a valid YouTube, Facebook, Instagram, or TikTok video link', 
        variant: 'destructive' 
      });
      return;
    }

    const videoId = extractVideoId(url);
    const finalThumbnail = thumbnail || getThumbnail(url, platform, videoId);

    addVideo({
      url: url.trim(),
      title: title.trim() || 'Untitled Video',
      thumbnailUrl: finalThumbnail,
      channelName: channelName.trim() || null,
      channelUrl: channelUrl.trim() || null,
      categoryId: categoryId || null,
    });

    setUrl('');
    setTitle('');
    setChannelName('');
    setChannelUrl('');
    setThumbnail('');
    setCategoryId('');
    toast({ title: 'Video added successfully!' });
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-500" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'tiktok': return <TikTokIcon className="h-4 w-4" />;
      default: return <LinkIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const needsManualTitle = platform !== 'unknown' && platform !== 'youtube' && !title;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium text-foreground">
          Video URL
          {platform !== 'unknown' && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({getPlatformDisplayName(platform)} detected)
            </span>
          )}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {getPlatformIcon()}
          </div>
          <Input
            id="url"
            type="url"
            placeholder="Paste YouTube, Facebook, Instagram, or TikTok URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title {isFetchingMetadata && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
          </label>
          <Input
            id="title"
            type="text"
            placeholder={isFetchingMetadata ? "Fetching..." : "Video title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Category
          </label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: `hsl(${category.color})` }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {needsManualTitle && (
        <p className="text-sm text-amber-600">
          {getPlatformDisplayName(platform)} video titles can't be auto-fetched. Please enter a title manually.
        </p>
      )}

      {channelName && (
        <p className="text-sm text-muted-foreground">
          Channel: {channelName}
        </p>
      )}

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Video
      </Button>
    </form>
  );
}
