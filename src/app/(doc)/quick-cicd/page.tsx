const Nest = "/videos/quick-cicd/nest.mp4";
const Next = "/videos/quick-cicd/next.mp4";
const Php = "/videos/quick-cicd/php.mp4";
const Vite = "/videos/quick-cicd/vite.mp4";

import QuickCiCdDoc from "@src/components/doc";

const data = [
    {
        type: "basic",
        title: "Introduction to Dockerize Tool",
        content: `
        Quick Dockerize Tool is a command-line interface that helps you set up Docker and CI/CD configuration files for your projects. It supports various project types, including React.js, Node.js, and more. The tool is designed to save time and reduce errors by automating the setup process.`,
        language: "bash",
        code: "npx quick-cicd",
    },
    {
        type: "list",
        title: "Features",
        list: [
            {
                title: "Automated Setup",
                content:
                    "Quick Dockerize Tool automates the setup process for Docker and CI/CD configuration files.",
            },
            {
                title: "Project Types",
                content:
                    "The tool supports various project types, including React.js, Node.js, and more.",
            },
            {
                title: "Time-Saving",
                content:
                    "By automating the setup process, the tool saves time and reduces errors.",
            },
            {
                title: "Easy to Use",
                content:
                    "The tool is easy to use and requires minimal configuration.",
            },
            {
                title: "Customizable",
                content:
                    "The tool allows you to customize the setup process to suit your project requirements.",
            },
        ],
    },
    {
        type: "list",
        title: "Prerequisites",
        content:
            "Before starting, ensure the following are installed on your system:",
        list: [
            {
                title: "Node.js",
            },
            {
                title: "Docker",
            },
        ],
    },
    {
        type: "tabs",
        step: "1",
        tabs: [
            {
                title: "React.js",
                content:
                    "Make sure in vite.config.ts or vite.config.js file you have the following configuration:",
                code: `// vite.config.ts or vite.config.js
export default defineConfig({
	plugins: [react()],
	preview: {
		host: "0.0.0.0",
		port: 3000,
	},
});
`,
                language: "javascript",
                videoLink: Vite,
            },
            {
                title: "Next.js",
                content:
                    "Full setup guide for Next JS projects. This guide will help you set up a new Next JS project and integrate Quick CI/CD for automated deployments.",
                videoLink: Next,
            },
            {
                title: "Nest.js",
                content:
                    "Full setup guide for Nest JS projects. This guide will help you set up a new Nest JS project and integrate Quick CI/CD for automated deployments.",
                videoLink: Nest,
            },
            {
                title: "Laravel",
                content:
                    "Full setup guide for PHP Laravel projects. This guide will help you set up a new PHP Laravel project and integrate Quick CI/CD for automated deployments.",
                videoLink: Php,
            },
        ],
    },

    // {
    //     type: "list",
    //     title: "Bitbucket Setup",
    //     step: "2",
    //     list: [
    //         {
    //             title: "Step 1:",
    //             content:
    //                 " Create a new repository on Bitbucket and push your project to it.",
    //         },
    //         {
    //             title: "Step 2:",
    //             content: " Go to the repository settings and enable Pipelines.",
    //         },
    //         {
    //             title: "Step 3:",
    //             content:
    //                 "Go to the Pipelines section and click on the 'Set up a new pipeline' button.",
    //         },
    //         {
    //             title: "Step 4:",
    //             content: "Select the language and framework of your project.",
    //         },
    //         {
    //             title: "Step 5:",
    //             content:
    //                 " On your server generate an SSH key Pair, run the following command:",
    //             language: "bash",
    //             code: 'ssh-keygen -t rsa -b 4096 -C "your_email@example.com"',
    //         },
    //         {
    //             title: "Step 6:",
    //             content:
    //                 "Copy the public key (~/.ssh/id_rsa.pub) and add it to bitbucket under the SSH keys section in the settings.",
    //             language: "bash",
    //             code: "Go to the repository settings -> Access keys -> Add key -> Paste the public key.",
    //         },
    //         {
    //             title: "Step 7:",
    //             content:
    //                 ' git status -> git add . -> git commit -m "Initial commit" -> git push origin branch-name.',
    //         },
    //         {
    //             title: "Step 8:",
    //             content: "Go to your server and run the following command:",
    //             language: "bash",
    //             code: "bash deploy.sh",
    //         },
    //         {
    //             title: "Step 9:",
    //             content: "Your project will be deployed to the server.",
    //         },
    //         {
    //             title: "Step 10:",
    //             content:
    //                 "Now you have a fully automated CI/CD pipeline set up with Bitbucket Pipelines.",
    //         },
    //         {
    //             title: "Step 11:",
    //             content:
    //                 "If push to the repository is detected, the pipeline will run and deploy your project to the server.",
    //         },
    //     ],
    // },
];

export default function Page() {
    return (
        <section className="container relative p-4 text-white min-h-screen mx-auto sm:w-full md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/3">
            <QuickCiCdDoc data={data} title="Quick Dockerize Tool" />
        </section>
    );
}
