'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Trash2, Ban, ShieldAlert, LogOut, CheckCircle2, Search, ChevronDown } from "lucide-react";
import { toast } from 'sonner';
import { stripHtml } from "@/utils/stripHtml";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postSearchField, setPostSearchField] = useState('title');

  const router = useRouter();

  const fetchAdminData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const [usersRes, postsRes] = await Promise.all([
        axios.get('https://the-blog-zone-server.vercel.app/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://the-blog-zone-server.vercel.app/api/admin/posts', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      toast.error('Session expired or unauthorized');
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBan = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`https://the-blog-zone-server.vercel.app/api/admin/users/${userId}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: res.data.isBanned } : u));
    } catch (error) {
      toast.error('Failed to toggle ban status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user and ALL their posts?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      // Refetch everything since posts might have been deleted too
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://the-blog-zone-server.vercel.app/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Post deleted successfully');
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPosts = posts.filter(post => {
    if (!postSearchQuery) return true;
    const query = postSearchQuery.toLowerCase();
    switch (postSearchField) {
      case "title":
        return post.title.toLowerCase().includes(query);
      case "content":
        return stripHtml(post.content || '').toLowerCase().includes(query);
      case "author":
        return post.Blogger?.name?.toLowerCase().includes(query) || post.Blogger?.username?.toLowerCase().includes(query);
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage users and public content</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Users */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold flex items-center justify-between">
              Users <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">{users.length}</span>
            </h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <Card key={user.id} className={`border-l-4 ${user.isBanned ? 'border-l-destructive' : 'border-l-green-500'}`}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex justify-between items-start">
                      <span className="truncate">{user.name}</span>
                      {user.isBanned ? (
                        <span className="text-xs font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Banned</span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleBan(user.id)}
                        className={user.isBanned ? 'text-green-500 hover:text-green-600' : 'text-orange-500 hover:text-orange-600'}
                      >
                        {user.isBanned ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No users found.</p>}
            </div>
          </div>

          {/* Center Column: Public Posts */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center justify-between">
              Public Posts <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">{posts.length}</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={postSearchQuery}
                  onChange={(e) => setPostSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[120px] justify-between">
                    <span className="capitalize">{postSearchField}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPostSearchField("title")}>Title</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostSearchField("content")}>Content</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostSearchField("author")}>Author</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {post.thumbnail && (
                      <div className="sm:w-48 h-32 sm:h-auto shrink-0 bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col">
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        By @{post.Blogger?.username} on {new Date(post.createdAt).toLocaleDateString()}
                      </p>

                      <div className="mt-auto flex justify-end">
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Remove Content
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No public posts found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
