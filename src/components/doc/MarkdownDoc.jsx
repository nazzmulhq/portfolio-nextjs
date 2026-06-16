"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactCodeBlocks from "./ReactCodeBlocks";
import { slugify } from "./mdSlug";

// Flatten React children to a plain string (for heading ids / code extraction).
const nodeText = (node) => {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(nodeText).join("");
    if (node?.props?.children) return nodeText(node.props.children);
    return "";
};

const components = {
    h1: ({ children }) => (
        <h1 id={slugify(nodeText(children))} className="font-display mb-4 mt-10 scroll-mt-28 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 id={slugify(nodeText(children))} className="font-display mb-4 mt-16 flex scroll-mt-28 items-center gap-3 border-t border-line pt-10 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
            <span className="h-7 w-1.5 rounded-full bg-[linear-gradient(to_bottom,var(--accent),var(--accent-2))]" />
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 id={slugify(nodeText(children))} className="font-display mb-3 mt-9 scroll-mt-28 text-lg font-bold text-fg sm:text-xl">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 id={slugify(nodeText(children))} className="mb-2 mt-6 scroll-mt-28 text-sm font-bold uppercase tracking-wide text-accent">
            {children}
        </h4>
    ),
    p: ({ children }) => <p className="my-4 leading-relaxed text-muted">{children}</p>,
    a: ({ href, children }) => {
        const external = href?.startsWith("http");
        return (
            <a
                href={href}
                className="font-medium text-accent underline-offset-2 hover:underline"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
                {children}
            </a>
        );
    },
    ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-5 marker:text-[var(--accent)]">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-5 marker:text-[var(--accent)]">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed text-muted">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
    em: ({ children }) => <em className="italic text-fg/90">{children}</em>,
    hr: () => <hr className="my-10 border-line" />,
    blockquote: ({ children }) => (
        <blockquote className="my-5 rounded-xl border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-1 text-sm text-muted">
            {children}
        </blockquote>
    ),
    img: ({ src, alt }) => (
        <span className="reveal-scale my-6 block overflow-hidden rounded-2xl border border-line shadow-[0_24px_60px_-30px_var(--glow)]">
            <img alt={alt || ""} className="block w-full" loading="lazy" src={src} />
        </span>
    ),
    table: ({ children }) => (
        <div className="my-6 w-full overflow-x-auto rounded-2xl border border-line glass">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tr: ({ children }) => <tr className="border-b border-line last:border-0 hover:bg-[var(--surface-2)]">{children}</tr>,
    th: ({ children }) => <th className="p-3 text-xs font-semibold uppercase tracking-wider text-faint">{children}</th>,
    td: ({ children }) => <td className="p-3 align-top text-muted">{children}</td>,
    pre: ({ children }) => {
        const codeEl = Array.isArray(children) ? children[0] : children;
        const className = codeEl?.props?.className || "";
        const lang = /language-(\w+)/.exec(className)?.[1] || "";
        const raw = nodeText(codeEl?.props?.children);
        return <ReactCodeBlocks code={raw} language={lang} />;
    },
    code: ({ children }) => (
        <code className="rounded-md border border-line bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
            {children}
        </code>
    ),
};

export default function MarkdownDoc({ content }) {
    return (
        <div className="font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
