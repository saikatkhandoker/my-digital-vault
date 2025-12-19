import { useState, useEffect } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';
import { Link } from '@/types/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLinks } from '@/context/LinkContext';

interface LinkEditDialogProps {
  link: Link;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkEditDialog({ link, open, onOpenChange }: LinkEditDialogProps) {
  const { updateLink } = useLinks();
  const [url, setUrl] = useState(link.url);
  const [title, setTitle] = useState(link.title);
  const [tags, setTags] = useState<string[]>(link.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(link.url);
      setTitle(link.title);
      setTags(link.tags || []);
      setTagInput('');
    }
  }, [open, link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await updateLink(link.id, {
      url: url.trim(),
      title: title.trim() || url.trim(),
      tags,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-link-url" className="text-sm font-medium text-foreground">
              URL
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="edit-link-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-link-title" className="text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              id="edit-link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-link-tags" className="text-sm font-medium text-foreground">
              Tags
            </label>
            <Input
              id="edit-link-tags"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
