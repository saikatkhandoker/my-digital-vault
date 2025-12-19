import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Video, Category, VideoContextType } from '@/types/video';
import { apiConfig } from '@/lib/api-config';
import { VideoPlatform } from '@/lib/video-utils';
import { toast } from 'sonner';

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface NeonVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  channel_name: string | null;
  channel_url: string | null;
  category_id: string | null;
  tags: string[] | null;
  created_at: string;
}

function mapNeonVideoToVideo(neonVideo: NeonVideo): Video {
  return {
    id: neonVideo.id,
    title: neonVideo.title,
    url: neonVideo.url,
    thumbnailUrl: neonVideo.thumbnail || '',
    channelName: neonVideo.channel_name,
    channelUrl: neonVideo.channel_url,
    categoryId: neonVideo.category_id,
    tags: neonVideo.tags || [],
    createdAt: neonVideo.created_at,
  };
}

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<VideoPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch videos
      const videosResult = await fetch(apiConfig.getVideosUrl('getVideos'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const videosData = await videosResult.json();
      
      if (videosData.videos) {
        setVideos(videosData.videos.map(mapNeonVideoToVideo));
      }

      // Fetch categories
      const categoriesResult = await fetch(apiConfig.getVideosUrl('getCategories'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const categoriesData = await categoriesResult.json();
      
      if (categoriesData.categories) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addVideo = async (video: Omit<Video, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('addVideo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnailUrl,
          channelName: video.channelName,
          channelUrl: video.channelUrl,
          categoryId: video.categoryId,
          tags: video.tags,
        }),
      });
      
      const data = await response.json();
      
      if (data.video) {
        setVideos(prev => [mapNeonVideoToVideo(data.video), ...prev]);
        toast.success('Video added successfully');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to add video:', error);
      toast.error('Failed to add video');
    }
  };

  const updateVideo = async (id: string, video: Partial<Omit<Video, 'id' | 'createdAt'>>) => {
    try {
      const existingVideo = videos.find(v => v.id === id);
      if (!existingVideo) return;

      const response = await fetch(apiConfig.getVideosUrl('updateVideo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title: video.title ?? existingVideo.title,
          url: video.url ?? existingVideo.url,
          thumbnail: video.thumbnailUrl ?? existingVideo.thumbnailUrl,
          channelName: video.channelName ?? existingVideo.channelName,
          channelUrl: video.channelUrl ?? existingVideo.channelUrl,
          categoryId: video.categoryId ?? existingVideo.categoryId,
          tags: video.tags ?? existingVideo.tags,
        }),
      });
      
      const data = await response.json();
      
      if (data.video) {
        setVideos(prev => prev.map(v => v.id === id ? mapNeonVideoToVideo(data.video) : v));
        toast.success('Video updated');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to update video:', error);
      toast.error('Failed to update video');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('deleteVideo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVideos(prev => prev.filter(v => v.id !== id));
        toast.success('Video deleted');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error('Failed to delete video');
    }
  };

  const addCategory = async (name: string, color: string) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('addCategory'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });
      
      const data = await response.json();
      
      if (data.category) {
        setCategories(prev => [...prev, data.category]);
        toast.success('Category added');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('updateCategory'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, color }),
      });
      
      const data = await response.json();
      
      if (data.category) {
        setCategories(prev => prev.map(c => c.id === id ? data.category : c));
        toast.success('Category updated');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('deleteCategory'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        setVideos(prev => prev.map(v => v.categoryId === id ? { ...v, categoryId: null } : v));
        if (selectedCategory === id) {
          setSelectedCategory(null);
        }
        toast.success('Category deleted');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <VideoContext.Provider value={{
      videos,
      categories,
      selectedCategory,
      selectedPlatform,
      searchQuery,
      isLoading,
      addVideo,
      updateVideo,
      deleteVideo,
      addCategory,
      updateCategory,
      deleteCategory,
      setSelectedCategory,
      setSelectedPlatform,
      setSearchQuery,
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
}
