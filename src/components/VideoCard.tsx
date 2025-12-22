import { useState } from 'react';
import { ExternalLink, Trash2, User, Youtube, Facebook, Instagram, Pencil, Info } from 'lucide-react';
import { Video } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVideos } from '@/context/VideoContext';
import { detectPlatform, getPlatformPlaceholder, extractVideoId, getYouTubeThumbnail } from '@/lib/video-utils';
import { VideoEditDialog } from './VideoEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { categories, deleteVideo } = useVideos();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDescriptionDrawer, setShowDescriptionDrawer] = useState(false);
  const category = categories.find(c => c.id === video.categoryId);
  const platform = detectPlatform(video.url);

  const handleClick = (e: React.MouseEvent) => {
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteVideo(video.id);
    setShowDeleteDialog(false);
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-500" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'tiktok': return <TikTokIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <div 
        className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30"
        onClick={handleClick}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {(() => {
            // Generate thumbnail: use stored one, or generate YouTube thumbnail, or use platform placeholder
            let thumbnailSrc = video.thumbnailUrl;
            if (!thumbnailSrc || thumbnailSrc === '' || thumbnailSrc === '/placeholder.svg') {
              if (platform === 'youtube') {
                const videoId = extractVideoId(video.url);
                thumbnailSrc = videoId ? getYouTubeThumbnail(videoId) : getPlatformPlaceholder(platform);
              } else {
                thumbnailSrc = getPlatformPlaceholder(platform);
              }
            }
            return (
              <img
                src={thumbnailSrc}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            );
          })()}
          <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <ExternalLink className="h-5 w-5 text-background drop-shadow-md" />
          </div>
          {/* Platform badge */}
          <div className="absolute left-2 top-2">
            <div className="rounded-full bg-background/90 p-1.5 shadow-sm">
              {getPlatformIcon()}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-medium text-card-foreground">
              {video.title}
            </h3>
            <div className="flex shrink-0 gap-1">
              {video.description && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescriptionDrawer(true);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={handleEditClick}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
          
          {category ? (
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
          ) : (
            <Badge variant="secondary" className="mt-2 bg-muted-foreground/10 text-muted-foreground">
              Uncategorized
            </Badge>
          )}

          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {video.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{video.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VideoEditDialog 
        video={video} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />

      <Drawer open={showDescriptionDrawer} onOpenChange={setShowDescriptionDrawer}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{video.title}</DrawerTitle>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none mt-2"
              dangerouslySetInnerHTML={{ __html: video.description || '' }}
            />
          </DrawerHeader>
          <div className="p-4 pt-0">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowDescriptionDrawer(false)}
            >
              Close
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
