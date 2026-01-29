"use client";

import dynamic from "next/dynamic";

const CourseDetailClient = dynamic(
    () => import("./_components/CourseDetailClient"),
    { ssr: false }
);

export const runtime = "edge";

export default function CourseDetailPage() {
    return <CourseDetailClient />;
}
