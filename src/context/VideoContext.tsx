import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Video, Category, VideoContextType } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { VideoPlatform } from '@/lib/video-utils';
import { toast } from 'sonner';

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<VideoPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setVideos([]);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch videos (RLS will handle filtering)
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (videosError) throw videosError;
      
      setVideos((videosData || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        url: v.url,
        thumbnailUrl: v.thumbnail_url || '',
        channelName: null,
        channelUrl: null,
        categoryId: v.category_id,
        tags: v.tags || [],
        createdAt: v.created_at,
        userId: v.user_id,
      })));

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('video_categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      
      setCategories((categoriesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        userId: c.user_id,
      })));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addVideo = async (video: Omit<Video, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: video.title,
          url: video.url,
          thumbnail_url: video.thumbnailUrl,
          platform: null,
          category_id: video.categoryId,
          tags: video.tags,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setVideos(prev => [{
        id: data.id,
        title: data.title,
        url: data.url,
        thumbnailUrl: data.thumbnail_url || '',
        channelName: null,
        channelUrl: null,
        categoryId: data.category_id,
        tags: data.tags || [],
        createdAt: data.created_at,
        userId: data.user_id,
      }, ...prev]);
      
      toast.success('Video added successfully');
    } catch (error) {
      console.error('Failed to add video:', error);
      toast.error('Failed to add video');
    }
  };

  const updateVideo = async (id: string, video: Partial<Omit<Video, 'id' | 'createdAt'>>) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update({
          title: video.title,
          url: video.url,
          thumbnail_url: video.thumbnailUrl,
          category_id: video.categoryId,
          tags: video.tags,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setVideos(prev => prev.map(v => v.id === id ? {
        ...v,
        title: data.title,
        url: data.url,
        thumbnailUrl: data.thumbnail_url || '',
        categoryId: data.category_id,
        tags: data.tags || [],
      } : v));
      
      toast.success('Video updated');
    } catch (error) {
      console.error('Failed to update video:', error);
      toast.error('Failed to update video');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setVideos(prev => prev.filter(v => v.id !== id));
      toast.success('Video deleted');
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error('Failed to delete video');
    }
  };

  const addCategory = async (name: string, color: string) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_categories')
        .insert({
          user_id: user.id,
          name,
          color,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        color: data.color,
        userId: data.user_id,
      }]);
      
      toast.success('Category added');
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from('video_categories')
        .update({ name, color })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(prev => prev.map(c => c.id === id ? {
        ...c,
        name: data.name,
        color: data.color,
      } : c));
      
      toast.success('Category updated');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(c => c.id !== id));
      setVideos(prev => prev.map(v => v.categoryId === id ? { ...v, categoryId: null } : v));
      if (selectedCategory === id) {
        setSelectedCategory(null);
      }
      toast.success('Category deleted');
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
