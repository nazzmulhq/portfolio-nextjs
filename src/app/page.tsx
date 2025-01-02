import me from "@public/images/person.png";
import Education from "@src/components/home/Education";
import Experience from "@src/components/home/Experience";
import Home from "@src/components/home/Home";
import { NavBar, NavBarMobile } from "@src/components/home/NavBar";
import Skills from "@src/components/home/Skills";
import Works from "@src/components/home/Works";

export const info = {
    me: {
        name: "Nazmul Haque",
        title: "Full Stack Developer",
        email: "nazmul2018s@gmail.com",
        phone: "+8801917003822",
        experience: "4+ experience",
        image: me,
        linkedin: "https://www.linkedin.com/in/nazzmulhq/",
        github: "https://www.github.com/nazzmulhq",
        resume: "https://www.github.com/nazzmulhq",
    },
    skills: [
        "JavaScript",
        "TypeScript",
        "React.js",
        "Node.js",
        "Express.js",
        "Next.js",
        "Nest.js",
        "Tailwind CSS",
        "Material UI",
        "Ant Design",
        "Docker",
        "Kubernetes",
    ],
    experience: [
        {
            icon: "https://img.icons8.com/ios/50/000000/react-native.png",
            title: "Software Specialist (Fullstack)",
            address: " 27, 1 New Eskaton Road, Dhaka 1000",
            company: "SSL Wireless Ltd.",
            date: "Oct 2023 - Present",
            description: [
                "Lead ERP frontend development using Next.js 14 and TypeScript",
                "Design and implement modular ERP components with Ant Design and TailwindCSS",
                "Create complex state management solutions using Redux Toolkit",
                "Set up automated CI/CD pipelines GitHub Actions for deployment using Docker",
            ],
            technologies: [
                "Next.js 14",
                "TypeScript",
                "Ant Design",
                "TailwindCSS",
                "Docker",
                "Kubernetes",
                "GitHub Actions",
                "Redux Toolkit",
            ],
        },
        {
            icon: "https://img.icons8.com/ios/50/000000/react-native.png",
            title: "Software Engineer (Fullstack)",
            company: "APSIS Ltd.",
            date: "Nov 2022 - Oct 2023",
            address: "Ahmed Tower, 30 Kemal Ataturk Ave, Dhaka 1213",
            description: [
                "Developed enterprise ERP system using Next.js and NestJS",
                "Built scalable RESTful APIs using NestJS with Knex",
                "Implemented responsive UI components using Ant Design and TailwindCSS",
                "Designed and optimized PostgreSQL database schemas for ERP modules",
            ],
            technologies: [
                "Next.js",
                "NestJS",
                "TypeScript",
                "Ant Design",
                "TailwindCSS",
                "PostgreSQL",
                "Redis",
                "Microservices",
            ],
        },
        {
            icon: "https://img.icons8.com/ios/50/000000/react-native.png",
            title: "Software Engineer (Frontend)",
            company: "mPower Social Enterprises Ltd.",
            date: "Nov 2020 - Nov 2022",
            address:
                "Level 10 House 77, Nur Empori, Road 11 Banani Bridge, Dhaka 1213",
            description: [
                "Led frontend development using React.js and TypeScript for enterprise applications",
                "Created reusable component libraries and established frontend architecture",
                "Conducted requirement analysis and created detailed technical specifications",
                "Designed RESTful API integrations and state management using Redux",
            ],
            technologies: [
                "React.js",
                "TypeScript",
                "Material-UI",
                "Redux",
                "Jest",
                "REST APIs",
                "Git",
                "Agile/Scrum",
            ],
        },
        {
            icon: "https://img.icons8.com/ios/50/000000/react-native.png",
            title: "Associate Software Engineer",
            address: "Komlapur, Dhaka",
            company: "ROTech Ltd.",
            date: "Jul 2020 - Nov 2020",
            description: [
                "Developed backend APIs using Python Django frameworks with RESTful architecture",
                "Designed ERP Module and implemented & responsive frontend using HTML5, CSS3, and JavaScript",
                "Conducted requirement analysis and created detailed technical specifications",
                "Designed and optimized PostgreSQL database schemas and queries",
            ],
            technologies: [
                "Python",
                "Django",
                "HTML5/CSS3",
                "JavaScript",
                "PostgreSQL",
                "Git",
                "RESTful APIs",
            ],
        },
    ],
    education: [
        {
            title: "Daffodil International University",
            degree: "Bachelor of Science in Computer Science and Engineering",
            date: "2016 - 2020",
        },
        {
            title: "Meherpur College of Engineering & Technology",
            degree: "Diploma-in-Computer Engineering",
            date: "2012 - 2016",
        },
        {
            title: "Kobi Nazrul Shikkha Manzil",
            degree: "Secondary School Certificate",
            date: "2010 - 2012",
        },
    ],
    works: [
        {
            imageOrVideo:
                "https://images.unsplash.com/photo-1557683316-973673baf926?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ",
            title: "The origin",
            technologies: ["React.js", "Node.js", "Express.js"],
            description: [
                "Pretium lectus quam id leo.",
                "Urna et pharetra pharetra massa massa.",
                "Adipiscing enim eu neque aliquam vestibulum morbi blandit cursus risus.",
            ],
            link: "https://www.google.com",
        },
    ],
};

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
