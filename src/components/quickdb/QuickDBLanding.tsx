import { FC } from "react";
import { STEPS } from "./landingData";
import QuickDBStory from "./QuickDBStory";

export interface IQuickDBLanding {}

const INSTALL_CMD = "code --install-extension quickdb.quickdb";

/**
 * The scroll story is a 1920x1080 artefact: it renders VS Code at design scale
 * and shrinks the whole laptop to fit the viewport. On a phone that puts 13px
 * chrome at roughly 2.5px — a 14-screen scroll through text nobody can read.
 * Below the breakpoint the same 19 beats are told as a readable list instead.
 *
 * Both are rendered and swapped with CSS rather than a media-query hook, so the
 * markup is identical on the server and after hydration.
 */
const CompactStory: FC = () => (
    <div className="md:hidden">
        <div className="qd-compact-hero">
            <span className="qd-pill">
                <span className="qd-pill-dot" />
                QuickDB 1.2.6 — editor extension &amp; desktop app
            </span>
            <h1 className="qd-h1">
                Your whole database,
                <br />
                inside your editor.
            </h1>
            <p className="qd-lede">
                Browse and query 30+ engines without leaving the window you already have open.
            </p>
        </div>

        <ol className="qd-steps">
            {STEPS.map(([n, label]) => (
                <li className="qd-step" key={n}>
                    <span className="qd-step-n">{n}</span>
                    <span className="qd-step-t">{label}</span>
                </li>
            ))}
        </ol>
    </div>
);

const QuickDBLanding: FC<IQuickDBLanding> = () => (
    <div className="qd-root">
        <div className="hidden md:block">
            <QuickDBStory />
        </div>

        <CompactStory />

        <section className="qd-cta" id="install">
            <h2 className="qd-cta-h">Install, connect, browse.</h2>
            <p className="qd-cta-p">
                Schema, rows and query history live next to the code that depends on them.
            </p>
            <div className="qd-cta-row">
                <a
                    className="qd-btn qd-btn-primary"
                    href="https://marketplace.visualstudio.com/items?itemName=quickdb.quickdb"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Install QuickDB
                </a>
                {/* The design pointed this at "#docs", which assumed a docs
                    section further down the page. There isn't one on this
                    route, so it goes to the repository rather than being a
                    dead anchor. */}
                <a
                    className="qd-btn qd-btn-ghost"
                    href="https://github.com/nazzmulhq"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Read the docs
                </a>
            </div>
            <div className="qd-cmd">{INSTALL_CMD}</div>
        </section>
    </div>
);

export default QuickDBLanding;
