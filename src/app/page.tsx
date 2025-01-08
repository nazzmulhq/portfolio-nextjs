import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import { NavBar, NavBarMobile } from "@src/components/home/NavBar";
import Skills from "@src/components/home/Skills";
import Works from "@src/components/home/Works";

export default function Page() {
    return (
        <div className="container relative p-4 text-white min-h-screen mx-auto sm:w-full md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/3">
            <NavBar />

            <div className="md:mt-16">
                <div className="w-full border border-b-0 border-white h-8 flex justify-between">
                    <div className="w-1/12 border-r border-white bg-white text-black text-center text-2xl font-medium">
                        0
                    </div>
                    <div className="w-11/12 border-r border-white "></div>
                    <div className="w-1/12 "></div>
                </div>
                <div className="w-full border border-white">
                    <Home />
                    <Skills />
                    <Experience />
                    <Education />
                    <Works />
                </div>
                <div className="w-full border border-t-0 border-white h-8 flex justify-between">
                    <div className="w-1/12 border-r border-white "></div>
                    <div className="w-11/12 border-r border-white "></div>
                    <div className="w-1/12 bg-white text-black text-center text-2xl font-medium">
                        9
                    </div>
                </div>
            </div>
            <NavBarMobile />
        </div>
    );
}
