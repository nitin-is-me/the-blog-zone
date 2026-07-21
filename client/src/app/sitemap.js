export default async function sitemap() {
  const baseUrl = "https://the-blog-zone.vercel.app";

  // Core static routes
  const routes = [
    "",
    "/login",
    "/signup",
    "/dashboard",
    "/profile"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch dynamic public blogs from your production API
  let blogRoutes = [];
  try {
    const res = await fetch("https://the-blog-zone-server.vercel.app/api/blog/all");
    if (res.ok) {
      const blogs = await res.json();
      blogRoutes = blogs.map((blog) => ({
        url: `${baseUrl}/dashboard/${blog.id}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch blogs for sitemap:", error);
  }

  return [...routes, ...blogRoutes];
}
