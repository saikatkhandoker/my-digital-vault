import { useLinks } from '@/context/LinkContext';
import { LinkCard } from './LinkCard';
import { Link as LinkIcon } from 'lucide-react';

export function LinkGrid() {
  const { links, searchQuery, selectedCategory } = useLinks();
  
  const filteredLinks = links.filter(l => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query
      ? l.title.toLowerCase().includes(query) || 
        l.url.toLowerCase().includes(query) ||
        l.tags.some(tag => tag.toLowerCase().includes(query))
      : true;
    
    const matchesCategory = selectedCategory === null || l.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (filteredLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <LinkIcon className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No links found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {links.length === 0 
            ? 'Add your first link using the form above'
            : 'No links match your search or filter'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredLinks.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
