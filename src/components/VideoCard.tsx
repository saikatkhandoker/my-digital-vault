import { ExternalLink, Trash2, User } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVideos } from '@/context/VideoContext';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { categories, deleteVideo } = useVideos();
  const category = categories.find(c => c.id === video.categoryId);

  const handleClick = (e: React.MouseEvent) => {
    // Use anchor behavior for better compatibility with sandboxed environments
    const link = document.createElement('a');
    link.href = video.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.channelUrl) {
      const link = document.createElement('a');
      link.href = video.channelUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteVideo(video.id);
  };

  return (
    <div 
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30"
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <ExternalLink className="h-5 w-5 text-background drop-shadow-md" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-medium text-card-foreground">
            {video.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {video.channelName && (
          <button
            onClick={handleChannelClick}
            className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hover:underline">{video.channelName}</span>
          </button>
        )}
        
        {category && (
          <Badge 
            variant="secondary" 
            className="mt-2"
            style={{ 
              backgroundColor: `hsl(${category.color} / 0.15)`,
              color: `hsl(${category.color})`,
            }}
          >
            {category.name}
          </Badge>
        )}
      </div>
    </div>
  );
}
