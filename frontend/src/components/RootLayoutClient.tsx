'use client';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <main className="flex-1">{children}</main>
    </div>
  );
}
