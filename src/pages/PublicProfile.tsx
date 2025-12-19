import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Video, Link as LinkIcon, ExternalLink, User, Globe, Lock } from 'lucide-react';
import { Footer } from '@/components/Footer';

interface PublicProfile {
  id: string;
  display_name: string | null;
  is_public: boolean;
  share_videos: boolean;
  share_links: boolean;
}

interface PublicVideo {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  created_at: string;
  category_name?: string;
  category_color?: string;
}

interface PublicLink {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  tags: string[] | null;
  created_at: string;
  category_name?: string;
  category_color?: string;
}

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [videos, setVideos] = useState<PublicVideo[]>([]);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  const fetchPublicProfile = async () => {
    try {
      // Fetch public profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, is_public, share_videos, share_links')
        .eq('public_slug', slug)
        .eq('is_public', true)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found or is private');
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch videos if sharing is enabled
      if (profileData.share_videos) {
        const { data: videosData } = await supabase
          .from('videos')
          .select('id, title, url, platform, thumbnail_url, tags, created_at, category_id')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        // Fetch video categories
        const { data: videoCategories } = await supabase
          .from('video_categories')
          .select('id, name, color')
          .eq('user_id', profileData.id);

        const videosWithCategories = (videosData || []).map((video: any) => {
          const category = videoCategories?.find((c: any) => c.id === video.category_id);
          return {
            ...video,
            category_name: category?.name,
            category_color: category?.color,
          };
        });

        setVideos(videosWithCategories);
      }

      // Fetch links if sharing is enabled
      if (profileData.share_links) {
        const { data: linksData } = await supabase
          .from('links')
          .select('id, title, url, favicon, tags, created_at, category_id')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        // Fetch link categories
        const { data: linkCategories } = await supabase
          .from('link_categories')
          .select('id, name, color')
          .eq('user_id', profileData.id);

        const linksWithCategories = (linksData || []).map((link: any) => {
          const category = linkCategories?.find((c: any) => c.id === link.category_id);
          return {
            ...link,
            category_name: category?.name,
            category_color: category?.color,
          };
        });

        setLinks(linksWithCategories);
      }
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h1 className="text-2xl font-bold">Profile Not Found</h1>
              <p className="text-muted-foreground">
                This profile doesn't exist or is set to private.
              </p>
              <Button asChild>
                <Link to="/">Go to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const showVideos = profile.share_videos && videos.length > 0;
  const showLinks = profile.share_links && links.length > 0;
  const defaultTab = showVideos ? 'videos' : showLinks ? 'links' : 'videos';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Manager
          </Link>
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="container py-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.display_name || 'Anonymous'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Public Profile</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {!showVideos && !showLinks ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                This user hasn't shared any content yet.
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={defaultTab} className="space-y-6">
              <TabsList>
                {profile.share_videos && (
                  <TabsTrigger value="videos" className="gap-2">
                    <Video className="h-4 w-4" />
                    Videos ({videos.length})
                  </TabsTrigger>
                )}
                {profile.share_links && (
                  <TabsTrigger value="links" className="gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Links ({links.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {profile.share_videos && (
                <TabsContent value="videos">
                  {videos.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No videos shared yet.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <a
                          key={video.id}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                            <div className="aspect-video bg-muted relative">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {video.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                {video.platform && (
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {video.platform}
                                  </Badge>
                                )}
                                {video.category_name && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs"
                                    style={{ 
                                      backgroundColor: video.category_color ? `hsl(${video.category_color} / 0.2)` : undefined 
                                    }}
                                  >
                                    {video.category_name}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {profile.share_links && (
                <TabsContent value="links">
                  {links.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No links shared yet.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <Card className="p-4 transition-shadow hover:shadow-lg">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                {link.favicon ? (
                                  <img
                                    src={link.favicon}
                                    alt=""
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                  {link.title}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {new URL(link.url).hostname}
                                </p>
                                {link.category_name && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs mt-2"
                                    style={{ 
                                      backgroundColor: link.category_color ? `hsl(${link.category_color} / 0.2)` : undefined 
                                    }}
                                  >
                                    {link.category_name}
                                  </Badge>
                                )}
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          </Card>
                        </a>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
