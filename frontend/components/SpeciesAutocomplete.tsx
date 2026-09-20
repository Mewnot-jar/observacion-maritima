"use client";

import { useEffect, useRef, useState } from "react";

type Species = {
    id: string;
    common_name: string;
    scientific_name: string | null;
    category: string;
};

export function SpeciesAutocomplete({
    value,
    onSelect,
}: {
    value: Species | null;
    onSelect: (species: Species | null) => void;
}) {
    const [query, setQuery] = useState(value?.common_name ?? "");
    const [results, setResults] = useState<Species[]>([]);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (value && query === value.common_name) return;

        if (debounceRef.current) window.clearTimeout(debounceRef.current);

        debounceRef.current = window.setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/species?q=${encodeURIComponent(query)}`
            );
            if (res.ok) {
                setResults(await res.json());
                setOpen(true);
            }
        }, 300);

        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [query, value]);

    return(
        <div className="relative">
            <input
                type="text"
                placeholder="Buscar especie…"
                value={query}
                onChange={(e) => {
                setQuery(e.target.value);
                onSelect(null);
                }}
                onFocus={() => results.length > 0 && setOpen(true)}
                className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-ink"
            />

            {open && results.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded-lg border border-hairline bg-white shadow-lg">
                {results.map((s) => (
                    <li key={s.id}>
                    <button
                        type="button"
                        onClick={() => {
                        onSelect(s);
                        setQuery(s.common_name);
                        setOpen(false);
                        }}
                        className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-paper-alt"
                    >
                        <span className="text-sm text-ink">{s.common_name}</span>
                        {s.scientific_name && (
                        <span className="text-xs italic text-ink-faint">{s.scientific_name}</span>
                        )}
                    </button>
                    </li>
                ))}
                </ul>
            )}
        </div>
    );
}