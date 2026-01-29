
import RateClient from "./ClientPage";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return [];
}

export default function Page() {
    return <RateClient />;
}
