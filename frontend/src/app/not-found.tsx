import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-zinc-400 uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          404 • Node Not Located
        </div>

        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-3 font-sans">
          Route Not Found
        </h1>

        <p className="text-sm md:text-base text-zinc-400 font-normal leading-relaxed mb-8 max-w-sm">
          The requested coordinate does not exist on the Kin Proof Network graph or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-all duration-200 shadow-lg text-center"
          >
            Return to Nexus
          </Link>
          <Link
            href="/network"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-all duration-200 text-center"
          >
            Explore Proof Graph
          </Link>
        </div>
      </div>
    </main>
  );
}
