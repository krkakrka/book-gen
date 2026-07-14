import type { Book, Section, StyleId } from "./types";
import { apiFetch } from "./api";

/**
 * API client for /api/books/, backed by Django/DRF (see ARCHITECTURE.md's
 * "frontend/backend models are related but not identical" note). The wire
 * shape is a superset of Book (adds createdAt/updatedAt); bookFromWire
 * narrows it back down at the boundary.
 */

interface BookWire extends Book {
  createdAt: string;
  updatedAt: string;
}

function bookFromWire(wire: BookWire): Book {
  const { id, valueId, value, accent, title, storyId, styleId, sections } = wire;
  return { id, valueId, value, accent, title, storyId, styleId, sections };
}

export interface BookInput {
  valueId: string;
  title: string;
  storyId: string;
  styleId: StyleId;
  sections: Section[];
}

export async function listBooks(): Promise<Book[]> {
  const res = await apiFetch("/api/books/");
  if (!res.ok) throw new Error("Failed to load books.");
  const data: BookWire[] = await res.json();
  return data.map(bookFromWire);
}

export async function getBook(id: string): Promise<Book | null> {
  const res = await apiFetch(`/api/books/${id}/`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load book.");
  return bookFromWire(await res.json());
}

export async function createBook(input: BookInput): Promise<Book> {
  const res = await apiFetch("/api/books/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create book.");
  return bookFromWire(await res.json());
}

export async function updateBook(id: string, input: BookInput): Promise<Book> {
  const res = await apiFetch(`/api/books/${id}/`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update book.");
  return bookFromWire(await res.json());
}

export async function deleteBook(id: string): Promise<void> {
  const res = await apiFetch(`/api/books/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete book.");
}
