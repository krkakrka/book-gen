import StoryPage from "@/components/StoryPage";
import type { Book } from "@/lib/types";
import { styleName } from "@/lib/data";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface BookCardProps {
  book: Book;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BookCard({ book, onOpen, onEdit, onDelete }: BookCardProps) {
  return (
    <div data-testid="book-card" data-book-id={book.id}>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div
          data-testid="book-cover"
          onClick={() => onOpen(book.id)}
          style={{ height: 330, cursor: "pointer", transition: "transform 0.12s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <StoryPage kind="cover" title={book.title} value={book.value} accent={book.accent} variant={book.styleId} />
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
          <button
            data-testid="edit-book"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book.id);
            }}
            style={{
              width: 36,
              height: 36,
              background: COLORS.surface,
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 16,
              boxShadow: SHADOW(3),
            }}
            aria-label="Edit book"
          >
            ✎
          </button>
          <button
            data-testid="delete-book"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book.id);
            }}
            style={{
              width: 36,
              height: 36,
              background: COLORS.surface,
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 16,
              boxShadow: SHADOW(3),
            }}
            aria-label="Delete book"
          >
            🗑
          </button>
        </div>
      </div>
      <p
        data-testid="book-meta"
        style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.mutedText, margin: 0, textAlign: "center" }}
      >
        {book.sections.length} pages · {styleName(book.styleId)}
      </p>
    </div>
  );
}
