"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useNetwork } from '@/context/NetworkContext';
import { PersonaType } from '@/types';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ShieldCheck,
  GitCommit,
  ArrowRight,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  MessageCircle,
  ChevronDown,
  LayoutDashboard,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Dynamic import for the architecture kinetic stack
const ConnoisseurStackInteractor = dynamic(
  () => import('@/components/ui/connoisseur-stack-interactor'),
  { ssr: false }
);

/* ─────────────────────────────────────────────────────────────
   CUSTOM MINIMALISM "KIN" LOGO
   Geometric anchor pillar + dual diagonal kinship rays + terracotta junction node
   ───────────────────────────────────────────────────────────── */
export function KinLogo({ className = "w-8 h-8", markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Bespoke Geometric Minimalist K Mark */}
      <div className={`relative ${className} rounded-xl bg-[#141815] flex items-center justify-center p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-300`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Vertical anchor pillar */}
          <line x1="6.5" y1="4.5" x2="6.5" y2="19.5" stroke="currentColor" />
          {/* Upper kinship diagonal */}
          <line x1="17" y1="5.5" x2="7" y2="12" stroke="currentColor" />
          {/* Lower kinship diagonal */}
          <line x1="8" y1="11.5" x2="17.5" y2="19" stroke="currentColor" />
          {/* Precision terracotta connection node */}
          <circle cx="11.8" cy="12" r="1.75" fill="#E25C38" />
        </svg>
      </div>

      {!markOnly && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-[18px] tracking-[-0.05em] text-[#141815] font-sans">KIN</span>
          <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-black/[0.04] text-zinc-500 font-semibold border border-black/[0.06]">
            network
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FADE-IN SECTION — Animates on scroll into view
   ───────────────────────────────────────────────────────────── */
function FadeInSection({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const dirMap = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCALE-ON-SCROLL CARD — Scales smoothly as it enters
   ───────────────────────────────────────────────────────────── */
function ScaleCard({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED NUMBER COUNTER
   ───────────────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1600;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN KIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function NexusLandingPage() {
  const {
    nodes,
    toggleWhatsApp
  } = useNetwork();
  const { user, isLoggedIn, userInitial, openAuthModal, logout } = useAuth();

  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Nav hide/show on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setNavVisible(currentY < 100 || currentY < lastScrollY);
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Hero parallax scroll animation
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.6], [1, 0]);

  // How it works scroll ref
  const howItWorksRef = useRef(null);

  const totalVerifiedCommits = useMemo(() => {
    return nodes.reduce((acc, curr) => acc + (curr.proofOfWork?.totalCommits || 0), 0);
  }, [nodes]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchInput.trim()) return;
    toggleWhatsApp(true, 'intent-drop');
  };

  const personaCards = [
    { id: 'founder' as PersonaType, label: 'FOUNDERS', stat: '18', statLabel: 'YC / SEED', icon: Briefcase, bg: 'bg-[#F5B853]', text: 'text-[#1F1707]', desc: 'Alumni founders scouting verified builders for founding engineer roles.', shadowColor: 'rgba(245,184,83,0.25)' },
    { id: 'faculty' as PersonaType, label: 'FACULTY', stat: '14', statLabel: 'LABS', icon: GraduationCap, bg: 'bg-[#8EC3E6]', text: 'text-[#0D2132]', desc: 'Academic advisors providing warm 1-hop vouches and research citations.', shadowColor: 'rgba(142,195,230,0.25)' },
    { id: 'alumni' as PersonaType, label: 'ALUMNI', stat: '42', statLabel: 'MENTORS', icon: Users, bg: 'bg-[#EB7A53]', text: 'text-white', desc: 'Senior engineers at top companies offering 1-tap WhatsApp introductions.', shadowColor: 'rgba(235,122,83,0.25)' },
    { id: 'recruiter' as PersonaType, label: 'RECRUITERS', stat: '$120K', statLabel: 'GRANTS', icon: Building2, bg: 'bg-[#2A5239]', text: 'text-white', desc: 'Campus scouts and talent partners cutting through resume noise.', shadowColor: 'rgba(42,82,57,0.25)' },
  ];

  const featureRows = [
    { num: '01', title: 'AST Code Verification', desc: 'Zero-form verification. We parse technical repos at the AST level to extract real dependencies, languages, and commit velocity.', icon: GitCommit, accent: '#E25C38' },
    { num: '02', title: '1-Tap WhatsApp Bridge', desc: 'One-tap warm introductions through WhatsApp. No cold emails, no LinkedIn InMail — just verified trust handshakes.', icon: MessageCircle, accent: '#25D366' },
    { num: '03', title: 'Shortest Trust Paths', desc: 'Every introduction runs through the shortest trust path. Real advisors vouch for real peers — no unvetted noise.', icon: ShieldCheck, accent: '#254B33' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F5F0] text-[#141815] font-sans overflow-x-hidden relative selection:bg-[#E25C38]/20 selection:text-[#E25C38]">

      {/* ═══════════════════════════════════════════════════════
          FLOATING NAVIGATION — Fixed, sleek minimalist header
          ═══════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 z-50 w-full px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto">
          <nav className="w-full backdrop-blur-2xl bg-white/85 border border-black/[0.07] shadow-[0_8px_32px_rgba(20,24,21,0.04)] rounded-2xl px-5 py-3 flex items-center justify-between transition-all">

            {/* Brand Logo & Wordmark */}
            <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 group focus:outline-none">
              <KinLogo />
            </button>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-[13px] font-medium text-zinc-500">
              {[
                { label: 'Network', target: 'personas' },
                { label: 'How it works', target: 'how-it-works' },
                { label: 'Architecture', target: 'architecture' },
              ].map(link => (
                <button
                  key={link.target}
                  onClick={() => scrollTo(link.target)}
                  className="px-3.5 py-1.5 rounded-xl hover:bg-black/[0.04] hover:text-[#141815] transition-all cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Action: Get started / User Initial + Dashboard */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-zinc-600 hover:text-black hover:bg-black/[0.04] text-[13px] font-semibold transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#E25C38]" />
                <span>Dashboard</span>
              </Link>

              {isLoggedIn ? (
                <div className="relative group">
                  <button
                    onClick={openAuthModal}
                    title={`Logged in as ${user?.name}`}
                    className="w-9 h-9 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center hover:scale-105 transition-all shadow-md cursor-pointer border border-black/10"
                  >
                    {userInitial}
                  </button>
                  <div className="absolute right-0 top-11 hidden group-hover:flex flex-col p-3 rounded-2xl bg-white border border-black/[0.08] shadow-xl w-48 text-xs z-50">
                    <span className="font-bold text-slate-900 truncate">{user?.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate mb-2">{user?.email}</span>
                    <div className="w-full h-[1px] bg-slate-100 my-1" />
                    <Link
                      href="/dashboard"
                      className="w-full py-1.5 rounded-lg hover:bg-slate-50 font-semibold transition-colors text-left px-2 text-slate-800"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 font-semibold transition-colors text-left px-2 text-slate-600 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141815] hover:bg-[#2A2A2A] text-white text-[13px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_rgba(0,0,0,0.12)] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#E25C38]" />
                  <span>Get started</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════
          HERO — Clean, editorial typography
          ═══════════════════════════════════════════════════════ */}
      <section id="hero" ref={heroRef} className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12 overflow-hidden">

        {/* Warm ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-[#F5B853]/15 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-[15%] w-[400px] h-[400px] bg-[#8EC3E6]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-[30%] w-[600px] h-[600px] bg-[#EB7A53]/10 rounded-full blur-[140px]" />
        </div>

        {/* Fine tactile grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          {/* Main Headline */}
          <FadeInSection delay={0.1}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-black text-[#141815] tracking-tight leading-[1.05] max-w-4xl mx-auto font-serif">
              A Living Network.
              <br />
              <span className="text-[#E25C38]">Not a Dead Directory.</span>
            </h1>
          </FadeInSection>

          {/* Subtitle */}
          <FadeInSection delay={0.2}>
            <p className="text-base sm:text-xl text-zinc-500 mt-6 max-w-2xl mx-auto font-normal leading-relaxed">
              Connecting students, alumni, and faculty through verified technical artifacts, shortest trust paths, and 1-tap WhatsApp introductions.
            </p>
          </FadeInSection>

          {/* Search Input Bar */}
          <FadeInSection delay={0.3}>
            <form onSubmit={handleHeroSearch} className="mt-10 max-w-xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl border border-black/[0.08] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-black/[0.15] transition-all">
                <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Find YC founders looking for Rust / Next.js builders..."
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-transparent text-sm text-[#141815] placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#141815] hover:bg-[#2A2A2A] text-white text-xs font-semibold shrink-0 transition-all hover:scale-[1.02] flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sample intent query pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[12px] text-zinc-500">
                {[
                  'Fintech seed startup seeking student with WebCrypto...',
                  'Seeking 2 undergrad researchers with PyTorch...',
                  'Hiring systems engineer with real FastAPI commits...',
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setHeroSearchInput(sample);
                      toggleWhatsApp(true, 'intent-drop');
                    }}
                    className="px-3 py-1 rounded-lg bg-white/80 hover:bg-white border border-black/[0.05] text-zinc-600 hover:text-[#141815] transition-all truncate max-w-[280px]"
                  >
                    : &quot;{sample}&quot;
                  </button>
                ))}
              </div>
            </form>
          </FadeInSection>

          {/* Stats Bar */}
          <FadeInSection delay={0.4}>
            <div className="flex items-center justify-center gap-8 sm:gap-16 pt-10 mt-6 border-t border-black/[0.06] text-center">
              {[
                { value: nodes.length, label: 'Verified Nodes', suffix: '+' },
                { value: totalVerifiedCommits, label: 'AST Commits', suffix: '' },
                { value: 91, label: 'Vouch Rate', suffix: '%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#141815] tabular-nums">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-400 cursor-pointer"
          onClick={() => scrollTo('personas')}
        >
          <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PERSONA BENTO GRID
          ═══════════════════════════════════════════════════════ */}
      <section id="personas" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <FadeInSection>
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400 font-semibold">
              WHO&apos;S ON KIN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#141815] mt-2">
              Four personas. One network.
            </h2>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personaCards.map((card, i) => (
            <ScaleCard key={card.id} delay={i * 0.08}>
              <motion.div
                onClick={() => scrollTo('how-it-works')}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`p-6 rounded-3xl ${card.bg} ${card.text} cursor-pointer min-h-[200px] flex flex-col justify-between relative overflow-hidden group`}
                style={{ boxShadow: `0 12px 36px ${card.shadowColor}` }}
              >
                {/* Decorative circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
                      {card.stat} {card.statLabel}
                    </span>
                    <card.icon className="w-5 h-5 opacity-80" />
                  </div>
                  <h3 className="text-xl font-black mt-4 tracking-tight">{card.label}</h3>
                  <p className="text-xs mt-2 leading-relaxed opacity-85">{card.desc}</p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 text-xs font-semibold">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </ScaleCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Editorial 3-Step Walkthrough
          ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" ref={howItWorksRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400 font-semibold">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#141815] tracking-tight mt-2">
                From code to connections<span className="text-[#E25C38]">.</span>
              </h2>
            </div>
          </FadeInSection>

          {/* Staggered rows */}
          <div className="space-y-4">
            {featureRows.map((row, i) => (
              <FadeInSection key={row.num} delay={i * 0.1}>
                <motion.div
                  whileHover={{ x: 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:border-black/[0.12] transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Number */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[40px] sm:text-[56px] font-black text-[#F3EFEA] group-hover:text-[#E25C38]/20 transition-colors leading-none tabular-nums">{row.num}</span>
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
                        style={{ backgroundColor: row.accent + '15' }}
                      >
                        <row.icon className="w-5 h-5" style={{ color: row.accent }} />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#141815] tracking-tight">{row.title}</h3>
                      <p className="text-sm text-zinc-500 mt-2 leading-relaxed max-w-xl">{row.desc}</p>
                    </div>
                    {/* Arrow */}
                    <div className="hidden sm:flex items-center self-center">
                      <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-[#E25C38] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ARCHITECTURE — Kinetic Stack
          ═══════════════════════════════════════════════════════ */}
      <section id="architecture" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <FadeInSection>
          <div className="mb-10 text-center">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400 font-semibold">
              ENGINEERING SPECS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#141815] tracking-tight mt-1">
              Engineered for pure signal<span className="text-[#E25C38]">.</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-xl mx-auto">
              Hover over each pillar to inspect kinetic optical SVG apertures and architecture specifications.
            </p>
          </div>
        </FadeInSection>

        <ScaleCard>
          <ConnoisseurStackInteractor />
        </ScaleCard>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER — Fixed, high-end editorial footer
          ═══════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-black/[0.08] pt-16 pb-12 px-4 sm:px-6 mt-16 bg-white/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
            {/* Col 1: Brand & Mission */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <KinLogo />
              </div>
              <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                The Living Campus Trust & Kinship Network. Connecting students, alumni, and faculty through verified technical artifacts and warm 1-tap introductions.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Network Operational • IIITD
                </span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">Navigation</h4>
              <ul className="space-y-2.5 text-sm text-zinc-600">
                <li>
                  <button onClick={() => scrollTo('personas')} className="hover:text-[#141815] transition-colors cursor-pointer text-left">
                    Network
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#141815] transition-colors cursor-pointer text-left">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('architecture')} className="hover:text-[#141815] transition-colors cursor-pointer text-left">
                    Architecture Specs
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Ecosystem */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">Ecosystem</h4>
              <ul className="space-y-2.5 text-sm text-zinc-600">
                <li className="text-zinc-500">Student Builders</li>
                <li className="text-zinc-500">Alumni Founders</li>
                <li className="text-zinc-500">Faculty Advisors</li>
                <li className="text-zinc-500">IIITD HackShift 2026</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
            <div>© 2026 KIN. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Zero-Cold Outreach</span>
              <span>•</span>
              <span>Warm Trust Paths</span>
              <span>•</span>
              <span>IIITD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
