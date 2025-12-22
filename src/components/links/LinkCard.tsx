import { useState } from 'react';
import { ExternalLink, Trash2, Pencil, Info } from 'lucide-react';
import { Link } from '@/types/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLinks } from '@/context/LinkContext';
import { LinkEditDialog } from './LinkEditDialog';
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  const { deleteLink, linkCategories } = useLinks();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDescriptionDrawer, setShowDescriptionDrawer] = useState(false);
  const category = linkCategories.find(c => c.id === link.categoryId);

  const handleClick = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteLink(link.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div 
        className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30"
        onClick={handleClick}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {link.favicon && (
              <img 
                src={link.favicon} 
                alt="" 
                className="h-8 w-8 shrink-0 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 font-medium text-card-foreground">
                  {link.title}
                </h3>
                <div className="flex shrink-0 gap-1">
                  {link.description && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDescriptionDrawer(true);
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-1 text-xs text-muted-foreground truncate">
                {link.url}
              </p>

              {category ? (
                <Badge 
                  variant="secondary" 
                  className="mt-2"
                  style={{ 
                    backgroundColor: `hsl(${category.color} / 0.15)`,
                    color: `hsl(${category.color})`,
                  }}
                >
                  {category.name}
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-2 bg-muted-foreground/10 text-muted-foreground">
                  Uncategorized
                </Badge>
              )}

              {link.tags && link.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {link.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <span>Click to open</span>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{link.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LinkEditDialog 
        link={link} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />

      <Drawer open={showDescriptionDrawer} onOpenChange={setShowDescriptionDrawer}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{link.title}</DrawerTitle>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none mt-2"
              dangerouslySetInnerHTML={{ __html: link.description || '' }}
            />
          </DrawerHeader>
          <div className="p-4 pt-0">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowDescriptionDrawer(false)}
            >
              Close
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
