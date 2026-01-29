"use client";

import dynamic from "next/dynamic";

const VehicleDetailClient = dynamic(
    () => import("./_components/VehicleDetailClient"),
    { ssr: false }
);

export const runtime = "edge";

export default function VehicleDetailPage() {
    return <VehicleDetailClient />;
}
