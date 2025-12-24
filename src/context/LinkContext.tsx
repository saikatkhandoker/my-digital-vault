import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Link, LinkCategory, LinkContextType } from '@/types/link';
import { apiConfig } from '@/lib/api-config';
import { toast } from 'sonner';

const LinkContext = createContext<LinkContextType | undefined>(undefined);

interface NeonLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  category_id: string | null;
  tags: string[] | null;
  created_at: string;
}

interface NeonLinkCategory {
  id: string;
  name: string;
  color: string;
  parent_id: string | null;
}

function mapNeonLinkToLink(neonLink: NeonLink): Link {
  return {
    id: neonLink.id,
    title: neonLink.title,
    url: neonLink.url,
    description: neonLink.description,
    favicon: neonLink.favicon,
    categoryId: neonLink.category_id,
    tags: neonLink.tags || [],
    createdAt: neonLink.created_at,
  };
}

function mapNeonCategoryToCategory(neonCategory: NeonLinkCategory): LinkCategory {
  return {
    id: neonCategory.id,
    name: neonCategory.name,
    color: neonCategory.color,
    parentId: neonCategory.parent_id,
  };
}

export function LinkProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [linkCategories, setLinkCategories] = useState<LinkCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [linksResult, categoriesResult] = await Promise.all([
        fetch(apiConfig.getVideosUrl('getLinks'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(apiConfig.getVideosUrl('getLinkCategories'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);
      
      const linksData = await linksResult.json();
      const categoriesData = await categoriesResult.json();
      
      if (linksData.links) {
        setLinks(linksData.links.map(mapNeonLinkToLink));
      }
      if (categoriesData.categories) {
        setLinkCategories(categoriesData.categories.map(mapNeonCategoryToCategory));
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
      toast.error('Failed to load links from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addLink = async (link: Omit<Link, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('addLink'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: link.title,
          url: link.url,
          description: link.description,
          favicon: link.favicon,
          categoryId: link.categoryId,
          tags: link.tags,
        }),
      });
      
      const data = await response.json();
      
      if (data.link) {
        setLinks(prev => [mapNeonLinkToLink(data.link), ...prev]);
        toast.success('Link added successfully');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to add link:', error);
      toast.error('Failed to add link');
    }
  };

  const updateLink = async (id: string, link: Partial<Omit<Link, 'id' | 'createdAt'>>) => {
    try {
      const existingLink = links.find(l => l.id === id);
      if (!existingLink) return;

      const response = await fetch(apiConfig.getVideosUrl('updateLink'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: link.title ?? existingLink.title,
          url: link.url ?? existingLink.url,
          description: link.description ?? existingLink.description,
          favicon: link.favicon ?? existingLink.favicon,
          categoryId: link.categoryId ?? existingLink.categoryId,
          tags: link.tags ?? existingLink.tags,
        }),
      });
      
      const data = await response.json();
      
      if (data.link) {
        setLinks(prev => prev.map(l => l.id === id ? mapNeonLinkToLink(data.link) : l));
        toast.success('Link updated');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to update link:', error);
      toast.error('Failed to update link');
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('deleteLink'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLinks(prev => prev.filter(l => l.id !== id));
        toast.success('Link deleted');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link');
    }
  };

  const addLinkCategory = async (category: Omit<LinkCategory, 'id'>) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('addLinkCategory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: category.name, 
          color: category.color,
          parentId: category.parentId || null 
        }),
      });
      
      const data = await response.json();
      
      if (data.category) {
        setLinkCategories(prev => [...prev, mapNeonCategoryToCategory(data.category)]);
        toast.success('Category added');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateLinkCategory = async (id: string, category: Partial<Omit<LinkCategory, 'id'>>) => {
    try {
      const existingCategory = linkCategories.find(c => c.id === id);
      if (!existingCategory) return;

      const response = await fetch(apiConfig.getVideosUrl('updateLinkCategory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          name: category.name ?? existingCategory.name, 
          color: category.color ?? existingCategory.color,
          parentId: category.parentId !== undefined ? category.parentId : existingCategory.parentId
        }),
      });
      
      const data = await response.json();
      
      if (data.category) {
        setLinkCategories(prev => prev.map(c => c.id === id ? mapNeonCategoryToCategory(data.category) : c));
        toast.success('Category updated');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteLinkCategory = async (id: string) => {
    try {
      const response = await fetch(apiConfig.getVideosUrl('deleteLinkCategory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLinkCategories(prev => prev.filter(c => c.id !== id));
        // Also update child categories to have no parent
        setLinkCategories(prev => prev.map(c => c.parentId === id ? { ...c, parentId: null } : c));
        setLinks(prev => prev.map(l => l.categoryId === id ? { ...l, categoryId: null } : l));
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
    <LinkContext.Provider value={{
      links,
      linkCategories,
      searchQuery,
      selectedCategory,
      isLoading,
      addLink,
      updateLink,
      deleteLink,
      setSearchQuery,
      setSelectedCategory,
      addLinkCategory,
      updateLinkCategory,
      deleteLinkCategory,
    }}>
      {children}
    </LinkContext.Provider>
  );
}

export function useLinks() {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error('useLinks must be used within a LinkProvider');
  }
  return context;
}
