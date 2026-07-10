"use client";

import { useRouter } from "next/navigation";
import LoginHero from "@/components/LoginHero";
import LoginForm from "@/components/LoginForm";
import { COLORS } from "@/lib/tokens";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
      <LoginHero />
      <div
        style={{
          flex: "1 1 380px",
          background: COLORS.canvas,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px,4vw,48px)",
        }}
      >
        <LoginForm onSignIn={() => router.push("/library")} />
      </div>
    </div>
  );
}
