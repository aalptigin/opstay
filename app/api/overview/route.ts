// Overview API Endpoint

import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { getOverview } from "@/lib/overview/getOverview";
import { OverviewDataSchema } from "@/lib/overview/schema";

// export const runtime = "edge";

export async function GET(request: NextRequest) {
    try {
        // Get session token from cookie
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify session
        const ip = getClientIp(request.headers);
        const sessionResult = verifySession(token, ip);

        if (!sessionResult.valid || !sessionResult.user) {
            return NextResponse.json({ error: sessionResult.error || "Unauthorized" }, { status: 401 });
        }

        // Get overview data
        const overviewData = getOverview(sessionResult.user);

        // Validate response (optional but recommended for debugging)
        const validated = OverviewDataSchema.safeParse(overviewData);
        if (!validated.success) {
            console.error("Overview data validation failed:", validated.error);
            // Still return data, but log the issue
        }

        return NextResponse.json(overviewData, {
            headers: {
                "Cache-Control": "private, max-age=30", // Cache for 30 seconds
            },
        });
    } catch (error) {
        console.error("Error in overview API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
