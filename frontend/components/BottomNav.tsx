"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-white">
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

function FeedIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11 L12 4 L20 11" />
        <path d="M6 10 L6 20 L18 20 L18 10" />
        </svg>
    );
}

function MapIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21 C12 21 19 14.5 19 9.5 C19 5.9 15.9 3 12 3 C8.1 3 5 5.9 5 9.5 C5 14.5 12 21 12 21 Z" />
        <circle cx="12" cy="9.5" r="2.3" />
        </svg>
    );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}