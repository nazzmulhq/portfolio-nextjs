import type { Metadata } from "next";
import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import InfiniteCounter from "@src/components/home/InfiniteCounter";
import { NavBar, NavBarMobile } from "@src/components/home/NavBar";
import Skills from "@src/components/home/Skills";
import Works from "@src/components/home/Works";

export const metadata: Metadata = {
    title: {
        absolute: "Nazmul Haque | Senior Software Specialist",
    },
    description: "Portfolio of Nazmul Haque, a Senior Software Specialist specializing in Next.js, NestJS, React, and full-stack enterprise development.",
    alternates: {
        canonical: "/",
    },
};

export const dynamic = "force-static";

export default function Page() {
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Nazmul Haque",
        "url": "https://nazmulhaque.netlify.app",
        "image": "https://nazmulhaque.netlify.app/images/person.png",
        "sameAs": [
            "https://www.github.com/nazzmulhq",
            "https://www.linkedin.com/in/nazzmulhq/"
        ],
        "jobTitle": "Senior Software Specialist",
        "worksFor": {
            "@type": "Organization",
            "name": "SSL Wireless Ltd."
        },
        "description": "Portfolio of Nazmul Haque, a Senior Software Specialist specializing in Next.js, NestJS, React, and full-stack enterprise development.",
        "gender": "Male",
        "knowsLanguage": ["English", "Bengali"],
        "nationality": {
            "@type": "Country",
            "name": "Bangladesh"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dhaka",
            "addressCountry": "Bangladesh"
        },
        "alumniOf": [
            {
                "@type": "EducationalOrganization",
                "name": "Daffodil International University"
            }
        ],
        "knowsAbout": [
            "JavaScript",
            "TypeScript",
            "Python",
            "React.js",
            "Next.js",
            "NestJS",
            "Django",
            "Docker",
            "Kubernetes",
            "Microservices"
        ]
    };

    const quickdbSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QuickDB",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "DataGrip-inspired database manager for VS Code. Browse tables, run SQL/NoSQL queries, and integrate with AI assistants like Cursor/Claude via built-in MCP server.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const quickCicdSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Quick Dockerize Tool",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "Command-line interface to containerize projects (Docker) and generate CI/CD configuration files (GitHub Actions, Bitbucket, etc.) automatically.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const eslintSetupSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "ESLint & Prettier Setup for Next.js",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "Published npm package for automated ESLint and Prettier configuration in Next.js projects.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const quickUiSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Quick UI Design",
        "operatingSystem": "Windows, macOS, Linux",
        "applicationCategory": "DeveloperApplication",
        "description": "Scaffolding tool for rapid web application UI development with Ant Design and Next.js.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Nazmul Haque"
        }
    };

    const jsonLd = [personSchema, quickdbSchema, quickCicdSchema, eslintSetupSchema, quickUiSchema];

    return (
        <div className="relative p-0 sm:p-4 md:py-24 text-white min-h-screen w-full max-w-5xl mx-auto pb-28 md:pb-12 flex flex-col justify-center">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <NavBar />

            {/* Ambient Background Grid & Image */}
            <div className="fixed inset-0 pointer-events-none -z-20 bg-[#020617] overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 transition-opacity duration-1000 animate-bg-pan mix-blend-luminosity"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
                ></div>
                
                {/* Large Ambient Glowing Light Blobs */}
                <div className="ambient-blob blob-1 mix-blend-screen opacity-70"></div>
                <div className="ambient-blob blob-2 mix-blend-screen opacity-60"></div>
                <div className="ambient-blob blob-3 mix-blend-screen opacity-60"></div>

                {/* Layer 1: Dense, fast, twinkling */}
                <div className="absolute inset-0 animate-[pulse_3s_ease-in-out_infinite] hidden sm:block">
                    <div className="absolute inset-0 bg-organic-dots-1 opacity-90 mix-blend-screen" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,1))' }}></div>
                </div>
                
                {/* Layer 2: Medium, slower */}
                <div className="absolute inset-0 animate-[pulse_5s_ease-in-out_infinite] hidden sm:block">
                    <div className="absolute inset-0 bg-organic-dots-2 opacity-80 mix-blend-screen" style={{ filter: 'drop-shadow(0 0 6px rgba(110,231,183,0.8))' }}></div>
                </div>
                
                {/* Layer 3: Sparse, largest, glowing */}
                <div className="absolute inset-0 animate-[pulse_7s_ease-in-out_infinite] hidden sm:block">
                    <div className="absolute inset-0 bg-organic-dots-3 opacity-100 mix-blend-screen" style={{ filter: 'drop-shadow(0 0 8px rgba(110,231,183,1)) drop-shadow(0 0 15px rgba(255,255,255,0.5))' }}></div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/80"></div>
            </div>

            <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {/* Decorative background glow behind the frame */}
                <div className="absolute top-1/4 left-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-emerald-500/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
                <div className="absolute bottom-1/4 right-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-teal-500/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
                
                {/* Unified outer border container (Sleek Glass Frame) */}
                <div className="w-full rounded-none sm:rounded-2xl relative bg-slate-950/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border-x-0 sm:border-x border-y sm:border border-slate-700/50 ring-0 sm:ring-1 ring-white/5 overflow-hidden group/frame">
                    
                    {/* Animated top border glow */}
                    <div className="absolute top-0 left-[-100%] w-[150%] h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover/frame:left-[100%] transition-all duration-[2000ms] ease-in-out z-20"></div>
                    
                    {/* Top bar (Mac OS style + Tech) */}
                    <div className="w-full h-12 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-3 sm:px-5 relative z-10">
                        <div className="flex gap-1.5 sm:gap-2.5 items-center w-[25%] sm:w-1/3">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-700 group-hover/frame:bg-red-500/90 group-hover/frame:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-colors duration-300"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-700 group-hover/frame:bg-yellow-500/90 group-hover/frame:shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-colors duration-300 delay-75"></div>
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-700 group-hover/frame:bg-green-500/90 group-hover/frame:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-colors duration-300 delay-150"></div>
                        </div>
                        
                        <div className="flex-1 flex justify-center text-[10px] sm:text-xs font-mono text-slate-400 tracking-widest w-[50%] sm:w-1/3 opacity-50 group-hover/frame:opacity-100 transition-opacity">
                            portfolio.exe
                        </div>

                        <div className="flex items-center justify-end w-[25%] sm:w-1/3">
                            <div className="bg-black/30 border border-white/5 shadow-inner text-white/70 px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-mono flex items-center gap-1 sm:gap-2">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></span>
                                <InfiniteCounter direction="up" speed={1000} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="w-full relative bg-transparent z-0">
                        <Home />
                        <Skills />
                        <Experience />
                        <Education />
                        <Works />
                    </div>
                    
                    {/* Bottom bar */}
                    <div className="w-full h-10 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-5 text-xs text-slate-500 font-mono relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 opacity-70"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> SYSTEM ONLINE</span>
                        </div>
                        <div className="bg-black/30 border border-white/5 text-white/70 px-3 py-1 rounded-md flex items-center gap-2">
                            <InfiniteCounter direction="down" speed={1000} />
                        </div>
                    </div>
                </div>
            </div>
            <NavBarMobile />
        </div>
    );
}
