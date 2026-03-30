import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import InfiniteCounter from "@src/components/home/InfiniteCounter";
import { NavBar, NavBarMobile } from "@src/components/home/NavBar";
import Skills from "@src/components/home/Skills";
import Works from "@src/components/home/Works";

export const dynamic = "force-static";

export default function Page() {
    return (
        <div className="container relative p-4 text-white min-h-screen mx-auto sm:w-full md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/3">
            <NavBar />

            {/* Static Background Image with Animation */}
            <div 
                className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat opacity-50 transition-opacity duration-1000 animate-bg-pan"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="md:mt-16 w-full relative animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {/* Unified outer border container (Next.js sleek frame) */}
                <div className="w-full border border-white/10 rounded-xl relative overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl">
                    
                    {/* Top header line */}
                    <div className="w-full h-8 flex justify-between border-b border-white/10 bg-white/5">
                        <div className="w-1/12 border-r border-white/10 bg-white text-black flex items-center justify-center text-lg font-bold">
                            <InfiniteCounter direction="up" speed={1000} />
                        </div>
                        <div className="w-11/12 border-r border-white/10"></div>
                        <div className="w-1/12"></div>
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="w-full relative">
                        <Home />
                        <Skills />
                        <Experience />
                        <Education />
                        <Works />
                    </div>
                    
                    {/* Bottom header line */}
                    <div className="w-full h-8 flex justify-between border-t border-white/10 bg-white/5">
                        <div className="w-1/12 border-r border-white/10"></div>
                        <div className="w-11/12 border-r border-white/10"></div>
                        <div className="w-1/12 bg-white text-black flex items-center justify-center text-lg font-bold">
                            <InfiniteCounter direction="down" speed={1000} />
                        </div>
                    </div>
                </div>
            </div>
            <NavBarMobile />
        </div>
    );
}
