import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Prefix a public asset path with the Next.js basePath (e.g. for GitHub Pages). */
export function assetPath(path: string): string {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    if (!base || path.startsWith('http')) return path;
    return `${base}${path}`;
}
