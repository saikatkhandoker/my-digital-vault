import { useVideos } from '@/context/VideoContext';
import { VideoCard } from './VideoCard';
import { Video } from 'lucide-react';
import { detectPlatform } from '@/lib/video-utils';

export function VideoGrid() {
  const { videos, selectedCategory, selectedPlatform, searchQuery } = useVideos();
  
  const filteredVideos = videos.filter(v => {
    const matchesCategory = selectedCategory ? v.categoryId === selectedCategory : true;
    const matchesPlatform = selectedPlatform ? detectPlatform(v.url) === selectedPlatform : true;
    
    // Search by title or tags
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query
      ? v.title.toLowerCase().includes(query) || 
        v.tags.some(tag => tag.toLowerCase().includes(query))
      : true;
    
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Video className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No videos found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {videos.length === 0 
            ? 'Add your first video using the form above'
            : 'No videos match the selected filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredVideos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
