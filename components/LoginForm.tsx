"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { COLORS, FONTS, HOVER_MOTION, SHADOW } from "@/lib/tokens";

export interface LoginFormProps {
  onSignIn: () => void;
}

export default function LoginForm({ onSignIn }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.ok) {
      onSignIn();
    } else {
      setError(result.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        maxWidth: 380,
        background: COLORS.surface,
        border: `3px solid ${COLORS.ink}`,
        borderRadius: 20,
        padding: "clamp(28px,4vw,40px)",
        boxShadow: SHADOW(5),
      }}
    >
      <h2 style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 24, margin: "0 0 24px" }}>Welcome back 👋</h2>
      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ display: "block", fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
          Email
        </span>
        <input
          name="email"
          type="email"
          placeholder="parent@home.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 14,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 12,
            fontFamily: FONTS.body,
            fontSize: 15,
            outline: "none",
          }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 24 }}>
        <span style={{ display: "block", fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
          Password
        </span>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 14,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 12,
            fontFamily: FONTS.body,
            fontSize: 15,
            outline: "none",
          }}
        />
      </label>
      {error && (
        <p
          data-testid="signin-error"
          style={{ color: COLORS.pink, fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, margin: "0 0 16px" }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        data-testid="signin-button"
        disabled={submitting}
        style={{
          width: "100%",
          padding: "14px 24px",
          background: COLORS.pink,
          color: COLORS.surface,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 14,
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: 18,
          cursor: submitting ? "default" : "pointer",
          opacity: submitting ? 0.7 : 1,
          boxShadow: HOVER_MOTION.default.boxShadow,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = HOVER_MOTION.hover.transform;
          e.currentTarget.style.boxShadow = HOVER_MOTION.hover.boxShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = HOVER_MOTION.default.boxShadow;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = HOVER_MOTION.active.transform;
          e.currentTarget.style.boxShadow = HOVER_MOTION.active.boxShadow;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = HOVER_MOTION.hover.transform;
          e.currentTarget.style.boxShadow = HOVER_MOTION.hover.boxShadow;
        }}
      >
        Sign in
      </button>
      <p style={{ textAlign: "center", marginTop: 20, fontFamily: FONTS.body, fontSize: 14, color: COLORS.mutedText }}>
        <a href="#" style={{ color: COLORS.blue, fontWeight: 600, textDecoration: "none" }}>
          Create an account
        </a>
      </p>
    </form>
  );
}
