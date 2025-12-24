import { useState } from 'react';
import { Plus, Pencil, Trash2, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideos } from '@/context/VideoContext';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types/video';

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
  const { categories, addCategory, updateCategory, deleteCategory } = useVideos();
  const { toast } = useToast();

  // Get parent categories (categories without parents)
  const parentCategories = categories.filter(c => !c.parentId);

  // Build hierarchical structure
  const getCategoryWithChildren = (category: Category) => {
    const children = categories.filter(c => c.parentId === category.id);
    return { ...category, children };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: 'Please enter a category name', variant: 'destructive' });
      return;
    }

    // Prevent circular reference
    if (editingId && parentId === editingId) {
      toast({ title: 'A category cannot be its own parent', variant: 'destructive' });
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

  const handleEdit = (category: Category) => {
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

  // Get available parent options (exclude self and own children when editing)
  const getAvailableParents = () => {
    if (!editingId) return parentCategories;
    
    // Exclude self and any category that has editingId as parent
    return categories.filter(c => 
      c.id !== editingId && 
      c.parentId !== editingId && 
      !c.parentId // Only show top-level categories as parent options
    );
  };

  const renderCategoryItem = (category: Category, isChild = false) => {
    const children = categories.filter(c => c.parentId === category.id);
    
    return (
      <div key={category.id}>
        <div
          className={`flex items-center justify-between rounded-md border border-border p-2 ${isChild ? 'ml-6 border-l-2' : ''}`}
          style={isChild ? { borderLeftColor: `hsl(${category.color})` } : undefined}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: `hsl(${category.color})` }}
            />
            <span className="text-sm font-medium">
              {isChild && <ChevronRight className="inline h-3 w-3 mr-1 text-muted-foreground" />}
              {category.name}
            </span>
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
        {children.map(child => renderCategoryItem(child, true))}
      </div>
    );
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
            <label className="text-sm font-medium">Parent Category (Optional)</label>
            <Select 
              value={parentId || 'none'} 
              onValueChange={(value) => setParentId(value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {getAvailableParents().map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: `hsl(${cat.color})` }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
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
              {parentCategories.map((category) => renderCategoryItem(category))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
