import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Shield, Calendar, Save, Loader2, Globe, Video, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required').max(100, 'Display name is too long'),
  publicSlug: z.string().trim().min(3, 'Slug must be at least 3 characters').max(50, 'Slug is too long').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional().or(z.literal('')),
});

interface SharingSettings {
  is_public: boolean;
  share_videos: boolean;
  share_links: boolean;
  public_slug: string | null;
}

export default function Profile() {
  const { profile, isAdmin, refreshProfile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Sharing settings
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    is_public: false,
    share_videos: true,
    share_links: true,
    public_slug: null,
  });
  const [publicSlug, setPublicSlug] = useState('');
  const [isLoadingSharing, setIsLoadingSharing] = useState(true);
  const [isSavingSharing, setIsSavingSharing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSharingSettings();
    }
  }, [user?.id]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  const fetchSharingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_public, share_videos, share_links, public_slug')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setSharingSettings({
          is_public: data.is_public || false,
          share_videos: data.share_videos ?? true,
          share_links: data.share_links ?? true,
          public_slug: data.public_slug,
        });
        setPublicSlug(data.public_slug || '');
      }
    } catch (error) {
      console.error('Error fetching sharing settings:', error);
    } finally {
      setIsLoadingSharing(false);
    }
  };

  const handleSave = async () => {
    const validation = profileSchema.safeParse({ displayName });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user?.id);

      if (error) throw error;

      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'profile_update',
        entity_type: 'profile',
        entity_id: user?.id,
        metadata: { display_name: displayName.trim() }
      });

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSharingSettings = async () => {
    const slugValidation = profileSchema.shape.publicSlug.safeParse(publicSlug);
    if (publicSlug && !slugValidation.success) {
      toast.error(slugValidation.error.errors[0].message);
      return;
    }

    setIsSavingSharing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_public: sharingSettings.is_public,
          share_videos: sharingSettings.share_videos,
          share_links: sharingSettings.share_links,
          public_slug: publicSlug.trim() || null,
        })
        .eq('id', user?.id);

      if (error) {
        if (error.message.includes('unique')) {
          toast.error('This URL slug is already taken. Please choose another.');
          return;
        }
        throw error;
      }

      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'sharing_settings_update',
        entity_type: 'profile',
        entity_id: user?.id,
        metadata: { 
          is_public: sharingSettings.is_public,
          share_videos: sharingSettings.share_videos,
          share_links: sharingSettings.share_links,
        }
      });

      setSharingSettings(prev => ({ ...prev, public_slug: publicSlug.trim() || null }));
      toast.success('Sharing settings updated');
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      toast.error('Failed to update sharing settings');
    } finally {
      setIsSavingSharing(false);
    }
  };

  const generateSlug = () => {
    const base = (displayName || profile?.email?.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const random = Math.random().toString(36).substring(2, 6);
    setPublicSlug(`${base}-${random}`);
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/u/${publicSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard');
  };

  const publicUrl = publicSlug ? `${window.location.origin}/u/${publicSlug}` : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <main className="container py-8 flex-1">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and sharing preferences</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your display name and view your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? 'Admin' : 'User'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Joined: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Public Profile & Sharing
              </CardTitle>
              <CardDescription>
                Share your videos and links with anyone via a public link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSharing ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to anyone with the link
                      </p>
                    </div>
                    <Switch
                      checked={sharingSettings.is_public}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, is_public: checked }))
                      }
                    />
                  </div>

                  {sharingSettings.is_public && (
                    <>
                      <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <Label>Share Videos</Label>
                          </div>
                          <Switch
                            checked={sharingSettings.share_videos}
                            onCheckedChange={(checked) => 
                              setSharingSettings(prev => ({ ...prev, share_videos: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <Label>Share Links</Label>
                          </div>
                          <Switch
                            checked={sharingSettings.share_links}
                            onCheckedChange={(checked) => 
                              setSharingSettings(prev => ({ ...prev, share_links: checked }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="publicSlug">Public URL Slug</Label>
                        <div className="flex gap-2">
                          <Input
                            id="publicSlug"
                            value={publicSlug}
                            onChange={(e) => setPublicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="your-unique-slug"
                            maxLength={50}
                          />
                          <Button variant="outline" onClick={generateSlug} type="button">
                            Generate
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Only lowercase letters, numbers, and hyphens allowed
                        </p>
                      </div>

                      {publicUrl && (
                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                          <Label>Your Public URL</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={publicUrl}
                              readOnly
                              className="bg-background"
                            />
                            <Button variant="outline" size="icon" onClick={copyPublicUrl}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <Button onClick={handleSaveSharingSettings} disabled={isSavingSharing} className="w-full sm:w-auto">
                    {isSavingSharing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Sharing Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Your content summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountStats userId={user?.id} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AccountStats({ userId }: { userId?: string }) {
  const [stats, setStats] = useState({ videos: 0, links: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchStats = async () => {
      try {
        const [videosRes, linksRes] = await Promise.all([
          supabase.from('videos').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('links').select('id', { count: 'exact' }).eq('user_id', userId),
        ]);
        
        setStats({
          videos: videosRes.count || 0,
          links: linksRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-2xl font-bold">{stats.videos}</p>
        <p className="text-sm text-muted-foreground">Videos saved</p>
      </div>
      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-2xl font-bold">{stats.links}</p>
        <p className="text-sm text-muted-foreground">Links saved</p>
      </div>
    </div>
  );
}
