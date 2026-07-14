"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import StoryPage from "@/components/StoryPage";
import ReaderHeader from "@/components/ReaderHeader";
import ReaderControls from "@/components/ReaderControls";
import PageDots from "@/components/PageDots";
import type { Book } from "@/lib/types";
import { getBook } from "@/lib/storage";
import { useRequireSession } from "@/lib/useRequireSession";
import { COLORS } from "@/lib/tokens";

export default function ReaderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const ready = useRequireSession();
  const [book, setBook] = useState<Book | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!ready) return;
    getBook(id).then(setBook);
    setPageIndex(0);
  }, [ready, id]);

  if (!ready) return null;

  if (!book) {
    return (
      <div data-testid="reader-view" style={{ minHeight: "100vh", background: COLORS.readerCanvas, padding: 40 }}>
        <p>Book not found.</p>
      </div>
    );
  }

  const totalPages = book.sections.length;
  const isCover = pageIndex === 0;
  const isLastPage = pageIndex === totalPages;
  const totalDots = totalPages + 1;

  const pageIndicator = isCover ? "Cover" : `Page ${pageIndex} / ${totalPages}`;

  return (
    <div
      data-testid="reader-view"
      style={{ minHeight: "100vh", background: COLORS.readerCanvas, display: "flex", flexDirection: "column" }}
    >
      <ReaderHeader
        title={book.title}
        value={book.value}
        pageIndicator={pageIndicator}
        onBack={() => router.push("/library")}
      />

      <ReaderControls
        isCover={isCover}
        isLastPage={isLastPage}
        onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
        onNext={() => setPageIndex((i) => Math.min(totalPages, i + 1))}
      >
        {isCover ? (
          <StoryPage kind="cover" title={book.title} value={book.value} accent={book.accent} variant={book.styleId} />
        ) : (
          <StoryPage
            kind="page"
            imageDesc={book.sections[pageIndex - 1].imageDesc}
            text={book.sections[pageIndex - 1].text}
            variant={book.styleId}
            pageNum={pageIndex}
            pageTotal={totalPages}
          />
        )}
      </ReaderControls>

      <PageDots total={totalDots} active={pageIndex} onSelect={setPageIndex} />
    </div>
  );
}
