import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Link, LinkCategory, LinkContextType } from '@/types/link';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export function LinkProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [linkCategories, setLinkCategories] = useState<LinkCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLinks([]);
      setLinkCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch links (RLS will handle filtering)
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (linksError) throw linksError;
      
      setLinks((linksData || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        favicon: l.favicon,
        categoryId: l.category_id,
        tags: l.tags || [],
        createdAt: l.created_at,
        userId: l.user_id,
      })));

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('link_categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      
      setLinkCategories((categoriesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        userId: c.user_id,
      })));
    } catch (error) {
      console.error('Failed to fetch links:', error);
      toast.error('Failed to load links');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addLink = async (link: Omit<Link, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          title: link.title,
          url: link.url,
          favicon: link.favicon,
          category_id: link.categoryId,
          tags: link.tags,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setLinks(prev => [{
        id: data.id,
        title: data.title,
        url: data.url,
        favicon: data.favicon,
        categoryId: data.category_id,
        tags: data.tags || [],
        createdAt: data.created_at,
        userId: data.user_id,
      }, ...prev]);
      
      toast.success('Link added successfully');
    } catch (error) {
      console.error('Failed to add link:', error);
      toast.error('Failed to add link');
    }
  };

  const updateLink = async (id: string, link: Partial<Omit<Link, 'id' | 'createdAt'>>) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .update({
          title: link.title,
          url: link.url,
          favicon: link.favicon,
          category_id: link.categoryId,
          tags: link.tags,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setLinks(prev => prev.map(l => l.id === id ? {
        ...l,
        title: data.title,
        url: data.url,
        favicon: data.favicon,
        categoryId: data.category_id,
        tags: data.tags || [],
      } : l));
      
      toast.success('Link updated');
    } catch (error) {
      console.error('Failed to update link:', error);
      toast.error('Failed to update link');
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('Link deleted');
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link');
    }
  };

  const addLinkCategory = async (category: Omit<LinkCategory, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('link_categories')
        .insert({
          user_id: user.id,
          name: category.name,
          color: category.color,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setLinkCategories(prev => [...prev, {
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

  const updateLinkCategory = async (id: string, category: Omit<LinkCategory, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('link_categories')
        .update({ name: category.name, color: category.color })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setLinkCategories(prev => prev.map(c => c.id === id ? {
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

  const deleteLinkCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('link_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLinkCategories(prev => prev.filter(c => c.id !== id));
      setLinks(prev => prev.map(l => l.categoryId === id ? { ...l, categoryId: null } : l));
      toast.success('Category deleted');
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
