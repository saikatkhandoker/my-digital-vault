import { useState } from 'react';
import { useVideos } from '@/context/VideoContext';
import { VideoCard } from './VideoCard';
import { VideoGridSkeleton } from './VideoGridSkeleton';
import { Video } from 'lucide-react';
import { detectPlatform } from '@/lib/video-utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 8;

export function VideoGrid() {
  const { videos, selectedCategory, selectedPlatform, searchQuery, isLoading } = useVideos();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return <VideoGridSkeleton />;
  }
  
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

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 if current page exceeds total pages after filtering
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
