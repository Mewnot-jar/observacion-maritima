"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BirdIcon, FeedIcon, MapIcon, PlusIcon } from "@/components/Icons";
import { useAuth } from "@/lib/auth-context";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, openLoginModal } = useAuth();

  const items = [
    { href: "/", label: "Feed", icon: FeedIcon },
    { href: "/mapa", label: "Mapa", icon: MapIcon },
  ];

  function handleNewObservation() {
    if (session) {
      router.push("/nueva");
    } else {
      openLoginModal();
    }
  }

  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col gap-7 border-r border-hairline bg-paper-alt p-6 lg:flex lg:h-screen lg:self-start lg:sticky lg:top-0">
      <Link href="/" className="flex items-center gap-2.5 text-accent">
        <BirdIcon />
        <span className="font-serif-display text-lg font-semibold text-ink">Avistamientos</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                active ? "bg-accent-soft font-semibold text-accent" : "text-ink-muted"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <button
        onClick={handleNewObservation}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-paper"
      >
        <PlusIcon />
        Reportar avistamiento
      </button>
    </aside>
  );
}