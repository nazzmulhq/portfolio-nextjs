import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import PlanViewer from "@src/components/implementation-plan/PlanViewer";
import { parseMarkdownMeta } from "@src/components/implementation-plan/tocParser";

export const metadata: Metadata = {
    title: "User Authentication & Authorization Architecture - Implementation Plan v2.0",
    description:
        "Comprehensive architectural blueprint and engineering specification for distributed concurrency locks, real-time Socket.IO countdowns, Argon2id authentication, and dynamic RBAC resolution.",
    alternates: {
        canonical: "/implementation_plan",
    },
    openGraph: {
        title: "User Authentication & Authorization System - Architecture Blueprint v2.0",
        description:
            "7-Phase engineering implementation plan covering Redis concurrency guards, FastAPI token engines, dynamic RBAC permissions, and Socket.IO real-time countdowns.",
        url: "/implementation_plan",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "User Authentication & Authorization System - Implementation Plan v2.0",
        description:
            "Complete 6-tier architecture blueprint, Redis concurrency guard, dynamic RBAC graph, and Socket.IO real-time lock countdowns.",
    },
};

export const dynamic = "force-static";

export default function ImplementationPlanPage() {
    const filePath = join(process.cwd(), "src/app/implementation_plan/Implementation_Plan_v2.md");
    const markdownContent = readFileSync(filePath, "utf8");
    const { toc } = parseMarkdownMeta(markdownContent);

    return (
        <PlanViewer
            filename="Implementation_Plan_v2.md"
            markdownContent={markdownContent}
            toc={toc}
        />
    );
}
