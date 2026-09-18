import type { Metadata } from "next";
import { activityCsvService, ParsedActivityEvent, ActivitySummary } from "@src/lib/api/activityCsvService";
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

const defaultSummary: ActivitySummary = {
    totalEvents: 0,
    uniqueDevices: 0,
    topFeature: { name: "None", count: 0 },
    latestSyncAt: null,
    featureDistribution: [],
    deviceDistribution: { laptop: 0, desktop: 0, mobile: 0, unknown: 0 },
    osDistribution: [],
    editorDistribution: [],
    locationDistribution: [],
    timeline: []
};

export default async function QuickDbActivityPage() {
    let events: ParsedActivityEvent[] = [];
    let summary: ActivitySummary = defaultSummary;
    let deviceStore = {};

    try {
        const data = await activityCsvService.getParsedEvents();
        if (data) {
            events = data.events || [];
            summary = data.summary || defaultSummary;
            deviceStore = data.deviceStore || {};
        }
    } catch (err) {
        console.error("Error loading activity events in QuickDbActivityPage:", err);
    }

    return (
        <main className="relative min-h-screen">
            <DocThemeToggle />
            <QuickDbActivityDashboard
                initialEvents={events}
                initialSummary={summary}
                initialDeviceStore={deviceStore}
            />
        </main>
    );
}
