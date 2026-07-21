export async function generateMetadata({ params }) {
  const { username } = params;
  
  return {
    title: `${username}'s Profile`,
    description: `Read blogs and posts by ${username} on The Blog Zone.`,
    alternates: {
      canonical: `/profile/${username}`,
    },
    openGraph: {
      title: `${username}'s Profile | The Blog Zone`,
      description: `Read blogs and posts by ${username} on The Blog Zone.`,
      url: `https://the-blog-zone.vercel.app/profile/${username}`,
      type: "profile",
    }
  };
}

export default function UserProfileLayout({ children, params }) {
  const { username } = params;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": username,
      "url": `https://the-blog-zone.vercel.app/profile/${username}`
    }
  };

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {children}
    </>
  );
}
