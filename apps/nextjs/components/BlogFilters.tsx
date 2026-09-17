"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function BlogFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const sort = searchParams.get("sort") || "asc";
    const page = searchParams.get("page") || "1";

    function toggleSort() {
        const newSort = sort === "asc" ? "desc" : "asc";
        // vytvoríme nový query string
        const params = new URLSearchParams(searchParams);
        params.set("sort", newSort);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div>
            <p>Aktuálne triedenie: {sort}</p>
            <p>Aktuálna stránka: {page}</p>
            <button
                onClick={toggleSort}
                className="px-3 py-1 bg-blue-600 text-white rounded"
            >
                Prepni sort
            </button>
        </div>
    );
}