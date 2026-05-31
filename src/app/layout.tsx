import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#020617",
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://nazmulhaque.netlify.app"),
    applicationName: "Nazmul Haque Portfolio",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    category: "technology",
    classification: "Software Engineer Portfolio",
    publisher: "Nazmul Haque",
    title: {
        default: "Nazmul Haque | Senior Software Specialist",
        template: "%s | Nazmul Haque"
    },
    description: "Portfolio of Nazmul Haque, a Senior Software Specialist specializing in Next.js, NestJS, React, and full-stack enterprise development.",
    keywords: [
        "Nazmul Haque", 
        "Software Engineer", 
        "Senior Software Specialist", 
        "Full Stack Developer", 
        "Next.js", 
        "NestJS", 
        "React", 
        "TypeScript", 
        "Dhaka", 
        "Bangladesh",
        "Web Developer",
        "Software Architect",
        "Enterprise ERP"
    ],
    authors: [{ name: "Nazmul Haque", url: "https://nazmulhaque.netlify.app" }],
    creator: "Nazmul Haque",
    alternates: {
        canonical: "/",
    },
    icons: {
        icon: {
            type: "image/png",
            url: "/images/person.png",
            sizes: "192x192"
        },
        shortcut: {
            type: "image/png",
            url: "/images/person.png",
            sizes: "192x192"
        },
        apple: {
            type: "image/png",
            url: "/images/person.png",
            sizes: "192x192"
        },
    },
    verification: {
        google: "google-site-verification-placeholder",
    },
    openGraph: {
        title: "Nazmul Haque | Senior Software Specialist",
        description: "Explore the portfolio and projects of Nazmul Haque, a Senior Software Specialist building robust full-stack solutions.",
        url: "/",
        siteName: "Nazmul Haque Portfolio",
        images: [
            {
                url: "/images/person.png",
                width: 800,
                height: 800,
                alt: "Nazmul Haque - Senior Software Specialist",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nazmul Haque | Senior Software Specialist",
        description: "Explore the portfolio and projects of Nazmul Haque, a Senior Software Specialist.",
        images: ["/images/person.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-grid overflow-x-hidden`}
            >
                {children}
            </body>
        </html>
    );
}
