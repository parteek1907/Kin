'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export default function KinPricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const tiers = [
    {
      id: 'student',
      name: 'Student Builder',
      badge: 'CAMPUS VERIFIED',
      featured: false,
      price: '$0',
      period: 'free forever',
      description: 'For undergraduate and graduate engineers building real systems. Never pay a cent.',
      features: [
        'Automated GitHub commit & PR ingestion',
        'Direct inbound intro requests from founders',
        'Faculty laboratory vouching ledger',
        'Deterministic cryptographic proof badges',
        'Zero cold DMs — all requests pre-screened'
      ],
      cta: 'Claim Student Node',
      ctaVariant: 'secondary'
    },
    {
      id: 'founder',
      name: 'Alumni Founder & Scout',
      badge: 'HIGH CONVICTION',
      featured: true,
      price: billingCycle === 'annual' ? '$39' : '$49',
      period: 'per month',
      subPeriod: billingCycle === 'annual' ? 'Billed annually ($468/yr)' : 'Billed monthly',
      description: 'For venture founders and angel investors seeking proven engineering talent.',
      features: [
        'Broadcast up to 5 concurrent intent capsules',
        'Direct 3-way warm intros via faculty bridges',
        'Line-by-line commit impact inspector',
        'Voice-to-intent WhatsApp zero-login dispatch',
        'Zero placement fees or recruiting commissions',
        'Priority matching with top 2% campus builders'
      ],
      cta: 'Start Scouting Talent',
      ctaVariant: 'primary'
    },
    {
      id: 'institution',
      name: 'University & Research Labs',
      badge: 'ENTERPRISE DEPLOYMENT',
      featured: false,
      price: 'Custom',
      period: 'annual campus license',
      description: 'For university leadership, deans, and research incubators monitoring real placement.',
      features: [
        'Campus-wide alumni & student network radar',
        'Real-time departmental skill-gap telemetry',
        'Zero-form graduation outcome reporting',
        'Accreditation & NAAC verified evidence exports',
        'Institutional data sovereignty & private tenant',
        'Dedicated Academic Network Architect'
      ],
      cta: 'Contact Academic Desk',
      ctaVariant: 'secondary'
    }
  ];

  return (
    <section 
      id="pricing" 
      className="relative w-full bg-[#FAF7F0] scroll-mt-28 py-24 md:py-36 px-[var(--gutter)] border-t border-[#E5E0D8] overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto">
        
        {/* =====================================================================
            1. SECTION HEADER & BILLING TOGGLE
           ===================================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="mb-3 md:mb-4">
            <span 
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] text-[#8A829A] uppercase inline-block leading-none"
            >
              TRANSPARENT MEMBERSHIP • NO RECRUITER TAX
            </span>
          </div>

          <h2 
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-[clamp(32px,4.5vw,56px)] font-extrabold text-[#11131A] leading-[1.05] tracking-[-0.025em] uppercase mb-6"
          >
            Invest in verified reputation.
          </h2>

          <p 
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            className="text-[#4A4B53] text-[16px] md:text-[20px] font-normal leading-[1.6] mb-10"
          >
            Kin is free forever for students. Transparent, high-conviction access for alumni founders and university institutions.
          </p>

          {/* Billing Toggle (Monthly / Annual) */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-[#EFE9DE] border border-[#E0D8CB]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-[12px] font-bold tracking-[0.08em] uppercase transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-[#11131A] text-white shadow-sm'
                  : 'text-[#686875] hover:text-[#11131A]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-full text-[12px] font-bold tracking-[0.08em] uppercase transition-all duration-200 ${
                billingCycle === 'annual'
                  ? 'bg-[#11131A] text-white shadow-sm'
                  : 'text-[#686875] hover:text-[#11131A]'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] font-bold text-[#E2C799] bg-[#2A231C] px-2 py-0.5 rounded-full lowercase">
                save 20%
              </span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. THREE LUXURY EDITORIAL PRICING CARDS
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch mb-16">
          {tiers.map((tier, index) => {
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                  tier.featured
                    ? 'bg-[#11131A] text-[#FFFDF8] border-2 border-[#11131A] shadow-[0_20px_50px_rgba(17,19,26,0.18)] lg:-translate-y-3'
                    : 'bg-[#FFFDF8] text-[#11131A] border border-[#E5E0D8] shadow-[0_4px_24px_rgba(34,18,10,0.03)] hover:shadow-[0_12px_40px_rgba(34,18,10,0.07)] hover:border-[#11131A]/20'
                }`}
              >
                <div>
                  {/* Badge & Title */}
                  <div className="flex items-center justify-between mb-6">
                    <span 
                      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                      className={`text-[11px] font-bold tracking-[0.16em] uppercase px-3 py-1 rounded-full border ${
                        tier.featured
                          ? 'bg-[#222634] text-[#EAD8C6] border-[#3A4052]'
                          : 'bg-[#FAF7F0] text-[#686875] border-[#E5E0D8]'
                      }`}
                    >
                      {tier.badge}
                    </span>
                    {tier.featured && (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-[#F5C84C]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>POPULAR</span>
                      </span>
                    )}
                  </div>

                  <h3 
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                    className="text-[24px] font-bold tracking-tight mb-2"
                  >
                    {tier.name}
                  </h3>

                  <p className={`text-[14px] leading-relaxed mb-8 ${tier.featured ? 'text-[#9CA3AF]' : 'text-[#686875]'}`}>
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8 pb-8 border-b border-black/[0.08] dark:border-white/[0.1]">
                    <div className="flex items-baseline space-x-2">
                      <span 
                        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                        className="text-[48px] sm:text-[54px] font-extrabold tracking-tight leading-none"
                      >
                        {tier.price}
                      </span>
                      <span className={`text-[13px] font-medium ${tier.featured ? 'text-[#9CA3AF]' : 'text-[#686875]'}`}>
                        / {tier.period}
                      </span>
                    </div>
                    {tier.subPeriod && (
                      <div className="text-[11px] font-semibold text-[#8A829A] mt-2">
                        {tier.subPeriod}
                      </div>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-4 mb-10">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start space-x-3 text-[14px] leading-snug">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${tier.featured ? 'bg-[#222634] text-[#EAD8C6]' : 'bg-[#FAF7F0] text-[#11131A]'}`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className={tier.featured ? 'text-[#E5E7EB]' : 'text-[#374151]'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Button */}
                <button
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  className={`w-full py-4 px-6 rounded-full font-bold text-[13px] tracking-[0.10em] uppercase transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer ${
                    tier.featured
                      ? 'bg-[#FFFDF8] text-[#11131A] hover:bg-[#F0EBE1] shadow-lg'
                      : 'bg-[#11131A] text-white hover:bg-[#2A2E3D]'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* =====================================================================
            3. COMMITMENT TO ZERO-COMMISSION FOOTNOTE
           ===================================================================== */}
        <div className="text-center text-[13px] text-[#686875] max-w-2xl mx-auto">
          <span>🔒 100% Academic Data Sovereignty • Zero placement agency commissions • Full privacy control</span>
        </div>

      </div>
    </section>
  );
}
