import type { Metadata } from "next";
import { activityCsvService } from "@src/lib/api/activityCsvService";
import QuickDbActivityDashboard from "@src/components/quickdb/QuickDbActivityDashboard";
import DocThemeToggle from "@src/components/DocThemeToggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "QuickDB Telemetry & Activity Stream - CSV Live Feed",
    description:
        "Real-time visualization and analytics of QuickDB extension usage, feature engagement, and device telemetry stored in local CSV files.",
    alternates: {
        canonical: "/quickdb/activity",
    },
};

export default async function QuickDbActivityPage() {
    const { events, summary } = await activityCsvService.getParsedEvents();

    return (
        <main className="relative min-h-screen">
            <DocThemeToggle />
            <QuickDbActivityDashboard initialEvents={events} initialSummary={summary} />
        </main>
    );
}
