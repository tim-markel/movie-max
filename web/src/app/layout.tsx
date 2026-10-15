import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { UserMenu } from "@/components/UserMenu";
import { getCurrentUser, isManager, roleLabel } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "movie-max",
  description: "Track the movies you've seen and find new ones.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-white/10">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              movie<span className="text-accent">max</span>
            </Link>
            {user && (
              <>
                <Link href="/search" className="nav-link">Search</Link>
                <Link href="/watched" className="nav-link">Watched</Link>
                <Link href="/watchlist" className="nav-link">Watchlist</Link>
              </>
            )}
            <div className="ml-auto flex items-center gap-4 text-sm">
              {user ? (
                <UserMenu username={user.username} role={roleLabel(user)} canManage={isManager(user)} />
              ) : (
                <>
                  <Link href="/login" className="nav-link">Log in</Link>
                  <Link href="/signup" className="btn">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
