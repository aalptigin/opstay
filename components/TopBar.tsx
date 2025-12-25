"use client";

import type { MeUser } from "./PanelShell";
import Button from "./ui/Button";

export default function TopBar({ me }: { me: MeUser | null }) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="border-b border-white/10 bg-[#071024]/70 backdrop-blur px-4 py-3 flex items-center justify-between">
      <div className="text-sm text-white/70">
        {me ? `Hoş geldiniz, ${me.full_name}` : "Panel"}
      </div>
      <Button variant="ghost" onClick={logout}>
        Çıkış
      </Button>
    </div>
  );
}
