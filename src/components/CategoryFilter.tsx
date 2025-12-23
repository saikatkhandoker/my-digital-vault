import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, videos, getParentCategories, getSubcategories } = useVideos();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const parentCategories = getParentCategories();

  const getCategoryCount = (categoryId: string | null | 'uncategorized') => {
    if (categoryId === null) return videos.length;
    if (categoryId === 'uncategorized') return videos.filter(v => !v.categoryId).length;
    
    // Count videos in this category AND all its subcategories
    const subcats = getSubcategories(categoryId);
    const subcatIds = subcats.map(s => s.id);
    return videos.filter(v => v.categoryId === categoryId || subcatIds.includes(v.categoryId || '')).length;
  };

  const getDirectCount = (categoryId: string) => {
    return videos.filter(v => v.categoryId === categoryId).length;
  };

  const uncategorizedCount = getCategoryCount('uncategorized');

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isParentSelected = (parentId: string) => {
    if (selectedCategory === parentId) return true;
    const subs = getSubcategories(parentId);
    return subs.some(s => s.id === selectedCategory);
  };

  return (
    <div className="flex flex-wrap gap-2 items-start">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedCategory(null)}
        className="rounded-full"
      >
        All ({getCategoryCount(null)})
      </Button>

      {/* Uncategorized filter */}
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
      
      {parentCategories.map((category) => {
        const subcats = getSubcategories(category.id);
        const hasSubcategories = subcats.length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const isSelected = selectedCategory === category.id;
        const totalCount = getCategoryCount(category.id);

        if (!hasSubcategories) {
          // Simple button for categories without subcategories
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
              {category.name} ({totalCount})
            </Button>
          );
        }

        // Collapsible for categories with subcategories
        return (
          <Collapsible
            key={category.id}
            open={isExpanded}
            onOpenChange={() => toggleExpanded(category.id)}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-6 p-0 hover:bg-transparent"
                    style={{ color: `hsl(${category.color})` }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <Button
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
                  {category.name} ({totalCount})
                </Button>
              </div>
              
              <CollapsibleContent className="ml-7 mt-1 flex flex-wrap gap-1">
                {subcats.map((subcat) => {
                  const isSubSelected = selectedCategory === subcat.id;
                  const subCount = getDirectCount(subcat.id);
                  
                  return (
                    <Button
                      key={subcat.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(isSubSelected ? null : subcat.id)}
                      className={cn(
                        'rounded-full border-2 transition-all text-xs h-7',
                        isSubSelected && 'border-transparent'
                      )}
                      style={isSubSelected ? {
                        backgroundColor: `hsl(${subcat.color})`,
                        color: 'white',
                        borderColor: `hsl(${subcat.color})`,
                      } : {
                        borderColor: `hsl(${subcat.color} / 0.5)`,
                        color: `hsl(${subcat.color})`,
                      }}
                    >
                      {subcat.name} ({subCount})
                    </Button>
                  );
                })}
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}