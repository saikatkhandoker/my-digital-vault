import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLinks } from '@/context/LinkContext';
import { useToast } from '@/hooks/use-toast';

// Fetch page title from URL
async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.contents) {
      const titleMatch = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch page title:', error);
    return null;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return '';
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function LinkForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const { addLink, linkCategories } = useLinks();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTitle = async () => {
      if (!isValidUrl(url)) {
        return;
      }
      
      setIsFetchingTitle(true);
      try {
        const pageTitle = await fetchPageTitle(url);
        if (pageTitle) {
          setTitle(pageTitle);
        }
      } catch (error) {
        console.error('Failed to fetch title:', error);
      } finally {
        setIsFetchingTitle(false);
      }
    };

    const timeoutId = setTimeout(fetchTitle, 500);
    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({ title: 'Please enter a URL', variant: 'destructive' });
      return;
    }

    if (!isValidUrl(url)) {
      toast({ 
        title: 'Invalid URL', 
        description: 'Please enter a valid URL', 
        variant: 'destructive' 
      });
      return;
    }

    const favicon = getFaviconUrl(url);

    addLink({
      url: url.trim(),
      title: title.trim() || url.trim(),
      description: description.trim() || null,
      favicon,
      categoryId: categoryId || null,
      tags,
    });

    setUrl('');
    setTitle('');
    setDescription('');
    setCategoryId('');
    setTags([]);
    setTagInput('');
    toast({ title: 'Link added successfully!' });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="link-url" className="text-sm font-medium text-foreground">
          Link URL
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="link-url"
            type="url"
            placeholder="Paste any URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="link-title" className="text-sm font-medium text-foreground">
          Title {isFetchingTitle && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
        </label>
        <Input
          id="link-title"
          type="text"
          placeholder={isFetchingTitle ? "Fetching title..." : "Link title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="link-description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          id="link-description"
          placeholder="Optional description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      {/* Category Select */}
      <div className="space-y-2">
        <label htmlFor="link-category" className="text-sm font-medium text-foreground">
          Category
        </label>
        <Select value={categoryId || 'uncategorized'} onValueChange={(value) => setCategoryId(value === 'uncategorized' ? '' : value)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            <SelectItem value="uncategorized">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                Uncategorized
              </div>
            </SelectItem>
            {linkCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: `hsl(${category.color})` }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <label htmlFor="link-tags" className="text-sm font-medium text-foreground">
          Tags
        </label>
        <Input
          id="link-tags"
          type="text"
          placeholder="Type a tag and press Enter..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Link
      </Button>
    </form>
  );
}
