"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BookCard from "@/components/BookCard";
import CreateTile from "@/components/CreateTile";
import type { Book } from "@/lib/types";
import { deleteBook, listBooks } from "@/lib/storage";
import { logout } from "@/lib/api";
import { useRequireSession } from "@/lib/useRequireSession";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

const USER_NAME = "Maya";

export default function LibraryPage() {
  const router = useRouter();
  const ready = useRequireSession();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!ready) return;
    listBooks().then(setBooks);
  }, [ready]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this story from your library?")) return;
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  if (!ready) return null;

  return (
    <div data-testid="library-view" style={{ minHeight: "100vh", background: COLORS.canvas }}>
      <AppHeader userName={USER_NAME} onSignOut={handleSignOut} />

      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(24px,3.5vw,44px)" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <p
              data-testid="user-eyebrow"
              style={{
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.mutedText,
                margin: "0 0 6px",
              }}
            >
              Welcome back, {USER_NAME}
            </p>
            <h1 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(28px,4vw,40px)", margin: 0 }}>
              Your library
            </h1>
          </div>
          <button
            data-testid="new-story-button"
            onClick={() => router.push("/create")}
            style={{
              padding: "12px 24px",
              background: COLORS.pink,
              color: COLORS.surface,
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 14,
              fontFamily: FONTS.display,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: SHADOW(4),
            }}
          >
            + New story
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: 24,
          }}
        >
          <CreateTile onClick={() => router.push("/create")} />

          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onOpen={(id) => router.push(`/book/${id}`)}
              onEdit={(id) => router.push(`/edit/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
