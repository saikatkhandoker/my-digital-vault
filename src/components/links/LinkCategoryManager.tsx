import { useState } from 'react';
import { Plus, Pencil, Trash2, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLinks } from '@/context/LinkContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const colorOptions = [
  '220 70% 50%',   // Blue
  '150 60% 45%',   // Green
  '35 90% 55%',    // Orange
  '340 82% 52%',   // Pink
  '262 83% 58%',   // Purple
  '200 98% 39%',   // Cyan
  '0 84% 60%',     // Red
  '45 93% 47%',    // Yellow
];

export function LinkCategoryManager() {
  const { linkCategories, addLinkCategory, updateLinkCategory, deleteLinkCategory } = useLinks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; color: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);

  const handleAdd = () => {
    if (name.trim()) {
      addLinkCategory({ name: name.trim(), color });
      setName('');
      setColor(colorOptions[0]);
      setIsAddOpen(false);
    }
  };

  const handleEdit = () => {
    if (editingCategory && name.trim()) {
      updateLinkCategory(editingCategory.id, { name: name.trim(), color });
      setEditingCategory(null);
      setName('');
      setColor(colorOptions[0]);
    }
  };

  const openEditDialog = (category: { id: string; name: string; color: string }) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
  };

  const handleDelete = () => {
    if (deletingCategory) {
      deleteLinkCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Link Categories</h3>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        color === c ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: `hsl(${c})` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {linkCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {linkCategories.map((category) => (
            <div
              key={category.id}
              className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
              style={{ 
                backgroundColor: `hsl(${category.color} / 0.15)`,
                color: `hsl(${category.color})`,
              }}
            >
              <div 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: `hsl(${category.color})` }}
              />
              <span>{category.name}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditDialog(category)}
                  className="p-0.5 hover:bg-background/50 rounded"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeletingCategory({ id: category.id, name: category.name })}
                  className="p-0.5 hover:bg-background/50 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === c ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: `hsl(${c})` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? Links in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
