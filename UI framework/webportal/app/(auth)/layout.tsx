export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="portal-bg relative min-h-screen overflow-hidden">
      <div className="portal-grid pointer-events-none absolute inset-0"></div>
      <div className="portal-orb pointer-events-none absolute -left-40 top-10 h-96 w-96"></div>
      <div className="portal-orb pointer-events-none absolute -right-32 bottom-10 h-[28rem] w-[28rem]"></div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
