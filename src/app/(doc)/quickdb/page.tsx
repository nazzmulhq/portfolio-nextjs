import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import QuickDBLanding from "@src/components/quickdb/QuickDBLanding";

// Self-hosted at build time by next/font, so the static export makes no
// runtime request to Google's CDN.
const grotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-grotesk",
    display: "swap",
});

export const metadata: Metadata = {
    title: "QuickDB — your whole database, inside your editor",
    description:
        "QuickDB is an IDE-grade database client for VS Code and the desktop: browse schemas, edit rows inline, follow foreign keys and run queries across 30+ engines, with a built-in MCP server for AI tools.",
    alternates: { canonical: "/quickdb" },
    openGraph: {
        title: "QuickDB — your whole database, inside your editor",
        description:
            "Browse and query 30+ database engines without leaving the window you already have open.",
        url: "/quickdb",
        type: "website",
        images: ["/images/quickdb.png"],
    },
};

export const dynamic = "force-static";

export default function QuickDBPage() {
    const appSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QuickDB",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Windows, macOS, Linux",
        "softwareVersion": "1.2.6",
        "description":
            "IDE-grade universal database client available as a VS Code extension and a standalone desktop app. Browse schemas, execute queries, design dashboards, and integrate with AI tools through a built-in MCP server.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "author": { "@type": "Person", "name": "Nazmul Haque" },
        "image": "https://nazmulhaque.netlify.app/images/quickdb.png",
    };

    // No theme toggle here: the page is a full-bleed dark product demo — the
    // story renders a mock of VS Code's dark theme, so a light mode would only
    // recolour the page around an image that stays dark either way.
    return (
        <div className={grotesk.variable}>
            <script
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
                type="application/ld+json"
            />

            <QuickDBLanding />
        </div>
    );
}
