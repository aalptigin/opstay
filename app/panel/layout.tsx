import type { ReactNode } from "react";
import SideNav from "./_components/SideNav";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="flex">
        <SideNav />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
