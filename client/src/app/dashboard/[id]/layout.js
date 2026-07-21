import { stripHtml } from "@/utils/stripHtml";

// Dynamically generate metadata based on the specific blog post
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const res = await fetch(`https://the-blog-zone-server.vercel.app/api/blog/${id}`, {
      next: { revalidate: 3600 } // Cache and revalidate every hour
    });
    
    if (res.ok) {
      const blog = await res.json();
      
      // Calculate a rough reading time based on words (assuming ~200 words per min)
      const plainText = stripHtml(blog.content);
      const wordCount = plainText.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200) || 1;

      return {
        title: blog.title,
        description: plainText.substring(0, 155) + (plainText.length > 155 ? "..." : ""),
        alternates: {
          canonical: `/dashboard/${blog.id}`,
        },
        openGraph: {
          title: blog.title,
          description: plainText.substring(0, 155),
          url: `https://the-blog-zone.vercel.app/dashboard/${blog.id}`,
          type: "article",
          publishedTime: blog.createdAt,
          modifiedTime: blog.updatedAt || blog.createdAt,
          authors: [blog.Blogger?.name || "Anonymous"],
          // If you ever add cover images to posts, map it here
          // images: [{ url: blog.coverImage }]
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for blog:", error);
  }

  // Fallback metadata if post not found or error
  return {
    title: "Blog Post",
    description: "Read this blog post on The Blog Zone.",
  };
}

export default async function BlogLayout({ children, params }) {
  const { id } = params;
  let jsonLd = null;

  try {
    const res = await fetch(`https://the-blog-zone-server.vercel.app/api/blog/${id}`, {
      next: { revalidate: 3600 }
    });
    
    if (res.ok) {
      const blog = await res.json();
      
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt,
        "author": {
          "@type": "Person",
          "name": blog.Blogger?.name || "Anonymous",
          "url": `https://the-blog-zone.vercel.app/profile/${blog.Blogger?.username || ''}`
        },
        "publisher": {
          "@type": "Organization",
          "name": "The Blog Zone",
          "logo": {
            "@type": "ImageObject",
            "url": "https://the-blog-zone.vercel.app/favicon.ico"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://the-blog-zone.vercel.app/dashboard/${blog.id}`
        }
      };
    }
  } catch (error) {
    // Fail silently for JSON-LD if API fails
  }

  return (
    <>
      {jsonLd && (
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
      )}
      {children}
    </>
  );
}
