"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WizardHeader from "@/components/wizard/WizardHeader";
import WizardFooter from "@/components/wizard/WizardFooter";
import ValueStep from "@/components/wizard/ValueStep";
import StoryStep from "@/components/wizard/StoryStep";
import PagesStep from "@/components/wizard/PagesStep";
import StyleStep from "@/components/wizard/StyleStep";
import ReviewStep from "@/components/wizard/ReviewStep";
import type { Book, Section, StyleId } from "@/lib/types";
import { buildStories, valueById } from "@/lib/data";
import { createBook, getBook, updateBook, type BookInput } from "@/lib/storage";
import { useRequireSession } from "@/lib/useRequireSession";
import { COLORS } from "@/lib/tokens";

interface Draft {
  valueId: string | null;
  value: string;
  accent: string;
  title: string;
  storyId: string | null;
  styleId: StyleId | null;
  sections: Section[];
}

const emptyDraft = (): Draft => ({
  valueId: null,
  value: "",
  accent: "",
  title: "",
  storyId: null,
  styleId: null,
  sections: [],
});

function draftFromBook(book: Book): Draft {
  return {
    valueId: book.valueId,
    value: book.value,
    accent: book.accent,
    title: book.title,
    storyId: book.storyId,
    styleId: book.styleId,
    sections: book.sections.map((s) => ({ ...s })),
  };
}

function isStepValid(step: number, draft: Draft): boolean {
  switch (step) {
    case 1:
      return draft.valueId !== null;
    case 2:
      return draft.storyId !== null;
    case 3:
      return draft.sections.length >= 1 && draft.sections.every((s) => s.text.trim() !== "");
    case 4:
      return draft.styleId !== null;
    default:
      return true;
  }
}

interface CreateWizardProps {
  mode: "create" | "edit";
  editId?: string;
}

export default function CreateWizard({ mode, editId }: CreateWizardProps) {
  const router = useRouter();
  const ready = useRequireSession();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  useEffect(() => {
    if (!ready || mode !== "edit" || !editId) return;
    getBook(editId).then((book) => {
      if (book) setDraft(draftFromBook(book));
    });
  }, [ready, mode, editId]);

  const stories = useMemo(() => (draft.value ? buildStories(draft.value) : []), [draft.value]);

  const selectValue = (id: string) => {
    const v = valueById(id);
    if (!v) return;
    setDraft({
      valueId: id,
      value: v.name,
      accent: v.color,
      title: "",
      storyId: null,
      styleId: draft.styleId,
      sections: [],
    });
  };

  const chooseStory = (storyId: string) => {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    setDraft((d) => ({
      ...d,
      storyId,
      title: story.title,
      sections: story.sections.map((s) => ({ ...s })),
    }));
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const removeSection = (index: number) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== index) }));
  };

  const addSection = () => {
    setDraft((d) => ({ ...d, sections: [...d.sections, { imageDesc: "", text: "" }] }));
  };

  const handleAccept = async () => {
    if (!draft.valueId || !draft.storyId || !draft.styleId) return;
    const input: BookInput = {
      valueId: draft.valueId,
      title: draft.title,
      storyId: draft.storyId,
      styleId: draft.styleId,
      sections: draft.sections,
    };
    if (mode === "edit" && editId) {
      await updateBook(editId, input);
    } else {
      await createBook(input);
    }
    router.push("/library");
  };

  const goToStep = (target: number) => {
    if (target <= step) setStep(target);
  };

  const nextLabel = step === 4 ? "Review →" : "Next →";
  const canProceed = isStepValid(step, draft);

  const previewSection = draft.sections[0] ?? {
    imageDesc: "A cheerful illustration placeholder",
    text: "Story text will appear here.",
  };

  if (!ready) return null;

  return (
    <div data-testid="wizard-view" style={{ minHeight: "100vh", background: COLORS.canvas, display: "flex", flexDirection: "column" }}>
      <WizardHeader mode={mode} step={step} onCancel={() => router.push("/library")} onStepClick={goToStep} />

      <main style={{ flex: 1, padding: "clamp(24px,3.5vw,44px)", maxWidth: 1080, margin: "0 auto", width: "100%" }}>
        {step === 1 && <ValueStep selectedValueId={draft.valueId} onSelect={selectValue} />}

        {step === 2 && (
          <StoryStep value={draft.value} stories={stories} storyId={draft.storyId} onChoose={chooseStory} />
        )}

        {step === 3 && (
          <PagesStep
            title={draft.title}
            onTitleChange={(title) => setDraft((d) => ({ ...d, title }))}
            sections={draft.sections}
            onUpdateSection={updateSection}
            onRemoveSection={removeSection}
            onAddSection={addSection}
          />
        )}

        {step === 4 && (
          <StyleStep
            selectedStyleId={draft.styleId}
            onSelect={(styleId) => setDraft((d) => ({ ...d, styleId }))}
            previewImageDesc={previewSection.imageDesc}
            previewText={previewSection.text}
            previewPageTotal={draft.sections.length || 1}
          />
        )}

        {step === 5 && (
          <ReviewStep
            mode={mode}
            title={draft.title}
            value={draft.value}
            valueId={draft.valueId}
            accent={draft.accent}
            styleId={draft.styleId}
            sections={draft.sections}
            onDecline={() => setStep(3)}
            onAccept={handleAccept}
          />
        )}
      </main>

      {step <= 4 && (
        <WizardFooter
          step={step}
          canProceed={canProceed}
          nextLabel={nextLabel}
          onPrev={() => setStep((s) => Math.max(1, s - 1))}
          onNext={() => setStep((s) => Math.min(5, s + 1))}
        />
      )}
    </div>
  );
}
