"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeedIcon, MapIcon, PlusIcon } from "@/components/Icons";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-white lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2.5">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
            pathname === "/" ? "text-accent" : "text-ink-faint"
          }`}
        >
          <FeedIcon />
          <span className="text-[10px]">Feed</span>
        </Link>

        <Link
          href="/nueva"
          aria-label="Reportar avistamiento"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-paper shadow-lg shadow-accent/30"
        >
          <PlusIcon />
        </Link>

        <Link
          href="/mapa"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
            pathname === "/mapa" ? "text-accent" : "text-ink-faint"
          }`}
        >
          <MapIcon />
          <span className="text-[10px]">Mapa</span>
        </Link>
      </div>
    </nav>
  );
}