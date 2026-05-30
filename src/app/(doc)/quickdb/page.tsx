import Link from "next/link";
import ScrollAnimate from "../../../components/ScrollAnimate";

export const dynamic = "force-static";

export default function QuickDBPage() {
    return (
        <div className="relative min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans overflow-hidden">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden border-b border-slate-800 bg-slate-950/50 backdrop-blur-3xl pt-24 sm:pt-32 pb-12 sm:pb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] sm:w-full max-w-3xl h-[200px] sm:h-[300px] bg-blue-500/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
                <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
                    <ScrollAnimate direction="up" delay={100} scale blur>
                        <div className="mb-8 p-5 rounded-3xl bg-slate-800/50 border border-slate-700 shadow-[0_0_50px_rgba(59,130,246,0.3)] backdrop-blur-sm group hover:scale-110 transition-transform duration-500">
                            <img src="/images/quickdb-icon.png" alt="QuickDB Logo" className="w-20 h-20 rounded-2xl group-hover:rotate-6 transition-transform duration-500" />
                        </div>
                    </ScrollAnimate>
                    <ScrollAnimate direction="up" delay={200} scale blur>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4 sm:mb-6 tracking-tight drop-shadow-xl">
                            QuickDB
                        </h1>
                    </ScrollAnimate>
                    <ScrollAnimate direction="up" delay={300} blur>
                        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium max-w-3xl mb-6 sm:mb-8 leading-relaxed">
                            The Ultimate Database Management & AI Integration Extension for VS Code
                        </p>
                    </ScrollAnimate>
                    <ScrollAnimate direction="up" delay={400} blur>
                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-8 sm:mb-12">
                            A DataGrip-inspired database client built right into your editor. Browse tables, run complex queries, manage schemas, and supercharge your workflow with our built-in MCP Server for AI tools.
                        </p>
                    </ScrollAnimate>
                    <ScrollAnimate direction="up" delay={500} blur className="w-full">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center w-full max-w-xs sm:max-w-none mx-auto">
                            <Link href="https://marketplace.visualstudio.com/items?itemName=QuickDB.quickdb" className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 flex items-center gap-3 relative overflow-hidden group border border-blue-500/30 hover:border-blue-500/60 select-none">
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none z-0"></div>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.653 2.193L5.438 10.957 2.025 8.441 1.05 9.406l4.636 4.316-4.636 4.318.974.965 3.413-2.515 12.215 8.764c.266.191.637.202.915.028.278-.173.447-.478.447-.803V2.418c0-.325-.17-.631-.447-.804-.278-.174-.649-.163-.915.028zm-2.02 14.869l-6.728-4.82 6.728-4.818v9.638z"/>
                                </svg>
                                <span className="relative z-10 text-base sm:text-lg">VS Code</span>
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-y-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </Link>
                            <Link href="https://open-vsx.org/extension/quickdb/quickdb" className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 flex items-center gap-3 relative overflow-hidden group border border-emerald-400/30 hover:border-emerald-400/60 select-none">
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none z-0"></div>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="relative z-10 text-base sm:text-lg">Antigravity</span>
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-y-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </Link>
                            <Link href="/" className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-bold rounded-xl transition-all border border-slate-700/50 hover:border-slate-500/60 shadow-[0_0_15px_rgba(255,255,255,0.01)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 backdrop-blur-md flex items-center gap-2 relative overflow-hidden group select-none">
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-0"></div>
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:-translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="relative z-10 text-base sm:text-lg">Portfolio</span>
                            </Link>
                        </div>
                    </ScrollAnimate>
                </div>
            </div>

            {/* MCP Intro Video/GIF */}
            <ScrollAnimate direction="up" delay={200} scale blur className="container mx-auto px-6 -mt-8 sm:-mt-16 relative z-20 mb-12 sm:mb-20 md:mb-32">
                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-slate-900 max-w-5xl mx-auto ring-1 ring-white/10 hover:shadow-[0_0_80px_rgba(59,130,246,0.3)] transition-shadow duration-700">
                    <img src="https://nazmulhaque.netlify.app/gifs/quickdb/mcp-server-intro.gif" alt="MCP Server Intro" className="w-full h-auto object-cover" />
                </div>
            </ScrollAnimate>

            {/* Features Grid */}
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] sm:w-full max-w-5xl h-[300px] sm:h-[500px] bg-purple-500/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />
                <ScrollAnimate direction="up" blur className="text-center mb-6 sm:mb-12 relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-white">Why QuickDB?</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">QuickDB turns VS Code into a powerhouse database management tool. Here's what makes it special.</p>
                </ScrollAnimate>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto relative z-10">
                    {/* Feature 1 */}
                    <ScrollAnimate direction="up" delay={100} blur>
                        <div className="group h-full bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-blue-300 transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-300 transition-colors">Universal Database Support</h3>
                            <p className="text-slate-400 leading-relaxed">Connect to PostgreSQL, MySQL, SQLite, MongoDB, and Redis—all from a single unified interface.</p>
                        </div>
                    </ScrollAnimate>

                    {/* Feature 2 */}
                    <ScrollAnimate direction="up" delay={200} blur>
                        <div className="group h-full bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-purple-300 transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-purple-300 transition-colors">AI-Ready with MCP Server</h3>
                            <p className="text-slate-400 leading-relaxed">Instantly expose your database schema and data to AI agents like Cursor, Claude Desktop, and Windsurf.</p>
                        </div>
                    </ScrollAnimate>

                    {/* Feature 3 */}
                    <ScrollAnimate direction="up" delay={300} blur>
                        <div className="group h-full bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] backdrop-blur-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-green-300 transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-green-300 transition-colors">Visual Query Builder</h3>
                            <p className="text-slate-400 leading-relaxed">Construct complex queries, joins, and aggregations visually—no SQL required.</p>
                        </div>
                    </ScrollAnimate>

                    {/* Feature 4 */}
                    <ScrollAnimate direction="up" delay={400} blur>
                        <div className="group h-full bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-pink-500/5 text-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-pink-300 transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-pink-300 transition-colors">Powerful Table Manager</h3>
                            <p className="text-slate-400 leading-relaxed">Create, modify, and visualize your schema with an intuitive UI.</p>
                        </div>
                    </ScrollAnimate>

                    {/* Feature 5 */}
                    <ScrollAnimate direction="up" delay={500} blur>
                        <div className="group h-full bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] backdrop-blur-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-orange-300 transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-orange-300 transition-colors">Data Visualization</h3>
                            <p className="text-slate-400 leading-relaxed">Instantly chart any query result into stunning, exportable Vega-Lite graphs.</p>
                        </div>
                    </ScrollAnimate>

                    {/* Feature 6 */}
                    <ScrollAnimate direction="up" delay={600} blur>
                        <div className="group h-full bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-teal-300 transition-all">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-teal-300 transition-colors">Import & Export</h3>
                            <p className="text-slate-400 leading-relaxed">Move data easily between SQL dumps, JSON, CSV, and Excel.</p>
                        </div>
                    </ScrollAnimate>
                </div>
            </div>

            {/* Showcase Section */}
            <div className="relative bg-slate-950/80 py-12 sm:py-20 md:py-32 border-t border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none" />
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <ScrollAnimate direction="up" blur>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-16 md:mb-20 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
                            See It in Action
                        </h2>
                    </ScrollAnimate>
                    
                    <div className="space-y-16 sm:space-y-28 md:space-y-40">
                        {/* Showcase 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-16 items-center">
                            <ScrollAnimate direction="right" delay={100} blur>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">Database Management <br/><span className="text-blue-400">&</span> Imports</h3>
                                    <p className="text-sm sm:text-lg text-slate-400 mb-4 sm:mb-6 leading-relaxed">Easily connect to your servers and import data seamlessly with our optimized engines.</p>
                                </div>
                            </ScrollAnimate>
                            <ScrollAnimate direction="left" delay={200} scale blur>
                                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-white/5 group hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] transition-shadow duration-500">
                                    <img src="https://nazmulhaque.netlify.app/gifs/quickdb/connect-server-import-database.gif" alt="Connect server" className="w-full group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            </ScrollAnimate>
                        </div>

                        {/* Showcase 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-16 items-center">
                            <ScrollAnimate direction="right" delay={200} scale blur className="order-2 lg:order-1">
                                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-1 ring-white/5 group hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] transition-shadow duration-500">
                                    <img src="https://nazmulhaque.netlify.app/gifs/quickdb/query-builder.gif" alt="Query Builder demo" className="w-full group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            </ScrollAnimate>
                            <ScrollAnimate direction="left" delay={100} blur className="order-1 lg:order-2">
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">Visual Query <span className="text-purple-400">Builder</span></h3>
                                    <p className="text-sm sm:text-lg text-slate-400 mb-4 sm:mb-6 leading-relaxed">Build complex SQL queries visually without writing code. Drag, drop, and join tables instantly.</p>
                                </div>
                            </ScrollAnimate>
                        </div>

                        {/* Showcase 3 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-16 items-center">
                            <ScrollAnimate direction="right" delay={100} blur>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">Connect with External <br/><span className="text-green-400">AI Clients</span></h3>
                                    <p className="text-sm sm:text-lg text-slate-400 mb-4 sm:mb-6 leading-relaxed">Connect QuickDB to your favorite AI assistant in just a few clicks using our built-in MCP server.</p>
                                    <ul className="space-y-3 sm:space-y-6 text-slate-300 text-sm sm:text-lg">
                                        <li className="flex items-start bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800/50 shadow-sm"><span className="text-green-400 font-bold mr-3 sm:mr-4 text-base sm:text-xl">1</span> Open the Setup Panel (Cmd+Shift+P)</li>
                                        <li className="flex items-start bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800/50 shadow-sm"><span className="text-green-400 font-bold mr-3 sm:mr-4 text-base sm:text-xl">2</span> Select your database connections</li>
                                        <li className="flex items-start bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800/50 shadow-sm"><span className="text-green-400 font-bold mr-3 sm:mr-4 text-base sm:text-xl">3</span> Copy the configuration snippet</li>
                                        <li className="flex items-start bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800/50 shadow-sm"><span className="text-green-400 font-bold mr-3 sm:mr-4 text-base sm:text-xl">4</span> Paste into your AI client (Cursor, Claude, etc.)</li>
                                    </ul>
                                </div>
                            </ScrollAnimate>
                            <ScrollAnimate direction="left" delay={200} scale blur>
                                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_40px_rgba(34,197,94,0.15)] ring-1 ring-white/5 group hover:shadow-[0_0_60px_rgba(34,197,94,0.25)] transition-shadow duration-500">
                                    <img src="https://nazmulhaque.netlify.app/gifs/quickdb/external-client-setup.gif" alt="External client setup" className="w-full group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            </ScrollAnimate>
                        </div>
                    </div>
                </div>
            </div>

            {/* Supported Databases Table */}
            <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24 border-t border-slate-800 relative z-10">
                <ScrollAnimate direction="up" blur className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center text-white">Supported Databases</h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-900/50 shadow-2xl backdrop-blur-md ring-1 ring-white/5 w-full">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700 shadow-sm">
                                    <th className="p-4 sm:p-5 font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-400">Database</th>
                                    <th className="p-4 sm:p-5 font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-400">Type</th>
                                    <th className="p-4 sm:p-5 font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-400">Port</th>
                                    <th className="p-4 sm:p-5 font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-400">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                <tr className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 sm:p-5 font-medium text-white flex items-center gap-2 sm:gap-3"><div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>SQLite</td>
                                    <td className="p-4 sm:p-5"><span className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-300 text-[10px] sm:text-xs font-bold rounded-full border border-blue-500/20">SQL</span></td>
                                    <td className="p-4 sm:p-5 text-slate-500 font-mono text-xs sm:text-sm">N/A</td>
                                    <td className="p-4 sm:p-5 text-slate-400 text-xs sm:text-sm">File-based, supports <code className="bg-slate-800 px-1 sm:px-2 py-0.5 rounded text-blue-200 border border-slate-700 text-xs sm:text-sm font-mono">:memory:</code></td>
                                </tr>
                                <tr className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 sm:p-5 font-medium text-white flex items-center gap-2 sm:gap-3"><div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>MySQL</td>
                                    <td className="p-4 sm:p-5"><span className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-300 text-[10px] sm:text-xs font-bold rounded-full border border-blue-500/20">SQL</span></td>
                                    <td className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-400">3306</td>
                                    <td className="p-4 sm:p-5 text-slate-400 text-xs sm:text-sm">Full INFORMATION_SCHEMA support</td>
                                </tr>
                                <tr className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 sm:p-5 font-medium text-white flex items-center gap-2 sm:gap-3"><div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>PostgreSQL</td>
                                    <td className="p-4 sm:p-5"><span className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-300 text-[10px] sm:text-xs font-bold rounded-full border border-blue-500/20">SQL</span></td>
                                    <td className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-400">5432</td>
                                    <td className="p-4 sm:p-5 text-slate-400 text-xs sm:text-sm">SSL/TLS supported</td>
                                </tr>
                                <tr className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 sm:p-5 font-medium text-white flex items-center gap-2 sm:gap-3"><div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-150 transition-transform"></div>MongoDB</td>
                                    <td className="p-4 sm:p-5"><span className="px-2 sm:px-3 py-1 bg-green-500/10 text-green-300 text-[10px] sm:text-xs font-bold rounded-full border border-green-500/20">NoSQL</span></td>
                                    <td className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-400">27017</td>
                                    <td className="p-4 sm:p-5 text-slate-400 text-xs sm:text-sm">Connection string or host/port</td>
                                </tr>
                                <tr className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 sm:p-5 font-medium text-white flex items-center gap-2 sm:gap-3"><div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-150 transition-transform"></div>Redis</td>
                                    <td className="p-4 sm:p-5"><span className="px-2 sm:px-3 py-1 bg-green-500/10 text-green-300 text-[10px] sm:text-xs font-bold rounded-full border border-green-500/20">NoSQL</span></td>
                                    <td className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-400">6379</td>
                                    <td className="p-4 sm:p-5 text-slate-400 text-xs sm:text-sm">All data types supported</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ScrollAnimate>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 bg-slate-950 py-12 text-center text-slate-500">
                <p>QuickDB - A VS Code Extension by Nazmul Haque</p>
                <div className="mt-4 flex justify-center gap-4">
                    <Link href="/" className="hover:text-blue-400 transition-colors">Portfolio Home</Link>
                    <span>&bull;</span>
                    <Link href="https://marketplace.visualstudio.com/items?itemName=QuickDB.quickdb" className="hover:text-blue-400 transition-colors">VS Code</Link>
                    <span>&bull;</span>
                    <Link href="https://open-vsx.org/extension/quickdb/quickdb" className="hover:text-blue-400 transition-colors">Antigravity</Link>
                </div>
            </div>
        </div>
    );
}
