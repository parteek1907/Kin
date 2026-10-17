'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, GitBranch, ShieldCheck, Zap } from 'lucide-react';

export default function KinNetworkSection() {
  const features = [
    {
      id: 'proof-ingestion',
      step: '01',
      tag: 'ZERO-FORM PROTOCOL',
      title: 'Automated Proof Ingestion',
      description:
        'Traditional alumni platforms suffer 92% inactivity because they demand manual data entry. Kin connects directly to public GitHub commits, research papers, and laboratory repositories to generate immutable engineering proof.',
      icon: GitBranch,
      metrics: 'Deterministic PR & Code Verification',
      badge: 'Zero Manual Forms'
    },
    {
      id: 'trust-bridges',
      step: '02',
      tag: 'FACULTY & ALUMNI VALIDATION',
      title: 'Warm Human Trust Edges',
      description:
        'Resumes can be inflated; peer consensus cannot. Every student node in Kin is anchored by faculty endorsements and verified collaboration edges from alumni founders who have actually pair-programmed with them.',
      icon: ShieldCheck,
      metrics: 'Faculty Laboratory Endorsement Ledger',
      badge: '100% Vouched'
    },
    {
      id: 'intent-routing',
      step: '03',
      tag: 'AUTONOMOUS ROUTING',
      title: 'Real-Time Intent Dispatch',
      description:
        'Alumni founders broadcast urgent engineering requirements via voice notes or text. Kin matches the intent against campus repository skill graphs and initiates warm WhatsApp intro groups in under 60 seconds.',
      icon: Zap,
      metrics: 'Average Intro Velocity: < 2 Minutes',
      badge: 'Direct Founder Access'
    }
  ];

  return (
    <section 
      id="network" 
      className="relative w-full bg-[#FFFDF8] scroll-mt-28 py-24 md:py-36 px-[var(--gutter)] border-t border-[#E5E0D8]/60 overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto">
        
        {/* =====================================================================
            1. SECTION HEADER (Strict Editorial Hierarchy matching Hero)
           ===================================================================== */}
        <div className="w-full max-w-3xl mb-16 md:mb-24">
          <div className="mb-3 md:mb-4">
            <span 
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] text-[#8A829A] uppercase block leading-none"
            >
              HOW KIN WORKS • PROOF OVER RESUMES
            </span>
          </div>

          <h2 
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-[clamp(32px,4.5vw,56px)] font-extrabold text-[#11131A] leading-[1.05] tracking-[-0.025em] uppercase mb-6"
          >
            A living graph built on proven work, not self-claimed titles.
          </h2>

          <p 
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            className="text-[#4A4B53] text-[16px] md:text-[20px] font-normal leading-[1.6] max-w-2xl"
          >
            Kin replaces static resumes and stagnant LinkedIn directories with a living academic network that connects verified student builders to high-conviction alumni founders and research opportunities.
          </p>
        </div>

        {/* =====================================================================
            2. THREE EDITORIAL CARDS (Clean Luxury Material Design)
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 mb-20">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-[#FFFFFF] rounded-2xl p-8 sm:p-10 border border-[#E5E0D8] shadow-[0_4px_24px_rgba(34,18,10,0.03)] hover:shadow-[0_12px_40px_rgba(34,18,10,0.07)] hover:border-[#11131A]/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top card metadata strip */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#F0EBE1]">
                    <span 
                      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                      className="text-[13px] font-bold text-[#8A829A] tracking-[0.16em]"
                    >
                      {item.step}
                    </span>
                    <span 
                      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                      className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#11131A] bg-[#FAF7F0] px-3 py-1 rounded-full border border-[#E5E0D8]"
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-[#E5E0D8] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-[#11131A] stroke-[2.2]" />
                  </div>

                  {/* Title */}
                  <h3 
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                    className="text-[22px] font-bold text-[#11131A] tracking-[-0.015em] mb-4"
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p 
                    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    className="text-[#4A4B53] text-[15px] leading-[1.65] font-normal"
                  >
                    {item.description}
                  </p>
                </div>

                {/* Bottom Proof Metric Footnote */}
                <div className="mt-8 pt-6 border-t border-[#F0EBE1] flex items-center space-x-2 text-[12px] font-semibold text-[#686875]">
                  <CheckCircle2 className="w-4 h-4 text-[#11131A] stroke-[2.5]" />
                  <span>{item.metrics}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =====================================================================
            3. LIVE CONSENSUS TELEMETRY STRIP (Matching the 154 / 412 / 18 Hero rhythm)
           ===================================================================== */}
        <div className="w-full bg-[#FAF7F0] rounded-2xl p-8 sm:p-10 border border-[#E5E0D8] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col">
            <span 
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8A829A] mb-1"
            >
              REAL-TIME NETWORK HEALTH
            </span>
            <span 
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="text-[18px] sm:text-[20px] font-bold text-[#11131A]"
            >
              Active campus consensus across IIIT & premier university chapters.
            </span>
          </div>

          <div className="flex items-center gap-8 sm:gap-12 text-[#11131A]">
            <div>
              <div 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[28px] font-bold leading-none"
              >
                98.4%
              </div>
              <div 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[10px] font-semibold tracking-[0.14em] text-[#686875] uppercase mt-1.5"
              >
                VOUCH ACCURACY
              </div>
            </div>

            <div className="w-px h-8 bg-[#E5E0D8]" />

            <div>
              <div 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[28px] font-bold leading-none"
              >
                &lt; 2h
              </div>
              <div 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[10px] font-semibold tracking-[0.14em] text-[#686875] uppercase mt-1.5"
              >
                INTRO VELOCITY
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
