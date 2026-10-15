import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";

export function Poster({ path, title }: { path: string | null | undefined; title: string }) {
  const url = posterUrl(path);
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface">
      {url ? (
        <Image src={url} alt={title} fill sizes="200px" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">
          {title}
        </div>
      )}
    </div>
  );
}

export function year(date: string | Date | null | undefined) {
  if (!date) return "";
  return String(date instanceof Date ? date.getFullYear() : date.slice(0, 4));
}

// Ratings are stored 1–10; each point is half a star.
export function stars(rating: number | null) {
  if (!rating) return "";
  return "★".repeat(Math.floor(rating / 2)) + (rating % 2 ? "½" : "");
}
