import Nest from "@assets/doc/nest.mp4";
import Next from "@assets/doc/next.mp4";
import Php from "@assets/doc/php.mp4";
import Vite from "@assets/doc/vite.mp4";

import QuickCiCdDoc from "@src/components/doc";

const data = [
    {
        type: "basic",
        title: "Introduction to CI/CD with Bitbucket and Docker",
        content: `
			Quick CI/CD With Bitbucket is a tool designed to simplify the setup of Continuous Integration and Continuous Deployment (CI/CD) pipelines for your projects using Bitbucket. This tool automates the creation of essential configuration files and scripts required for Docker-based deployments, making it easier to get your project up and running with CI/CD workflows.
			
			With Quick CI/CD, you can quickly integrate automated builds, tests, and deployments into your project, ensuring faster and more reliable releases while reducing the manual effort involved in setup.
		`,
        language: "bash",
        code: "npx quick-cicd",
    },
    {
        type: "list",
        title: "Features",
        list: [
            {
                title: "Automated Setup:",
                content:
                    "Quickly set up Docker and CI/CD configuration files, saving time and reducing errors.",
            },
            {
                title: "Customizable:",
                content:
                    "Supports various project types, including React.js, Node.js, and more. (PHP and Python support coming soon).",
            },
            {
                title: "Ease of Use:",
                content:
                    "Simple command-line interface to guide you through the setup process.",
            },
            {
                title: "Integration with Bitbucket:",
                content:
                    "Seamlessly integrates with Bitbucket Pipelines for automated deployments, making it easy to push changes to production with minimal effort.",
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
                title: "Vite.js-(React)",
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
                videoLink: Vite.src,
            },
            {
                title: "Next.js",
                content:
                    "Full setup guide for Next JS projects. This guide will help you set up a new Next JS project and integrate Quick CI/CD for automated deployments.",
                videoLink: Next.src,
            },
            {
                title: "Nest.js",
                content:
                    "Full setup guide for Nest JS projects. This guide will help you set up a new Nest JS project and integrate Quick CI/CD for automated deployments.",
                videoLink: Nest.src,
            },
            {
                title: "PHP-Laravel",
                content:
                    "Full setup guide for PHP Laravel projects. This guide will help you set up a new PHP Laravel project and integrate Quick CI/CD for automated deployments.",
                videoLink: Php.src,
            },
        ],
    },
    {
        type: "list",
        title: "Bitbucket Setup",
        step: "2",
        list: [
            {
                title: "Step 1:",
                content:
                    " Create a new repository on Bitbucket and push your project to it.",
            },
            {
                title: "Step 2:",
                content: " Go to the repository settings and enable Pipelines.",
            },
            {
                title: "Step 3:",
                content:
                    "Go to the Pipelines section and click on the 'Set up a new pipeline' button.",
            },
            {
                title: "Step 4:",
                content: "Select the language and framework of your project.",
            },
            {
                title: "Step 5:",
                content:
                    " On your server generate an SSH key Pair, run the following command:",
                language: "bash",
                code: 'ssh-keygen -t rsa -b 4096 -C "your_email@example.com"',
            },
            {
                title: "Step 6:",
                content:
                    "Copy the public key (~/.ssh/id_rsa.pub) and add it to bitbucket under the SSH keys section in the settings.",
                language: "bash",
                code: "Go to the repository settings -> Access keys -> Add key -> Paste the public key.",
            },
            {
                title: "Step 7:",
                content:
                    ' git status -> git add . -> git commit -m "Initial commit" -> git push origin branch-name.',
            },
            {
                title: "Step 8:",
                content: "Go to your server and run the following command:",
                language: "bash",
                code: "bash deploy.sh",
            },
            {
                title: "Step 9:",
                content: "Your project will be deployed to the server.",
            },
            {
                title: "Step 10:",
                content:
                    "Now you have a fully automated CI/CD pipeline set up with Bitbucket Pipelines.",
            },
            {
                title: "Step 11:",
                content:
                    "If push to the repository is detected, the pipeline will run and deploy your project to the server.",
            },
        ],
    },
];

export default function Page() {
    return (
        <>
            <QuickCiCdDoc data={data} />
        </>
    );
}
