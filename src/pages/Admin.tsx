import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Trash2, Loader2, Video, Link as LinkIcon, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { AdminVideoTable } from '@/components/admin/AdminVideoTable';
import { AdminLinkTable } from '@/components/admin/AdminLinkTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  role: 'admin' | 'user';
  videoCount: number;
  linkCount: number;
}

interface VideoWithUser {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  thumbnail_url: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
  created_at: string;
  tags: string[] | null;
}

interface LinkWithUser {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
  created_at: string;
  tags: string[] | null;
}

export default function Admin() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [allVideos, setAllVideos] = useState<VideoWithUser[]>([]);
  const [allLinks, setAllLinks] = useState<LinkWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchUsers(), fetchAllVideos(), fetchAllLinks()]);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('user_id');

      if (videosError) throw videosError;

      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('user_id');

      if (linksError) throw linksError;

      const usersWithRoles = (profiles || []).map((profile: any) => {
        const userRole = roles?.find((r: any) => r.user_id === profile.id);
        const videoCount = videos?.filter((v: any) => v.user_id === profile.id).length || 0;
        const linkCount = links?.filter((l: any) => l.user_id === profile.id).length || 0;

        return {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: userRole?.role || 'user',
          videoCount,
          linkCount,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchAllVideos = async () => {
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name');

      if (profilesError) throw profilesError;

      const videosWithUsers = (videos || []).map((video: any) => {
        const owner = profiles?.find((p: any) => p.id === video.user_id);
        return {
          ...video,
          user_email: owner?.email || 'Unknown',
          user_name: owner?.display_name,
        };
      });

      setAllVideos(videosWithUsers);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    }
  };

  const fetchAllLinks = async () => {
    try {
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name');

      if (profilesError) throw profilesError;

      const linksWithUsers = (links || []).map((link: any) => {
        const owner = profiles?.find((p: any) => p.id === link.user_id);
        return {
          ...link,
          user_email: owner?.email || 'Unknown',
          user_name: owner?.display_name,
        };
      });

      setAllLinks(linksWithUsers);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot delete yourself");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
      // Refresh videos and links as they may have been deleted
      fetchAllVideos();
      fetchAllLinks();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <main className="container py-8 flex-1">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, videos, and links</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  Users ({users.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2">
                  <Video className="h-4 w-4" />
                  Videos ({allVideos.length})
                </TabsTrigger>
                <TabsTrigger value="links" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Links ({allLinks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      View all users, change roles, and manage accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Videos</TableHead>
                          <TableHead>Links</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{u.display_name || 'No name'}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={u.role}
                                onValueChange={(value: 'admin' | 'user') => updateUserRole(u.id, value)}
                                disabled={u.id === user?.id || updatingUserId === u.id}
                              >
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3" />
                                      User
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-3 w-3" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{u.videoCount}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{u.linkCount}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {u.id !== user?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete {u.email} and all their data ({u.videoCount} videos, {u.linkCount} links). This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteUser(u.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      All Videos
                    </CardTitle>
                    <CardDescription>
                      View and manage all users' videos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminVideoTable videos={allVideos} onRefresh={fetchAllVideos} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="links">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      All Links
                    </CardTitle>
                    <CardDescription>
                      View and manage all users' links
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminLinkTable links={allLinks} onRefresh={fetchAllLinks} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
