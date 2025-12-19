import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideos } from '@/context/VideoContext';
import { extractVideoId, getYouTubeThumbnail, isValidYouTubeUrl } from '@/lib/youtube';
import { useToast } from '@/hooks/use-toast';

interface VideoMetadata {
  title: string;
  channelName: string;
  channelUrl: string;
}

export function VideoForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const { categories, addVideo } = useVideos();
  const { toast } = useToast();

  // Auto-fetch video metadata when URL changes
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isValidYouTubeUrl(url)) return;
      
      setIsFetchingMetadata(true);
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title || '');
          setChannelName(data.author_name || '');
          setChannelUrl(data.author_url || '');
        }
      } catch (error) {
        // Silent fail - user can enter details manually
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    const timeoutId = setTimeout(fetchMetadata, 500);
    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({ title: 'Please enter a YouTube URL', variant: 'destructive' });
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast({ title: 'Invalid YouTube URL', description: 'Please enter a valid YouTube link', variant: 'destructive' });
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      toast({ title: 'Could not extract video ID', variant: 'destructive' });
      return;
    }

    addVideo({
      url: url.trim(),
      title: title.trim() || 'Untitled Video',
      thumbnailUrl: getYouTubeThumbnail(videoId),
      channelName: channelName.trim() || null,
      channelUrl: channelUrl.trim() || null,
      categoryId: categoryId || null,
    });

    setUrl('');
    setTitle('');
    setChannelName('');
    setChannelUrl('');
    setCategoryId('');
    toast({ title: 'Video added successfully!' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium text-foreground">
          YouTube URL
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="url"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
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
