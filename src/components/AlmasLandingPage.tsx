'use client';

import React, { useState } from 'react';
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
  Network
} from 'lucide-react';

interface AlmasLandingPageProps {
  onSwitchToCommandCenter?: () => void;
}

export default function AlmasLandingPage({ onSwitchToCommandCenter }: AlmasLandingPageProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'mission' | 'services' | 'contact'>('about');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('All Majors');

  // Sample alumni directory records for the bottom table preview (as shown in the left card)
  const alumniDirectory = [
    {
      id: 'alm-1',
      name: 'Parteek Garg',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      major: 'Computer Science & Data Science',
      gradYear: '2025',
      company: 'NexaPay / Systems Lab',
      role: 'Founding Protocol Engineer',
      status: 'Verified Proof-of-Work',
      location: 'New Delhi, India'
    },
    {
      id: 'alm-2',
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      major: 'Computer Science',
      gradYear: '2019',
      company: 'NexaPay (YC W22)',
      role: 'Founder & CEO',
      status: 'Alumni Founder',
      location: 'Bengaluru / San Francisco'
    },
    {
      id: 'alm-3',
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80',
      major: 'Computer Science',
      gradYear: '2020',
      company: 'Razorpay Core Protocols',
      role: 'Staff Systems Architect',
      status: 'Senior Alumna',
      location: 'Bengaluru, India'
    },
    {
      id: 'alm-4',
      name: 'Vikramaditya Singhania',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      major: 'Computer Science & Geomatics',
      gradYear: '2018',
      company: 'Omnispatial AR',
      role: 'CTO & Co-Founder',
      status: 'DeepTech Founder',
      location: 'Delhi NCR, India'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#E9EDF2] py-6 px-3 sm:px-8 flex flex-col items-center justify-start font-sans text-slate-800 antialiased selection:bg-cyan-500 selection:text-white">
      
      {/* Top Floating Control Bar (To toggle between Showcase Mockup & Living Graph) */}
      <div className="w-full max-w-7xl mb-4 flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
            Almas Data Alumni Network // Pixel-Perfect Design Showcase
          </span>
        </div>

        {onSwitchToCommandCenter && (
          <button
            onClick={onSwitchToCommandCenter}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Network className="w-4 h-4 text-white animate-pulse" />
            <span>Launch Conduit Interactive Graph Engine →</span>
          </button>
        )}
      </div>

      {/* Main Container Mimicking the Showcase Canvas in the Reference Image */}
      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-stretch justify-center gap-6">

        {/* =========================================================================
            LEFT CARD (Underneath / Secondary View in Mockup): "Why Tracer? / For Universities"
           ========================================================================= */}
        <div className="w-full lg:w-[42%] bg-white rounded-[36px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between">
          
          {/* Top Brand Tag Badge */}
          <div className="p-6 pb-2">
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white shadow-md border border-slate-100">
              {/* Faceted Diamond Logo Small */}
              <div className="w-7 h-7 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-7 h-7">
                  <polygon points="30,25 70,25 88,48 50,92 12,48" fill="#0047BA" />
                  <polygon points="30,25 70,25 50,48" fill="#2563EB" />
                  <polygon points="30,25 50,48 12,48" fill="#38BDF8" />
                  <polygon points="70,25 88,48 50,48" fill="#1D4ED8" />
                  <polygon points="12,48 50,48 50,92" fill="#1E40AF" />
                  <polygon points="88,48 50,48 50,92" fill="#003580" />
                  <circle cx="22" cy="18" r="3" fill="#38BDF8" />
                  <circle cx="14" cy="28" r="2" fill="#38BDF8" />
                  <circle cx="28" cy="12" r="2" fill="#60A5FA" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#0F172A] tracking-tight block leading-none">
                  AlmasData
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Alumni Network
                </span>
              </div>
            </div>
          </div>

          {/* Section: Why Tracer? / For Universities */}
          <div className="px-6 pt-3">
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-3 tracking-tight">
              Why Tracer?
            </h3>

            {/* Split Top Banner: For Universities with Wireframe & Campus Building */}
            <div className="grid grid-cols-12 rounded-2xl overflow-hidden shadow-md border border-slate-100">
              {/* Left Side: Deep Blue with Wireframe Wave */}
              <div className="col-span-7 bg-[#0047BA] p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                <div
                  className="absolute inset-0 opacity-40 mix-blend-screen bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url('/images/wireframe_terrain.jpg')` }}
                />
                <h4 className="relative z-10 text-xl font-extrabold text-white tracking-tight leading-tight">
                  For Universities
                </h4>
                <div className="relative z-10 text-[11px] text-blue-100 font-medium">
                  Verified Academic & Alumni Infrastructure
                </div>
              </div>

              {/* Right Side: University Architecture Photo */}
              <div className="col-span-5 relative bg-slate-100 overflow-hidden min-h-[140px]">
                <img
                  src="/images/university_building.jpg"
                  alt="Modern University Campus Building"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Feature Bullets: "You can ..." */}
          <div className="px-6 py-5 space-y-4">
            <div className="text-sm font-bold text-[#0047BA]">
              You can ...
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-1">
                <p>
                  Connect to a <strong className="text-[#0F172A] font-extrabold">worldwide network of your students, alumni, faculty and staff.</strong>
                </p>
              </div>
              <div className="space-y-1">
                <p>
                  <strong className="text-[#0F172A] font-extrabold">Search all alumni</strong> by major, region, industry, employer, graduation year and even career path.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Table: Interactive Directory Preview (As seen in the bottom left of mockup) */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-[36px]">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Alumni Database Registry
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-400 font-mono">4 Verified Records</span>
                </div>
              </div>

              {/* Mini Table Rows */}
              <div className="divide-y divide-slate-100 text-[11px]">
                {alumniDirectory.map((alum) => (
                  <div key={alum.id} className="py-2 flex items-center justify-between hover:bg-slate-50/80 px-1 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <img
                        src={alum.avatar}
                        alt={alum.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-800 leading-tight">{alum.name}</div>
                        <div className="text-[10px] text-slate-400">{alum.major} ('{alum.gradYear.slice(2)})</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                        {alum.company}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Pagination Arrow (mimics the blue button in reference image) */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="w-6 h-6 rounded-md bg-[#0047BA] text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-700 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-400">Page 1 of 18</span>
                <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT CARD (Foreground / Main Showcase Hero): "Discover your data diamond 💎"
           ========================================================================= */}
        <div className="w-full lg:w-[58%] bg-white rounded-[40px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col relative">

          {/* TOP HERO BLUE HALF */}
          <div className="relative bg-[#0047BA] text-white pt-8 px-6 sm:px-10 pb-28 overflow-hidden">

            {/* Header Navigation Bar */}
            <header className="relative z-20 flex items-center justify-between mb-12">
              {/* Brand Logo & Name */}
              <div className="flex items-center space-x-3">
                {/* Faceted Diamond Logo (Geometric Vector) */}
                <div className="w-10 h-10 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    {/* Sparkles on upper left */}
                    <circle cx="20" cy="18" r="2.5" fill="#FFFFFF" opacity="0.9" />
                    <circle cx="12" cy="28" r="1.5" fill="#FFFFFF" opacity="0.8" />
                    <circle cx="28" cy="12" r="1.5" fill="#FFFFFF" opacity="0.7" />
                    <circle cx="8" cy="40" r="2" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="18" cy="48" r="1.5" fill="#FFFFFF" opacity="0.5" />
                    
                    {/* Diamond facets */}
                    <polygon points="32,25 68,25 86,48 50,92 14,48" fill="#003B99" stroke="#FFFFFF" strokeWidth="2" />
                    <polygon points="32,25 68,25 50,48" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                    <polygon points="32,25 50,48 14,48" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.5" />
                    <polygon points="68,25 86,48 50,48" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                    <polygon points="14,48 50,48 50,92" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
                    <polygon points="86,48 50,48 50,92" fill="#1E40AF" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>
                </div>

                <div>
                  <div className="font-extrabold text-base tracking-tight leading-none text-white">
                    Almas
                  </div>
                  <div className="font-extrabold text-base tracking-tight leading-none text-white">
                    Data
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden sm:flex items-center space-x-7 text-xs font-medium text-blue-100">
                {/* About with Active Dot Indicator */}
                <button
                  onClick={() => setActiveTab('about')}
                  className="relative py-1 text-white font-semibold transition-colors flex flex-col items-center"
                >
                  <span>About</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mt-1"></span>
                </button>

                <button
                  onClick={() => setActiveTab('mission')}
                  className="py-1 hover:text-white transition-colors"
                >
                  Our Mission
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className="py-1 hover:text-white transition-colors"
                >
                  Services
                </button>

                <button
                  onClick={() => setActiveTab('contact')}
                  className="py-1 hover:text-white transition-colors"
                >
                  Contact
                </button>
              </nav>

              {/* Contact Pill Button */}
              <button
                onClick={() => onSwitchToCommandCenter ? onSwitchToCommandCenter() : null}
                className="px-5 py-2 rounded-full bg-[#070D1E] hover:bg-black text-white text-xs font-semibold tracking-wide shadow-md transition-all border border-white/10"
              >
                Contact
              </button>
            </header>

            {/* Hero Main Content Row */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Headline */}
              <div className="md:col-span-6 space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.15]">
                  Discover<br />
                  your data diamond 💎<br />
                  with Almas Data.
                </h1>

                {/* Curved underline flourish */}
                <div className="w-28 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-full"></div>
              </div>

              {/* Right Column: Interactive Constellation Graph with World Map */}
              <div className="md:col-span-6 relative flex items-center justify-center">
                {/* World map dot grid background */}
                <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Simplified world map dot matrix */}
                    {Array.from({ length: 60 }).map((_, i) => (
                      <circle
                        key={i}
                        cx={40 + (i % 15) * 22 + (Math.sin(i) * 6)}
                        cy={30 + Math.floor(i / 15) * 35 + (Math.cos(i) * 6)}
                        r="1.5"
                        fill="#FFFFFF"
                      />
                    ))}
                  </svg>
                </div>

                {/* Arched Campus Constellation Graph */}
                <div className="relative w-full max-w-[340px] h-[220px]">
                  <svg viewBox="0 0 340 220" className="w-full h-full overflow-visible">
                    {/* Arched connecting curved lines */}
                    <path
                      d="M 50 140 Q 170 30 290 140"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                      className="opacity-70 animate-pulse"
                    />
                    <path
                      d="M 50 140 Q 170 80 170 45"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="opacity-80"
                    />
                    <path
                      d="M 170 45 Q 170 80 290 140"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="opacity-80"
                    />
                    <path
                      d="M 40 85 Q 130 50 200 95"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="opacity-60"
                    />
                    <path
                      d="M 200 95 Q 260 60 275 80"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="opacity-60"
                    />
                    <path
                      d="M 130 180 Q 200 130 290 140"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      className="opacity-60"
                    />
                  </svg>

                  {/* Node 1: Top Center — University Building Pin */}
                  <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5 text-[#0047BA]" />
                  </div>

                  {/* Node 2: Top Left — Graduation Cap Pin */}
                  <div className="absolute top-[68px] left-[32px] w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform">
                    <GraduationCap className="w-4 h-4 text-[#0047BA]" />
                  </div>

                  {/* Node 3: Center — The Data Diamond Node (💎) */}
                  <div className="absolute top-[82px] left-[188px] w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-glow-cyan p-0.5 flex items-center justify-center transform hover:scale-110 transition-transform animate-bounce">
                    <div className="w-full h-full bg-[#0047BA] rounded-[14px] flex items-center justify-center">
                      <span className="text-lg">💎</span>
                    </div>
                  </div>

                  {/* Node 4: Top Right — Academic Certificate Pin */}
                  <div className="absolute top-[65px] right-[42px] w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform">
                    <Award className="w-4 h-4 text-[#0047BA]" />
                  </div>

                  {/* Node 5: Bottom Left — Graduate Mortarboard Student Pin */}
                  <div className="absolute bottom-[48px] left-[48px] w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform">
                    <GraduationCap className="w-4 h-4 text-[#0047BA]" />
                  </div>

                  {/* Node 6: Bottom Center — User Avatar Pin */}
                  <div className="absolute bottom-[30px] left-[138px] w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform">
                    <User className="w-4 h-4 text-[#0047BA]" />
                  </div>

                  {/* Node 7: Bottom Right — Document / Report Pin */}
                  <div className="absolute bottom-[48px] right-[30px] w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 text-[#0047BA]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Folded Cyan Ribbon Accent near the seam */}
            <div className="absolute -bottom-6 left-16 z-20 w-16 h-24 transform -rotate-45 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <polygon points="20,10 80,10 50,90 10,70" fill="#27C5FF" />
                <polygon points="10,70 50,90 35,98" fill="#0099DD" />
              </svg>
            </div>
          </div>

          {/* ASYMMETRIC ANGLED DIVIDER (Sloping upward from left to right) */}
          <div className="relative w-full h-12 -mt-10 overflow-hidden z-10 pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-full fill-white"
            >
              <polygon points="0,120 1200,120 1200,10 0,85" />
            </svg>

            {/* Floating circular diamond badge on the right angled seam */}
            <div className="absolute right-8 top-1 w-11 h-11 rounded-full bg-white shadow-2xl border border-slate-100 flex items-center justify-center pointer-events-auto transform hover:scale-110 transition-transform">
              <span className="text-base">💎</span>
            </div>
          </div>

          {/* BOTTOM HALF: Panoramic City Skyline with Graduate & Vision/Mission Cards */}
          <div className="relative w-full flex-1 min-h-[460px] bg-slate-900 overflow-hidden flex flex-col justify-end">
            
            {/* Scenic Background Image: Graduate overlooking panoramic city skyline */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/images/graduate_skyline.jpg')`,
                backgroundPosition: 'center 45%'
              }}
            >
              {/* Subtle gradient overlay to make cards pop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/40"></div>
            </div>

            {/* Floating Vision & Mission Cards sitting above the graduate */}
            <div className="relative z-20 px-6 sm:px-10 pb-10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              
              {/* CARD 1: OUR VISION (With Cyan Top-Right Accent Border) */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-t-4 border-r-4 border-[#00B4D8] rounded-tr-3xl transform hover:-translate-y-1 transition-transform">
                {/* Logo lockup: OUR VISION */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold tracking-wider text-[#0047BA] uppercase flex items-center space-x-0.5">
                      <span>OUR</span>
                      <span className="w-2 h-2 text-cyan-500">▶</span>
                    </span>
                    <span className="text-lg font-extrabold text-[#0047BA] tracking-tight leading-none">
                      VISION
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-extrabold text-[#0F172A] mb-2 leading-snug">
                  Help universities to grow.
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  We believe that university success is built upon supporting the growth of their alumni.
                </p>
              </div>

              {/* CARD 2: OUR MISSION (With Cyan Bottom-Left Accent Border) */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-b-4 border-l-4 border-[#00B4D8] rounded-bl-3xl transform hover:-translate-y-1 transition-transform">
                {/* Logo lockup: OUR Mission */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold tracking-wider text-[#0047BA] uppercase flex items-center space-x-0.5">
                      <span>OUR</span>
                      <span className="w-2 h-2 text-amber-500">↗</span>
                    </span>
                    <span className="text-lg font-extrabold text-[#0047BA] tracking-tight leading-none">
                      Mission
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#0F172A] leading-relaxed pt-2">
                  To become the most well-known Academic Social Network
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
