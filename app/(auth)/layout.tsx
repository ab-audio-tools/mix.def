export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-[#030303]">
      <div className="relative z-10">{children}</div>
    </div>
  );
}
