import "../(protected)/admin.css";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="admin-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {children}
    </div>
  );
}
