import type { Book } from "./types";
import { STORAGE_KEY, seedBooks } from "./data";

/**
 * localStorage-backed persistence (no API yet — see design/README Production Notes).
 * Keep the Book shape stable; it's the contract a future API must honor.
 */

export function loadBooks(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Book[];
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function persistBooks(books: Book[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    /* ignore */
  }
}

/** Load books, seeding the 3 sample books on first ever load. */
export function loadOrSeedBooks(): Book[] {
  const existing = loadBooks();
  if (existing.length > 0) return existing;
  const seeded = seedBooks();
  persistBooks(seeded);
  return seeded;
}

export function upsertBook(books: Book[], book: Book): Book[] {
  const exists = books.some((b) => b.id === book.id);
  return exists ? books.map((b) => (b.id === book.id ? book : b)) : [...books, book];
}

export function deleteBookById(books: Book[], id: string): Book[] {
  return books.filter((b) => b.id !== id);
}
