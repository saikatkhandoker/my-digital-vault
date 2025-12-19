export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  channelName: string | null;
  channelUrl: string | null;
  categoryId: string | null;
  createdAt: string;
}

export interface VideoContextType {
  videos: Video[];
  categories: Category[];
  selectedCategory: string | null;
  addVideo: (video: Omit<Video, 'id' | 'createdAt'>) => void;
  deleteVideo: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  setSelectedCategory: (id: string | null) => void;
}
