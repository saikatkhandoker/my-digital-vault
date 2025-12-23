import { useState } from 'react';
import { useLinks } from '@/context/LinkContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

const VISIBLE_LIMIT = 5;

export function LinkCategoryFilter() {
  const { linkCategories, selectedCategory, setSelectedCategory, links } = useLinks();
  const [showAll, setShowAll] = useState(false);

  const getCategoryCount = (categoryId: string | null | 'uncategorized') => {
    if (categoryId === null) return links.length;
    if (categoryId === 'uncategorized') return links.filter(l => !l.categoryId).length;
    return links.filter(l => l.categoryId === categoryId).length;
  };

  const uncategorizedCount = getCategoryCount('uncategorized');

  // Filter out empty categories
  const nonEmptyCategories = linkCategories.filter(cat => getCategoryCount(cat.id) > 0);
  
  // Limit visible categories
  const visibleCategories = showAll ? nonEmptyCategories : nonEmptyCategories.slice(0, VISIBLE_LIMIT);
  const hasMore = nonEmptyCategories.length > VISIBLE_LIMIT;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedCategory(null)}
        className="rounded-full"
      >
        All ({getCategoryCount(null)})
      </Button>

      {/* Uncategorized filter - only show if has items */}
      {uncategorizedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory(selectedCategory === 'uncategorized' ? null : 'uncategorized')}
          className={cn(
            'rounded-full border-2 transition-all',
            selectedCategory === 'uncategorized' && 'bg-muted-foreground/20 border-muted-foreground'
          )}
        >
          Uncategorized ({uncategorizedCount})
        </Button>
      )}
      
      {visibleCategories.map((category) => {
        const count = getCategoryCount(category.id);
        const isSelected = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(isSelected ? null : category.id)}
            className={cn(
              'rounded-full border-2 transition-all',
              isSelected && 'border-transparent'
            )}
            style={isSelected ? {
              backgroundColor: `hsl(${category.color})`,
              color: 'white',
              borderColor: `hsl(${category.color})`,
            } : {
              borderColor: `hsl(${category.color} / 0.5)`,
              color: `hsl(${category.color})`,
            }}
          >
            {category.name} ({count})
          </Button>
        );
      })}

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          {showAll ? (
            <>
              Show less <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              +{nonEmptyCategories.length - VISIBLE_LIMIT} more <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}