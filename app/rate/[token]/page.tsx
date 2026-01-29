"use client";

import dynamic from "next/dynamic";

const RateClient = dynamic(
    () => import("./_components/RateClient"),
    { ssr: false }
);

export const runtime = "edge";

export default function RatePage() {
    return <RateClient />;
}
