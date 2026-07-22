import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import ScrollReveal from "@src/components/ScrollReveal";
import "./globals.css";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#07080d" },
        { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    ],
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700", "800"],
});

// Runs before paint: applies saved theme (no flash) and arms the reveal
// system so elements start hidden before the observer animates them in.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}document.documentElement.classList.add('js-reveal');})();`;

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
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInit }} />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased overflow-x-hidden`}
            >
                <div aria-hidden className="scroll-progress" />
                <ScrollReveal />
                {children}
            </body>
            {process.env.NEXT_PUBLIC_GA_ID ? (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            ) : null}
        </html>
    );
}
