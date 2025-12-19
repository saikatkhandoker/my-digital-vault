import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Link, LinkContextType } from '@/types/link';
import { apiConfig } from '@/lib/api-config';
import { toast } from 'sonner';

const LinkContext = createContext<LinkContextType | undefined>(undefined);

interface NeonLink {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  tags: string[] | null;
  created_at: string;
}

function mapNeonLinkToLink(neonLink: NeonLink): Link {
  return {
    id: neonLink.id,
    title: neonLink.title,
    url: neonLink.url,
    favicon: neonLink.favicon,
    tags: neonLink.tags || [],
    createdAt: neonLink.created_at,
  };
}

export function LinkProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const linksResult = await fetch(apiConfig.getVideosUrl('getLinks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const linksData = await linksResult.json();
      
      if (linksData.links) {
        setLinks(linksData.links.map(mapNeonLinkToLink));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: link.title,
          url: link.url,
          favicon: link.favicon,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title: link.title ?? existingLink.title,
          url: link.url ?? existingLink.url,
          favicon: link.favicon ?? existingLink.favicon,
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LinkContext.Provider value={{
      links,
      searchQuery,
      addLink,
      updateLink,
      deleteLink,
      setSearchQuery,
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
