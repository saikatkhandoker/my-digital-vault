import { useState, useRef } from 'react';
import { Download, Upload, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiConfig } from '@/lib/api-config';

interface VideoData {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  channelName: string | null;
  channelUrl: string | null;
  categoryId: string | null;
  tags: string[];
}

interface LinkData {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  categoryId: string | null;
  tags: string[];
}

interface CategoryData {
  id: string;
  name: string;
  color: string;
}

interface ExportData {
  version: string;
  exportedAt: string;
  videos: VideoData[];
  videoCategories: CategoryData[];
  links: LinkData[];
  linkCategories: CategoryData[];
}

export function DataManagementDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [stats, setStats] = useState<{ videos: number; links: number; videoCategories: number; linkCategories: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const [videosRes, linksRes, videoCatsRes, linkCatsRes] = await Promise.all([
        fetch(apiConfig.getVideosUrl('getVideos'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getLinks'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getCategories'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getLinkCategories'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
      ]);
      
      const videosData = await videosRes.json();
      const linksData = await linksRes.json();
      const videoCatsData = await videoCatsRes.json();
      const linkCatsData = await linkCatsRes.json();
      
      setStats({
        videos: videosData.videos?.length || 0,
        links: linksData.links?.length || 0,
        videoCategories: videoCatsData.categories?.length || 0,
        linkCategories: linkCatsData.categories?.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchStats();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [videosRes, linksRes, videoCatsRes, linkCatsRes] = await Promise.all([
        fetch(apiConfig.getVideosUrl('getVideos'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getLinks'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getCategories'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getLinkCategories'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
      ]);
      
      const videosData = await videosRes.json();
      const linksData = await linksRes.json();
      const videoCatsData = await videoCatsRes.json();
      const linkCatsData = await linkCatsRes.json();

      const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        videos: videosData.videos || [],
        videoCategories: videoCatsData.categories || [],
        links: linksData.links || [],
        linkCategories: linkCatsData.categories || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Data exported successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (!data.version) {
        throw new Error('Invalid backup file format');
      }

      // Fetch existing data to check for duplicates
      const [videosRes, linksRes, videoCatsRes, linkCatsRes] = await Promise.all([
        fetch(apiConfig.getVideosUrl('getVideos'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getLinks'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getCategories'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
        fetch(apiConfig.getVideosUrl('getLinkCategories'), { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
      ]);

      const existingVideos = (await videosRes.json()).videos || [];
      const existingLinks = (await linksRes.json()).links || [];
      const existingVideoCats = (await videoCatsRes.json()).categories || [];
      const existingLinkCats = (await linkCatsRes.json()).categories || [];

      // Create sets of existing URLs and names for quick lookup
      const existingVideoUrls = new Set(existingVideos.map((v: any) => v.url));
      const existingLinkUrls = new Set(existingLinks.map((l: any) => l.url));
      const existingVideoCatNames = new Set(existingVideoCats.map((c: any) => c.name.toLowerCase()));
      const existingLinkCatNames = new Set(existingLinkCats.map((c: any) => c.name.toLowerCase()));

      let imported = { videos: 0, links: 0, videoCategories: 0, linkCategories: 0 };
      let skipped = { videos: 0, links: 0, videoCategories: 0, linkCategories: 0 };

      // Import video categories (skip duplicates by name)
      for (const cat of data.videoCategories || []) {
        if (existingVideoCatNames.has(cat.name.toLowerCase())) {
          skipped.videoCategories++;
          continue;
        }
        await fetch(apiConfig.getVideosUrl('addCategory'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cat.name, color: cat.color }),
        });
        imported.videoCategories++;
      }

      // Import link categories (skip duplicates by name)
      for (const cat of data.linkCategories || []) {
        if (existingLinkCatNames.has(cat.name.toLowerCase())) {
          skipped.linkCategories++;
          continue;
        }
        await fetch(apiConfig.getVideosUrl('addLinkCategory'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cat.name, color: cat.color }),
        });
        imported.linkCategories++;
      }

      // Import videos (skip duplicates by URL)
      for (const video of data.videos || []) {
        if (existingVideoUrls.has(video.url)) {
          skipped.videos++;
          continue;
        }
        await fetch(apiConfig.getVideosUrl('addVideo'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: video.title,
            url: video.url,
            thumbnail: video.thumbnailUrl,
            channelName: video.channelName,
            channelUrl: video.channelUrl,
            categoryId: null,
            tags: video.tags,
          }),
        });
        imported.videos++;
      }

      // Import links (skip duplicates by URL)
      for (const link of data.links || []) {
        if (existingLinkUrls.has(link.url)) {
          skipped.links++;
          continue;
        }
        await fetch(apiConfig.getVideosUrl('addLink'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: link.title,
            url: link.url,
            favicon: link.favicon,
            categoryId: null,
            tags: link.tags,
          }),
        });
        imported.links++;
      }

      const totalImported = imported.videos + imported.links + imported.videoCategories + imported.linkCategories;
      const totalSkipped = skipped.videos + skipped.links + skipped.videoCategories + skipped.linkCategories;

      toast({ 
        title: 'Import complete!',
        description: `Imported ${totalImported} items${totalSkipped > 0 ? `, skipped ${totalSkipped} duplicates` : ''}. Refresh to see changes.`
      });
      setOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: 'Please make sure you selected a valid backup file.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <FileJson className="h-4 w-4" />
          <span className="sr-only">Import/Export Data</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import / Export Data</DialogTitle>
          <DialogDescription>
            Backup your data or restore from a previous backup.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-medium">Current Data</h4>
              {stats ? (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Videos: {stats.videos}</div>
                  <div>Video Categories: {stats.videoCategories}</div>
                  <div>Links: {stats.links}</div>
                  <div>Link Categories: {stats.linkCategories}</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
            </div>
            <Button onClick={handleExport} className="w-full" disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export All Data'}
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-medium">Restore from Backup</h4>
              <p className="text-sm text-muted-foreground">
                Select a JSON backup file to import. This will add the data from the backup to your existing data.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isImporting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Select Backup File'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}