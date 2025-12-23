import { useState } from 'react';
import { Plus, Pencil, Trash2, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideos } from '@/context/VideoContext';
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

export function CategoryManager() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { categories, addCategory, updateCategory, deleteCategory, getParentCategories } = useVideos();
  const { toast } = useToast();

  const parentCategories = getParentCategories();
  const subcategories = (parentCatId: string) => categories.filter(c => c.parentId === parentCatId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: 'Please enter a category name', variant: 'destructive' });
      return;
    }

    if (editingId) {
      updateCategory(editingId, name.trim(), color, parentId);
      toast({ title: 'Category updated' });
    } else {
      addCategory(name.trim(), color, parentId);
      toast({ title: 'Category created' });
    }

    resetForm();
  };

  const handleEdit = (category: { id: string; name: string; color: string; parentId: string | null }) => {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
    setParentId(category.parentId);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast({ title: 'Category deleted' });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setParentId(null);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
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
            <label className="text-sm font-medium">Parent Category (optional)</label>
            <Select 
              value={parentId || 'none'} 
              onValueChange={(value) => setParentId(value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top-level category)</SelectItem>
                {parentCategories
                  .filter(c => c.id !== editingId) // Don't allow category to be its own parent
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: `hsl(${category.color})` }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
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
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet</p>
          ) : (
            <div className="space-y-2">
              {parentCategories.map((category) => (
                <div key={category.id}>
                  {/* Parent Category */}
                  <div className="flex items-center justify-between rounded-md border border-border p-2">
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
                  
                  {/* Subcategories */}
                  {subcategories(category.id).map((subcat) => (
                    <div
                      key={subcat.id}
                      className="flex items-center justify-between rounded-md border border-border p-2 ml-6 mt-1 bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: `hsl(${subcat.color})` }}
                        />
                        <span className="text-sm">{subcat.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(subcat)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(subcat.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}