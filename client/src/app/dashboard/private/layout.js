export const metadata = {
  title: "Private Dashboard",
  description: "Your private encrypted posts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivateDashboardLayout({ children }) {
  return <>{children}</>;
}
