"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export type MeUser = {
  email: string;
  role: "manager" | "staff";
  restaurant_name: string;
  full_name: string;
};

export default function PanelShell({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeUser | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) setMe(j.user);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#071024] text-white">
      <div className="flex">
        <Sidebar me={me} />
        <div className="flex-1 min-w-0">
          <TopBar me={me} />
          <div className="px-4 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
