
import EducationDetailClient from "./ClientPage";

// export const dynamic = "force-static"; // Conflict with runtime=edge
export const runtime = "edge";

// generateStaticParams removed to support Edge Runtime

export default function Page() {
    return <EducationDetailClient />;
}
