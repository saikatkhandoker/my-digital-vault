import { VideoPlatform } from '@/lib/video-utils';

export interface Category {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  channelName: string | null;
  channelUrl: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: string;
}

export interface VideoContextType {
  videos: Video[];
  categories: Category[];
  selectedCategory: string | null;
  selectedPlatform: VideoPlatform | null;
  searchQuery: string;
  isLoading: boolean;
  addVideo: (video: Omit<Video, 'id' | 'createdAt'>) => void;
  updateVideo: (id: string, video: Partial<Omit<Video, 'id' | 'createdAt'>>) => void;
  deleteVideo: (id: string) => void;
  addCategory: (name: string, color: string, parentId?: string | null) => void;
  updateCategory: (id: string, name: string, color: string, parentId?: string | null) => void;
  deleteCategory: (id: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setSelectedPlatform: (platform: VideoPlatform | null) => void;
  setSearchQuery: (query: string) => void;
  getParentCategories: () => Category[];
  getSubcategories: (parentId: string) => Category[];
}
