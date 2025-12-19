import { useState } from 'react';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLinks } from '@/context/LinkContext';
import { useToast } from '@/hooks/use-toast';

const PRESET_COLORS = [
  '340 82% 52%',  // Pink
  '200 98% 39%',  // Blue
  '262 83% 58%',  // Purple
  '142 71% 45%',  // Green
  '25 95% 53%',   // Orange
  '47 96% 53%',   // Yellow
  '0 84% 60%',    // Red
  '173 80% 40%',  // Teal
];

export function LinkCategoryManager() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { linkCategories, addLinkCategory, updateLinkCategory, deleteLinkCategory } = useLinks();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: 'Please enter a category name', variant: 'destructive' });
      return;
    }

    if (editingId) {
      updateLinkCategory(editingId, { name: name.trim(), color });
      toast({ title: 'Category updated' });
    } else {
      addLinkCategory({ name: name.trim(), color });
      toast({ title: 'Category created' });
    }

    setName('');
    setColor(PRESET_COLORS[0]);
    setEditingId(null);
  };

  const handleEdit = (category: { id: string; name: string; color: string }) => {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
  };

  const handleDelete = (id: string) => {
    deleteLinkCategory(id);
    toast({ title: 'Category deleted' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Link Categories</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: `hsl(${c})` }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editingId ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Existing Categories</h4>
          {linkCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet</p>
          ) : (
            <div className="space-y-2">
              {linkCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-md border border-border p-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: `hsl(${category.color})` }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
