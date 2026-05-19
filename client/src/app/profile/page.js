"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "../utils/formatTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, LogOut, Eye, EyeOff, Loader2, User, Shield, FileText, MessageSquare, Calendar, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // new state for tabs
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      let token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      setLoading(true);

      try {
        // fetching user data
        const userResponse = await axios.get("https://the-blog-zone-server.vercel.app/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = userResponse.data;
        setCurrentUser(userData);
        setFormData({
          name: userData.name || "",
          username: userData.username || "",
          newUsername: userData.username || "",
          newPassword: "",
          confirmPassword: "",
          currentPassword: ""
        });

        // fetching all posts to filter my content cuz i haven't created an endpoint for it yet
        setContentLoading(true);
        const postsResponse = await axios.get("https://the-blog-zone-server.vercel.app/api/blog");
        const allPosts = postsResponse.data;

        // filter my posts (deduplicated)
        const seenPostIds = new Set();
        const filteredPosts = [];

        allPosts.forEach(post => {
          if (post.Blogger.username === userData.username && !seenPostIds.has(post.id)) {
            filteredPosts.push(post);
            seenPostIds.add(post.id);
          }
        });

        // Filter My Comments (deduplicated)
        const seenCommentIds = new Set();
        const filteredComments = [];

        allPosts.forEach(post => {
          if (post.Comments && post.Comments.length > 0) {
            post.Comments.forEach(comment => {
              if (comment.Blogger.username === userData.username && !seenCommentIds.has(comment.id)) {
                filteredComments.push({
                  ...comment,
                  postTitle: post.title,
                  postId: post.id
                });
                seenCommentIds.add(comment.id);
              }
            });
          }
        });

        setMyPosts(filteredPosts);
        setMyComments(filteredComments);

      } catch (error) {
        console.error("Failed to fetch user info or content:", error);
        toast.error("Failed to load profile information.");

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
        }
      } finally {
        setLoading(false);
        setContentLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUsernameChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (/\s/.test(value)) {
      setUsernameError("Spaces are not allowed in username");
    } else {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (/\s/.test(value)) {
      setPasswordError("Spaces are not allowed in password");
      return;
    }

    let currentNewPassword = formData.newPassword;
    let currentConfirmPassword = formData.confirmPassword;

    if (name === "newPassword") {
      currentNewPassword = value;
    } else if (name === "confirmPassword") {
      currentConfirmPassword = value;
    }

    if (currentNewPassword && currentConfirmPassword) {
      if (currentNewPassword !== currentConfirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    if (/\s/.test(formData.newUsername)) {
      setError("Username cannot contain spaces");
      toast.error("Username cannot contain spaces");
      setUpdating(false);
      return;
    }

    let token = localStorage.getItem("token");
    try {
      const trimmedName = formData.name.trim();
      const payload = {
        name: trimmedName
      };

      if (formData.newUsername !== formData.username) {
        payload.newUsername = formData.newUsername;
      }

      const response = await axios.put(
        "https://the-blog-zone-server.vercel.app/api/auth/updateProfile",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      const updatedUser = {
        ...currentUser,
        name: trimmedName,
      };

      if (formData.newUsername !== formData.username) {
        updatedUser.username = formData.newUsername;
      }

      setCurrentUser(updatedUser);

      setFormData(prev => ({
        ...prev,
        name: trimmedName,
        username: updatedUser.username,
        newUsername: updatedUser.username
      }));

      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");

    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMsg = error.response?.data?.message || "Failed to update profile. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      toast.error("New passwords do not match");
      return;
    }

    if (/\s/.test(formData.newPassword)) {
      setError("Password cannot contain spaces");
      toast.error("Password cannot contain spaces");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "https://the-blog-zone-server.vercel.app/api/auth/changePassword",
        {
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess("Password updated successfully!");
      toast.success("Password updated successfully!");
      setFormData(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      console.error("Failed to update password:", error);
      const errorMsg = error.response?.data?.message || "Failed to update password. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-8 flex flex-col items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={logoutLoading}
                  className="gap-2"
                >
                  {logoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to login again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-8">
        <Card className="border-none shadow-md bg-card/50">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
              <p className="text-muted-foreground">@{currentUser?.username}</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2">
                Joined {formatTimeAgo(currentUser?.createdAt || "").split(",")[0].trim()}
              </div>
            </div>
          </CardContent>
        </Card>


        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[450px] mb-8">
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" /> Posts
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Comments
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {contentLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading posts...</p>
              </div>
            ) : myPosts.length > 0 ? (
              myPosts.map(post => (
                <Card
                  key={post.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/${post.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg hover:underline decoration-primary/50 underline-offset-4">
                      {post.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {post.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                You haven't written any posts yet.
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/create-blog">Create your first post</Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {contentLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading comments...</p>
              </div>
            ) : myComments.length > 0 ? (
              myComments.map((comment, index) => (
                <Card
                  key={`${comment.id}-${index}`}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/${comment.postId}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      Commented on <span className="font-medium text-primary hover:underline">{comment.postTitle}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 text-sm">"{comment.content}"</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(comment.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                You haven't made any comments yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">


            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal" className="gap-2">
                  <User className="h-4 w-4" /> Info
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" /> Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your public profile display name and username.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form id="personal-form" onSubmit={updateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newUsername">Username</Label>
                        <Input
                          id="newUsername"
                          name="newUsername"
                          value={formData.newUsername}
                          onChange={handleUsernameChange}
                          placeholder="username"
                          required
                          className={usernameError ? "border-destructive" : ""}
                        />
                        {usernameError && (
                          <p className="text-xs text-destructive">{usernameError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Current username: {currentUser?.username}
                        </p>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t p-6">
                    <Button
                      type="submit"
                      form="personal-form"
                      disabled={updating || !!usernameError}
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form id="security-form" onSubmit={updatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleNewPasswordVisibility}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {passwordError && (
                          <p className="text-xs text-destructive">{passwordError}</p>
                        )}
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t p-6">
                    <Button
                      type="submit"
                      form="security-form"
                      disabled={updating || !!passwordError || !formData.newPassword}
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
