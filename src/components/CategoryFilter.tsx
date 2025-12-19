import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, videos } = useVideos();

  const getCategoryCount = (categoryId: string | null | 'uncategorized') => {
    if (categoryId === null) return videos.length;
    if (categoryId === 'uncategorized') return videos.filter(v => !v.categoryId).length;
    return videos.filter(v => v.categoryId === categoryId).length;
  };

  const uncategorizedCount = getCategoryCount('uncategorized');

  return (
    <div className="flex flex-wrap gap-2">
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
      
      {categories.map((category) => {
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
    </div>
  );
}