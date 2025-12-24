import { useState } from 'react';
import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Category } from '@/types/video';

const VISIBLE_LIMIT = 5;

export function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, videos } = useVideos();
  const [showAll, setShowAll] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const getCategoryCount = (categoryId: string | null | 'uncategorized') => {
    if (categoryId === null) return videos.length;
    if (categoryId === 'uncategorized') return videos.filter(v => !v.categoryId).length;
    
    // Count videos in this category AND its subcategories
    const childIds = categories.filter(c => c.parentId === categoryId).map(c => c.id);
    return videos.filter(v => v.categoryId === categoryId || childIds.includes(v.categoryId || '')).length;
  };

  const getDirectCount = (categoryId: string) => {
    return videos.filter(v => v.categoryId === categoryId).length;
  };

  const uncategorizedCount = getCategoryCount('uncategorized');

  // Get parent categories (categories without parents)
  const parentCategories = categories.filter(c => !c.parentId);

  // Filter out empty parent categories (no direct items and no children with items)
  const nonEmptyParentCategories = parentCategories.filter(cat => {
    const directCount = getDirectCount(cat.id);
    const children = categories.filter(c => c.parentId === cat.id);
    const childrenCount = children.reduce((sum, child) => sum + getDirectCount(child.id), 0);
    return directCount > 0 || childrenCount > 0;
  });
  
  // Limit visible categories
  const visibleCategories = showAll ? nonEmptyParentCategories : nonEmptyParentCategories.slice(0, VISIBLE_LIMIT);
  const hasMore = nonEmptyParentCategories.length > VISIBLE_LIMIT;

  const toggleParent = (parentId: string) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId && getDirectCount(c.id) > 0);
  };

  const renderCategoryButton = (category: Category, isChild = false) => {
    const count = isChild ? getDirectCount(category.id) : getCategoryCount(category.id);
    const isSelected = selectedCategory === category.id;
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedParents.has(category.id);

    return (
      <div key={category.id} className={cn("flex flex-col", isChild && "ml-4")}>
        <div className="flex items-center gap-1">
          {!isChild && hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={() => toggleParent(category.id)}
            >
              <ChevronRight 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90"
                )} 
              />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(isSelected ? null : category.id)}
            className={cn(
              'rounded-full border-2 transition-all',
              isSelected && 'border-transparent',
              isChild && 'text-xs h-7'
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
        </div>
        
        {/* Render children if expanded */}
        {!isChild && hasChildren && isExpanded && (
          <div className="flex flex-wrap gap-2 mt-2 ml-6">
            {children.map(child => renderCategoryButton(child, true))}
          </div>
        )}
      </div>
    );
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
      
      {visibleCategories.map((category) => renderCategoryButton(category))}

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
              +{nonEmptyParentCategories.length - VISIBLE_LIMIT} more <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
