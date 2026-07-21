export default function robots() {
  const baseUrl = "https://the-blog-zone.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/dashboard", "/login", "/signup", "/profile"],
      disallow: [
        "/admin/",
        "/dashboard/private/",
        "/dashboard/create-blog/",
        "/dashboard/edit-blog/",
        "/api/",
        "/*?*" // Prevent indexing of dynamic query parameters (e.g. search pages if any)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
