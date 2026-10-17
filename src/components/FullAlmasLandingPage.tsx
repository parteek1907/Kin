'use client';

import React, { useState, useMemo } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  Building2, 
  GraduationCap, 
  Award, 
  FileText, 
  User, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  Globe, 
  Users, 
  CheckCircle2, 
  MapPin, 
  ExternalLink,
  Layers,
  Network,
  Smartphone,
  PlusCircle,
  Radio,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  ShieldCheck,
  Cpu,
  GitCommit,
  GitBranch
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import of living canvas for embedded section
const LivingNetworkCanvas = dynamic(
  () => import('@/components/LivingNetworkCanvas'),
  { ssr: false }
);

export default function FullAlmasLandingPage() {
  const {
    nodes,
    intents,
    selectNode,
    requestWarmVouch,
    toggleWhatsApp,
    setIsIngestModalOpen,
    setIsRadarModalOpen,
    selectIntent,
    activeIntentId
  } = useNetwork();

  const [activeNav, setActiveNav] = useState<'about' | 'mission' | 'services' | 'universities' | 'graph' | 'contact'>('about');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajor, setFilterMajor] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter alumni directory
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.proofOfWork?.repos?.[0]?.name && node.proofOfWork.repos[0].name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMajor = filterMajor === 'All' || 
        (filterMajor === 'Students' && node.persona === 'student') ||
        (filterMajor === 'Alumni' && (node.persona === 'alumni' || node.persona === 'founder')) ||
        (filterMajor === 'Faculty' && node.persona === 'faculty');

      return matchesSearch && matchesMajor;
    });
  }, [nodes, searchQuery, filterMajor]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredNodes.length / itemsPerPage) || 1;
  const paginatedNodes = filteredNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F0F3F7] text-slate-800 font-sans antialiased selection:bg-cyan-500 selection:text-white overflow-x-hidden">

      {/* =========================================================================
          1. STICKY TOP NAVIGATION BAR
         ========================================================================= */}
      <nav className="sticky top-0 z-50 w-full bg-[#0047BA] border-b border-blue-700/50 shadow-md px-4 sm:px-8 py-3.5 flex items-center justify-between text-white">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-md">
              <circle cx="20" cy="18" r="2.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="12" cy="28" r="1.5" fill="#FFFFFF" opacity="0.8" />
              <circle cx="28" cy="12" r="1.5" fill="#FFFFFF" opacity="0.7" />
              <polygon points="32,25 68,25 86,48 50,92 14,48" fill="#003B99" stroke="#FFFFFF" strokeWidth="2.5" />
              <polygon points="32,25 68,25 50,48" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
              <polygon points="32,25 50,48 14,48" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.5" />
              <polygon points="68,25 86,48 50,48" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
              <polygon points="14,48 50,48 50,92" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
              <polygon points="86,48 50,48 50,92" fill="#1E40AF" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>

          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white">
              Almas
            </div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white">
              Data
            </div>
          </div>
          <span className="hidden sm:inline-block ml-2 text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-blue-900/80 border border-blue-400/40 text-cyan-300 font-semibold uppercase">
            Alumni Network
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center space-x-7 text-xs font-medium text-blue-100">
          <button
            onClick={() => { setActiveNav('about'); scrollToSection('hero'); }}
            className="relative py-1 text-white font-semibold transition-colors flex flex-col items-center"
          >
            <span>About</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mt-1"></span>
          </button>

          <button
            onClick={() => { setActiveNav('mission'); scrollToSection('vision-mission'); }}
            className="py-1 hover:text-white transition-colors"
          >
            Our Mission
          </button>

          <button
            onClick={() => { setActiveNav('universities'); scrollToSection('for-universities'); }}
            className="py-1 hover:text-white transition-colors"
          >
            For Universities
          </button>

          <button
            onClick={() => { setActiveNav('services'); scrollToSection('directory'); }}
            className="py-1 hover:text-white transition-colors"
          >
            Directory
          </button>

          <button
            onClick={() => { setActiveNav('graph'); scrollToSection('living-graph'); }}
            className="py-1 hover:text-cyan-300 transition-colors flex items-center space-x-1"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-bold">Living Graph</span>
          </button>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center space-x-2.5">
          {/* Zero-Form Ingest */}
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 border border-blue-400/30 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span>+ Ingest GitHub Node</span>
          </button>

          {/* WhatsApp Bridge Trigger */}
          <button
            onClick={() => toggleWhatsApp()}
            className="relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span>WhatsApp Bridge</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </button>

          {/* Contact Pill */}
          <button
            onClick={() => scrollToSection('contact')}
            className="px-4 py-1.5 rounded-full bg-[#070D1E] hover:bg-black text-white text-xs font-semibold tracking-wide shadow-md transition-all border border-white/10"
          >
            Contact
          </button>
        </div>
      </nav>

      {/* =========================================================================
          2. SECTION 1: HERO SECTION (FULL WIDTH ROYAL BLUE)
         ========================================================================= */}
      <section id="hero" className="relative w-full bg-[#0047BA] text-white pt-16 sm:pt-24 pb-36 px-4 sm:px-12 lg:px-20 overflow-hidden">
        
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/80 border border-cyan-400/30 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>CAMPUS PROOF-OF-WORK & INTENT NETWORK</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Discover<br />
              your data diamond 💎<br />
              with Almas Data.
            </h1>

            {/* Curved underline flourish */}
            <div className="w-36 h-2 bg-gradient-to-r from-cyan-400 via-blue-300 to-transparent rounded-full"></div>

            <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed max-w-xl">
              Building a Network, Not a Directory. We replace static resume forms with <strong>zero-form artifact verification</strong>, live problem broadcast capsules, and <strong>1-tap warm faculty/alumni WhatsApp routing</strong>.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => scrollToSection('living-graph')}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#0047BA] font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Network className="w-4 h-4 text-[#0047BA]" />
                <span>Explore Living Network Graph ↓</span>
              </button>

              <button
                onClick={() => setIsIngestModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-sm border border-blue-400/40 shadow-lg transition-all flex items-center space-x-2"
              >
                <Cpu className="w-4 h-4 text-cyan-300" />
                <span>+ Ingest GitHub Node</span>
              </button>

              <button
                onClick={() => toggleWhatsApp()}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2"
              >
                <Smartphone className="w-4 h-4 text-white" />
                <span>Open WhatsApp Bridge</span>
              </button>
            </div>

            {/* Live Ecosystem Telemetry */}
            <div className="pt-4 flex items-center space-x-6 text-xs font-mono text-blue-200">
              <div>
                <span className="font-extrabold text-white text-base block">{nodes.length}</span>
                <span>Verified Nodes</span>
              </div>
              <div className="w-[1px] h-8 bg-blue-400/30"></div>
              <div>
                <span className="font-extrabold text-white text-base block">60+</span>
                <span>Trust Edges</span>
              </div>
              <div className="w-[1px] h-8 bg-blue-400/30"></div>
              <div>
                <span className="font-extrabold text-cyan-300 text-base block">88.4%</span>
                <span>Warm Vouch Rate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Arched Constellation Network & World Map */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* World Map Dot Matrix */}
            <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 500 300" className="w-full h-full">
                {Array.from({ length: 90 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={30 + (i % 18) * 26 + (Math.sin(i) * 8)}
                    cy={25 + Math.floor(i / 18) * 50 + (Math.cos(i) * 8)}
                    r="1.8"
                    fill="#FFFFFF"
                  />
                ))}
              </svg>
            </div>

            {/* Arched Campus Constellation Graph Canvas */}
            <div className="relative w-full max-w-[480px] h-[340px]">
              <svg viewBox="0 0 480 340" className="w-full h-full overflow-visible">
                {/* Connecting Curved Arcs */}
                <path
                  d="M 60 210 Q 240 40 420 210"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeDasharray="6 4"
                  className="opacity-80"
                />
                <path
                  d="M 60 210 Q 240 120 240 60"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="opacity-90"
                />
                <path
                  d="M 240 60 Q 240 120 420 210"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="opacity-90"
                />
                <path
                  d="M 50 120 Q 180 80 290 145"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  className="opacity-70"
                />
                <path
                  d="M 290 145 Q 380 90 400 120"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  className="opacity-70"
                />
                <path
                  d="M 170 270 Q 290 200 420 210"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  className="opacity-70"
                />
              </svg>

              {/* Node 1: Top Center — University Building Pin */}
              <div 
                onClick={() => scrollToSection('living-graph')}
                className="absolute top-[35px] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center transform hover:scale-125 transition-transform cursor-pointer group"
                title="University Campus Node"
              >
                <Building2 className="w-6 h-6 text-[#0047BA] group-hover:text-cyan-600 transition-colors" />
              </div>

              {/* Node 2: Top Left — Graduation Cap Pin */}
              <div 
                onClick={() => scrollToSection('directory')}
                className="absolute top-[95px] left-[40px] w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center transform hover:scale-125 transition-transform cursor-pointer"
                title="Student Builders"
              >
                <GraduationCap className="w-5 h-5 text-[#0047BA]" />
              </div>

              {/* Node 3: Center — The Data Diamond Node (💎) */}
              <div 
                onClick={() => scrollToSection('living-graph')}
                className="absolute top-[125px] left-[265px] w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-glow-cyan p-0.5 flex items-center justify-center transform hover:scale-125 transition-transform animate-bounce cursor-pointer"
                title="Verified Data Diamond Node"
              >
                <div className="w-full h-full bg-[#0047BA] rounded-[14px] flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
              </div>

              {/* Node 4: Top Right — Academic Certificate Pin */}
              <div 
                onClick={() => scrollToSection('for-universities')}
                className="absolute top-[90px] right-[55px] w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center transform hover:scale-125 transition-transform cursor-pointer"
                title="Academic Proofs"
              >
                <Award className="w-5 h-5 text-[#0047BA]" />
              </div>

              {/* Node 5: Bottom Left — Cap & Gown Student Pin */}
              <div 
                onClick={() => scrollToSection('directory')}
                className="absolute bottom-[65px] left-[65px] w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center transform hover:scale-125 transition-transform cursor-pointer"
                title="Flagship Builders"
              >
                <GraduationCap className="w-5 h-5 text-[#0047BA]" />
              </div>

              {/* Node 6: Bottom Center — User Avatar Pin */}
              <div 
                onClick={() => scrollToSection('directory')}
                className="absolute bottom-[35px] left-[195px] w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center transform hover:scale-125 transition-transform cursor-pointer"
                title="Alumni Leaders"
              >
                <User className="w-5 h-5 text-[#0047BA]" />
              </div>

              {/* Node 7: Bottom Right — Document / Paper Pin */}
              <div 
                onClick={() => scrollToSection('for-universities')}
                className="absolute bottom-[65px] right-[40px] w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center transform hover:scale-125 transition-transform cursor-pointer"
                title="Research Pre-Prints"
              >
                <FileText className="w-5 h-5 text-[#0047BA]" />
              </div>
            </div>
          </div>
        </div>

        {/* Folded Cyan Ribbon Accent near the seam */}
        <div className="absolute -bottom-8 left-12 sm:left-28 z-20 w-20 h-28 transform -rotate-45 pointer-events-none drop-shadow-2xl">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="20,10 80,10 50,90 10,70" fill="#27C5FF" />
            <polygon points="10,70 50,90 35,98" fill="#0099DD" />
          </svg>
        </div>
      </section>

      {/* =========================================================================
          3. ASYMMETRIC ANGLED DIVIDER (SLOPING UPWARD FROM LEFT TO RIGHT)
         ========================================================================= */}
      <div className="relative w-full h-16 sm:h-20 -mt-14 sm:-mt-16 overflow-hidden z-20 pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full fill-[#F0F3F7]"
        >
          <polygon points="0,120 1200,120 1200,15 0,90" />
        </svg>

        {/* Floating circular diamond badge on the right angled seam */}
        <div 
          onClick={() => scrollToSection('hero')}
          className="absolute right-8 sm:right-16 top-2 w-12 h-12 rounded-full bg-white shadow-2xl border border-slate-200 flex items-center justify-center pointer-events-auto transform hover:scale-115 transition-transform cursor-pointer"
        >
          <span className="text-xl">💎</span>
        </div>
      </div>

      {/* =========================================================================
          4. SECTION 2: VISION & MISSION (PANORAMIC CITY SKYLINE BACKGROUND)
         ========================================================================= */}
      <section id="vision-mission" className="relative w-full min-h-[640px] bg-slate-900 overflow-hidden flex flex-col justify-end py-16 px-4 sm:px-12 lg:px-20">
        
        {/* Full-width scenic background: Graduate student overlooking panoramic city skyline */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/graduate_skyline.jpg')`,
            backgroundPosition: 'center 40%'
          }}
        >
          {/* Subtle gradient overlay to make cards stand out */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
        </div>

        {/* Floating Vision & Mission Cards sitting above the graduate */}
        <div className="max-w-6xl mx-auto w-full relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          
          {/* CARD 1: OUR VISION (With Cyan Top-Right Accent Border) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border-t-4 border-r-4 border-[#00B4D8] rounded-tr-[40px] transform hover:-translate-y-1.5 transition-all">
            {/* Logo lockup: OUR VISION */}
            <div className="flex items-center space-x-1 mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-wider text-[#0047BA] uppercase flex items-center space-x-1">
                  <span>OUR</span>
                  <span className="text-cyan-500">▶</span>
                </span>
                <span className="text-2xl font-extrabold text-[#0047BA] tracking-tight leading-none">
                  VISION
                </span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mb-3 leading-snug">
              Help universities to grow.
            </h3>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              We believe that university success is built upon supporting the growth of their alumni. Conduit transforms inactive campus rosters into living, proof-of-work referral networks.
            </p>
          </div>

          {/* CARD 2: OUR MISSION (With Cyan Bottom-Left Accent Border) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border-b-4 border-l-4 border-[#00B4D8] rounded-bl-[40px] transform hover:-translate-y-1.5 transition-all">
            {/* Logo lockup: OUR Mission */}
            <div className="flex items-center space-x-1 mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-wider text-[#0047BA] uppercase flex items-center space-x-1">
                  <span>OUR</span>
                  <span className="text-amber-500">↗</span>
                </span>
                <span className="text-2xl font-extrabold text-[#0047BA] tracking-tight leading-none">
                  Mission
                </span>
              </div>
            </div>

            <p className="text-lg sm:text-xl font-bold text-[#0F172A] leading-relaxed pt-2">
              To become the most well-known Academic Social Network, uniting student builders, faculty researchers, and venture founders across verified engineering proofs.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECTION 3: "WHY TRACER? / FOR UNIVERSITIES"
         ========================================================================= */}
      <section id="for-universities" className="py-20 px-4 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Institutional Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Why Tracer? Built For Modern Universities.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Traditional alumni portals suffer from a 92% inactivity rate because they demand manual data entry. Conduit automates connection through real artifacts.
          </p>
        </div>

        {/* Split Showcase Banner (Deep Blue Wireframe Mesh + Campus Building) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200/80 mb-14 bg-white">
          {/* Left Side: Deep Blue with 3D Wireframe Wave */}
          <div className="lg:col-span-7 bg-[#0047BA] p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div
              className="absolute inset-0 opacity-45 mix-blend-screen bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('/images/wireframe_terrain.jpg')` }}
            />
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-400/40 inline-block">
                Ecosystem Infrastructure
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                For Universities
              </h3>
              <p className="text-blue-100 text-sm sm:text-base max-w-md leading-relaxed">
                Connect campus research labs, student developers, and alumni founder networks through verified engineering commits and 1-tap warm trust paths.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex items-center space-x-4 text-xs font-mono text-cyan-300">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Zero Cold DMs</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>AST Artifact Verification</span>
              </span>
            </div>
          </div>

          {/* Right Side: University Architecture Photo */}
          <div className="lg:col-span-5 relative bg-slate-100 overflow-hidden min-h-[280px]">
            <img
              src="/images/university_building.jpg"
              alt="Modern University Campus Building"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* "You can ..." 4-Column Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white shadow-md border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              <Globe className="w-5 h-5 text-[#0047BA]" />
            </div>
            <h4 className="font-extrabold text-base text-[#0F172A]">Worldwide Network</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect to a worldwide network of your students, alumni, faculty, researchers, and venture founders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-lg">
              <Search className="w-5 h-5 text-cyan-600" />
            </div>
            <h4 className="font-extrabold text-base text-[#0F172A]">Multi-Vector Search</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search all alumni by major, region, industry, employer, graduation year, verified tech stack, and career path.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <GitBranch className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-extrabold text-base text-[#0F172A]">Zero-Form Verification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Expertise extracted directly from real GitHub commits and IEEE papers. No self-reported keyword lists.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-slate-200/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              <Smartphone className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="font-extrabold text-base text-[#0F172A]">1-Tap WhatsApp Bridge</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Busy alumni and professors vouch for students and drop intents via WhatsApp without logging into a website.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION 4: INTERACTIVE ALUMNI & STUDENT DIRECTORY REGISTRY TABLE
         ========================================================================= */}
      <section id="directory" className="py-16 px-4 sm:px-12 lg:px-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-[#0047BA] uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>Alumni & Student Registry</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Search Verified Campus Proof-of-Work
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 p-1 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-bold">
              {['All', 'Students', 'Alumni', 'Faculty'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setFilterMajor(tab); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterMajor === tab
                      ? 'bg-[#0047BA] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, role, major, repository, or verified code commit..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0047BA] font-mono"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Directory Records Table */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3.5 px-4 font-bold">Member</th>
                    <th className="py-3.5 px-4 font-bold">Persona</th>
                    <th className="py-3.5 px-4 font-bold">Major & Department</th>
                    <th className="py-3.5 px-4 font-bold">Top Verified Repo</th>
                    <th className="py-3.5 px-4 font-bold text-center">Impact Score</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedNodes.map(member => (
                    <tr key={member.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Member Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-sm"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{member.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{member.handle}</div>
                          </div>
                        </div>
                      </td>

                      {/* Persona Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          member.persona === 'student' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                          member.persona === 'founder' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          member.persona === 'alumni' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          member.persona === 'faculty' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {member.persona}
                        </span>
                      </td>

                      {/* Major / Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{member.role}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {member.department} {member.gradYear ? `('${member.gradYear})` : ''}
                        </div>
                      </td>

                      {/* Top Repo */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {member.proofOfWork?.repos?.[0] ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0047BA] block truncate max-w-xs">
                              {member.proofOfWork.repos[0].name}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Commit #{member.proofOfWork.repos[0].recentCommitHash}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Institutional Faculty</span>
                        )}
                      </td>

                      {/* Impact Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-50 text-[#0047BA] font-mono font-extrabold text-xs border border-blue-200">
                          {member.proofOfWork?.verifiedImpactScore || 85} / 100
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            selectNode(member.id);
                            requestWarmVouch(member.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0047BA] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Request Vouch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNodes.length)} of {filteredNodes.length} members</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. SECTION 5: EMBEDDED LIVING FORCE-DIRECTED CANVAS NETWORK
         ========================================================================= */}
      <section id="living-graph" className="py-20 px-4 sm:px-12 lg:px-20 bg-[#07090E] text-white relative">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              <Network className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Interactive Physics Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The Living Campus Trust Graph
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              32 verified nodes and 60+ weighted trust edges. Click any node to inspect code citations, run preset intent queries, and illuminate multi-hop warm routes.
            </p>
          </div>

          {/* Preset Intent Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-4">
            {[
              { id: 'intent-founder-fintech', icon: '🚀', label: 'Fintech Offline Sync + WebCrypto' },
              { id: 'intent-faculty-rag', icon: '🔬', label: 'Multimodal OCR + RAG' },
              { id: 'intent-recruiter-systems', icon: '💼', label: 'FastAPI & pgvector Systems' },
              { id: 'intent-student-ar', icon: '🎓', label: 'AR Campus Mesh Review' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => selectIntent(activeIntentId === preset.id ? null : preset.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeIntentId === preset.id
                    ? 'bg-cyan-500 text-[#07090E] border-cyan-400 shadow-glow-cyan'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Embedded Full-Featured Force-Directed Graph Viewport */}
          <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#07090E]">
            <LivingNetworkCanvas />
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. SECTION 6: INSTITUTIONAL OPPORTUNITY & SKILL-GAP RADAR
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-12 lg:px-20 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-[#0047BA] uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-[#0047BA]" />
              <span>Real-Time Macro Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Institutional Skill-Gap Radar
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mt-1">
              Live supply vs demand analytics comparing industry founder requests with student codebases.
            </p>
          </div>

          <button
            onClick={() => setIsRadarModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Open Dean & TBI Executive Radar</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200/80 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">WARM VOUCH CONVERSION</span>
            <div className="text-4xl font-extrabold text-emerald-600 font-mono">88.4%</div>
            <p className="text-xs text-slate-500">vs 7.2% industry average on cold LinkedIn / cold InMail DMs</p>
          </div>

          <div className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200/80 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">WHATSAPP RESPONSE TIME</span>
            <div className="text-4xl font-extrabold text-blue-600 font-mono">4.2 min</div>
            <p className="text-xs text-slate-500">Average faculty & alumni vouch response time via zero-login bridge</p>
          </div>

          <div className="p-6 rounded-3xl bg-white shadow-lg border border-slate-200/80 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">ROUTED OPPORTUNITIES</span>
            <div className="text-4xl font-extrabold text-amber-500 font-mono">₹1.84 Cr</div>
            <p className="text-xs text-slate-500">Paid engineering sprints, fellowships & angel seed contracts</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
         ========================================================================= */}
      <footer id="contact" className="w-full bg-[#0047BA] text-white py-14 px-4 sm:px-12 lg:px-20 border-t border-blue-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💎</span>
              <span className="text-xl font-extrabold tracking-tight">AlmasData Alumni Network</span>
            </div>
            <p className="text-xs text-blue-100 max-w-sm leading-relaxed">
              Theme: Building a Network, Not a Directory. Built for university research ecosystems, engineering builders, and alumni founders.
            </p>
          </div>

          <div className="md:col-span-7 flex flex-wrap items-center justify-end gap-4 text-xs font-mono">
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              + Ingest Proof-of-Work
            </button>
            <button
              onClick={() => toggleWhatsApp()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07090E] font-extrabold transition-colors"
            >
              WhatsApp Bridge
            </button>
            <button
              onClick={() => scrollToSection('hero')}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-blue-600/60 text-center text-[11px] text-blue-200 font-mono">
          © 2026 Almas Data / Conduit Living Network. All rights reserved. Zero-form artifact verification.
        </div>
      </footer>
    </div>
  );
}
