'use client';

import React from 'react';
import { Mic, CheckCircle, Users, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function WhatsAppRequirementSection() {
  const businessNumber = process.env.NEXT_PUBLIC_WA_BUSINESS_NUMBER || '919811022678';
  const waUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent('Hi KIN, I need…')}`;

  return (
    <section id="whatsapp-flow" className="relative w-full py-24 bg-[#0A0D0B] text-white border-t border-[#1C241E]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18231B] border border-[#2B3B2F] text-xs font-mono text-[#B6E64A]">
            <Sparkles className="w-3.5 h-3.5" />
            ZERO-APP ALUMNI HIRING
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Post a requirement on <span className="text-[#B6E64A]">WhatsApp</span>
          </h2>
          <p className="text-sm md:text-base text-[#8B988E] leading-relaxed">
            No portal logins or lengthy forms. Speak or text in English, Hindi, or Hinglish. KIN extracts what you need and brings verified students to your chat.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Step 1 */}
          <div className="relative p-8 rounded-3xl bg-[#121814] border border-[#202922] hover:border-[#2E4032] transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#18241B] border border-[#2B3E2F] flex items-center justify-center text-[#B6E64A] mb-6 group-hover:scale-110 transition">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Step 01</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Send a Voice Note or Text</h3>
            <p className="text-xs md:text-sm text-[#8B988E] leading-relaxed">
              Message the KIN number describing who you need (e.g. "Looking for 2 React & Python interns in Delhi"). We auto-detect your language.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-3xl bg-[#121814] border border-[#202922] hover:border-[#2E4032] transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#18241B] border border-[#2B3E2F] flex items-center justify-center text-[#B6E64A] mb-6 group-hover:scale-110 transition">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Step 02</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Review What KIN Understood</h3>
            <p className="text-xs md:text-sm text-[#8B988E] leading-relaxed">
              KIN summarizes role, skills, location, and timeline with a single confirmation button. Clarify anything with quick replies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-3xl bg-[#121814] border border-[#202922] hover:border-[#2E4032] transition group">
            <div className="w-12 h-12 rounded-2xl bg-[#18241B] border border-[#2B3E2F] flex items-center justify-center text-[#B6E64A] mb-6 group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Step 03</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Get Candidates in Chat</h3>
            <p className="text-xs md:text-sm text-[#8B988E] leading-relaxed">
              Receive top 5 matched profiles with fit scores. Request a double opt-in intro — contact details are shared only when the student accepts.
            </p>
          </div>
        </div>

        {/* QR Code & Direct WhatsApp Action Banner */}
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#121914] via-[#0E1510] to-[#0A0D0B] border border-[#233327] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B6E64A]">
              <ShieldCheck className="w-4 h-4" />
              DOUBLE OPT-IN • ZERO SPAM GUARANTEE
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Ready to find high-conviction campus builders?
            </h3>
            <p className="text-xs md:text-sm text-[#8B988E] leading-relaxed">
              Scan the QR code with your phone camera or tap below to start your conversation with KIN on WhatsApp.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#B6E64A] text-black font-semibold text-sm hover:bg-[#c9f563] transition shadow-lg shadow-[#b6e64a]/20"
              >
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href="/candidate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#18231B] border border-[#2E4032] text-white hover:bg-[#202E24] text-sm font-medium transition"
              >
                <span>Candidate Portal</span>
              </a>
            </div>
          </div>

          {/* QR Code Graphic */}
          <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#090D0A] border border-[#233327]">
            {/* SVG Crisp High-Resolution QR Mockup */}
            <div className="w-40 h-40 bg-white p-2.5 rounded-xl flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
                {/* QR Finder Patterns (Top-Left, Top-Right, Bottom-Left) */}
                <rect x="0" y="0" width="30" height="30" fill="#0A0D0B" rx="4" />
                <rect x="5" y="5" width="20" height="20" fill="#FFF" rx="2" />
                <rect x="9" y="9" width="12" height="12" fill="#0A0D0B" rx="2" />

                <rect x="70" y="0" width="30" height="30" fill="#0A0D0B" rx="4" />
                <rect x="75" y="5" width="20" height="20" fill="#FFF" rx="2" />
                <rect x="79" y="9" width="12" height="12" fill="#0A0D0B" rx="2" />

                <rect x="0" y="70" width="30" height="30" fill="#0A0D0B" rx="4" />
                <rect x="5" y="75" width="20" height="20" fill="#FFF" rx="2" />
                <rect x="9" y="79" width="12" height="12" fill="#0A0D0B" rx="2" />

                {/* Pattern Data Matrix Bits */}
                <rect x="36" y="6" width="6" height="6" fill="#0A0D0B" />
                <rect x="46" y="10" width="6" height="6" fill="#0A0D0B" />
                <rect x="56" y="4" width="6" height="6" fill="#0A0D0B" />
                <rect x="36" y="22" width="6" height="6" fill="#0A0D0B" />
                <rect x="48" y="24" width="6" height="6" fill="#0A0D0B" />
                <rect x="12" y="36" width="6" height="6" fill="#0A0D0B" />
                <rect x="24" y="42" width="6" height="6" fill="#0A0D0B" />
                <rect x="36" y="38" width="6" height="6" fill="#0A0D0B" />
                <rect x="44" y="44" width="12" height="12" fill="#B6E64A" rx="2" />
                <rect x="62" y="36" width="6" height="6" fill="#0A0D0B" />
                <rect x="72" y="44" width="6" height="6" fill="#0A0D0B" />
                <rect x="84" y="38" width="6" height="6" fill="#0A0D0B" />
                <rect x="36" y="62" width="6" height="6" fill="#0A0D0B" />
                <rect x="48" y="70" width="6" height="6" fill="#0A0D0B" />
                <rect x="58" y="62" width="6" height="6" fill="#0A0D0B" />
                <rect x="70" y="72" width="6" height="6" fill="#0A0D0B" />
                <rect x="82" y="64" width="6" height="6" fill="#0A0D0B" />
                <rect x="40" y="86" width="6" height="6" fill="#0A0D0B" />
                <rect x="52" y="80" width="6" height="6" fill="#0A0D0B" />
                <rect x="66" y="88" width="6" height="6" fill="#0A0D0B" />
                <rect x="80" y="84" width="6" height="6" fill="#0A0D0B" />
              </svg>
            </div>
            <span className="text-[11px] font-mono text-[#8B988E]">Scan to chat (+91 {businessNumber.slice(-10)})</span>
          </div>
        </div>
      </div>
    </section>
  );
}
