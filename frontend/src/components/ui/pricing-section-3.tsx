"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCheck, GitBranch, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  annualMonthlyEquivalent: number;
  annualTotal: number;
  featured?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline";
  isFree?: boolean;
  features: { text: string; icon: React.ReactNode }[];
  includes: string[];
}

const plans: PricingPlan[] = [
  {
    name: "Student Builder",
    description:
      "For undergraduate and graduate engineers building real systems. Free forever.",
    monthlyPrice: 0,
    annualMonthlyEquivalent: 0,
    annualTotal: 0,
    isFree: true,
    buttonText: "Claim Student Node",
    buttonVariant: "outline",
    features: [
      { text: "Automated GitHub commit & PR ingestion", icon: <GitBranch size={18} /> },
      { text: "Faculty laboratory vouching ledger", icon: <ShieldCheck size={18} /> },
      { text: "Deterministic cryptographic proof", icon: <Zap size={18} /> },
    ],
    includes: [
      "Student includes:",
      "Automated GitHub commit & PR ingestion",
      "Faculty laboratory vouching ledger",
      "Direct inbound requests from founders",
      "Zero cold DMs — pre-screened intros",
    ],
  },
  {
    name: "Alumni Founder & Scout",
    description:
      "For venture founders and scouts seeking proven campus engineering talent.",
    monthlyPrice: 999,
    annualMonthlyEquivalent: 799,
    annualTotal: 9588,
    featured: true,
    buttonText: "Start Scouting Talent",
    buttonVariant: "default",
    features: [
      { text: "Broadcast up to 5 concurrent intents", icon: <GitBranch size={18} /> },
      { text: "Direct 3-way warm intros via faculty", icon: <ShieldCheck size={18} /> },
      { text: "Line-by-line commit impact inspector", icon: <Zap size={18} /> },
    ],
    includes: [
      "Everything in Student, plus:",
      "Broadcast up to 5 concurrent intents",
      "Direct 3-way warm intros via faculty",
      "Line-by-line commit impact inspector",
      "Zero placement fees or commissions",
    ],
  },
  {
    name: "University & Research Labs",
    description:
      "For university leadership, deans, and research incubators monitoring real placement.",
    monthlyPrice: 4999,
    annualMonthlyEquivalent: 3999,
    annualTotal: 47988,
    buttonText: "Contact Academic Desk",
    buttonVariant: "outline",
    features: [
      { text: "Campus-wide alumni & student network", icon: <GitBranch size={18} /> },
      { text: "Real-time departmental skill gaps", icon: <ShieldCheck size={18} /> },
      { text: "Accreditation & NAAC verified exports", icon: <Zap size={18} /> },
    ],
    includes: [
      "Everything in Founder, plus:",
      "Campus-wide alumni & student radar",
      "Departmental skill-gap telemetry",
      "Accreditation & NAAC verified exports",
      "Institutional data sovereignty",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("1"); // Default yearly

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      {/* Clean Architectural Switch (Zero Pill Shapes) */}
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-[#EFE9DE] border border-[#E0D8CB] p-1">
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit sm:h-11 cursor-pointer h-10 rounded-lg sm:px-6 px-4 sm:py-2 py-1 text-xs font-bold tracking-[0.08em] uppercase transition-colors",
            selected === "0"
              ? "text-black"
              : "text-[#686875] hover:text-black",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="pricing-switch-tab"
              className="absolute top-0 left-0 sm:h-11 h-10 w-full rounded-lg bg-white shadow-sm border border-[#E0D8CB]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer sm:h-11 h-10 flex-shrink-0 rounded-lg sm:px-6 px-4 sm:py-2 py-1 text-xs font-bold tracking-[0.08em] uppercase transition-colors",
            selected === "1"
              ? "text-black"
              : "text-[#686875] hover:text-black",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="pricing-switch-tab"
              className="absolute top-0 left-0 sm:h-11 h-10 w-full rounded-lg bg-white shadow-sm border border-[#E0D8CB]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Annual
            <span className="rounded bg-[#2A231C] text-[#E2C799] px-2 py-0.5 text-[10px] font-bold lowercase">
              save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection3() {
  const [isYearly, setIsYearly] = useState(true);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <section
      id="pricing"
      className="w-full scroll-mt-28 py-20 lg:py-32 px-[var(--gutter)] bg-[#FAF7F0] border-t border-[#E5E0D8]"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Switch (Completely stable, zero reload on switch) */}
        <article className="flex sm:flex-row flex-col sm:pb-0 pb-8 sm:items-end items-start justify-between gap-6 mb-16">
          <div className="text-left max-w-2xl">
            <h2 
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="text-[clamp(32px,4.5vw,54px)] font-extrabold text-[#11131A] leading-[1.2] tracking-[0.05em] uppercase mb-4"
            >
              Invest in verified reputation.
            </h2>

            <p 
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="text-[#4A4B53] text-base md:text-xl font-normal leading-[1.7] tracking-[0.02em]"
            >
              Kin is free forever for students. Transparent, high-conviction access for alumni founders and university institutions.
            </p>
          </div>

          <div>
            <PricingSwitch onSwitch={togglePricingPeriod} className="shrink-0" />
          </div>
        </article>

        {/* Pricing Cards Grid (Completely stable, only NumberFlow animates) */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex"
            >
              <Card
                className={`relative flex-col flex justify-between w-full rounded-2xl p-7 sm:p-9 transition-all duration-300 border ${
                  plan.featured
                    ? "bg-[#11131A] text-[#FFFDF8] border-[#11131A] shadow-[0_20px_50px_rgba(17,19,26,0.18)] lg:-translate-y-2"
                    : "bg-[#FFFDF8] text-[#11131A] border-[#E5E0D8] shadow-[0_4px_24px_rgba(34,18,10,0.03)] hover:shadow-[0_12px_40px_rgba(34,18,10,0.07)]"
                }`}
              >
                <CardContent className="p-0">
                  {/* Plan Name */}
                  <h3
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                    className="text-2xl font-bold tracking-tight mb-2"
                  >
                    {plan.name}
                  </h3>

                  <p
                    className={`text-sm leading-relaxed mb-8 min-h-[44px] ${
                      plan.featured ? "text-[#9CA3AF]" : "text-[#686875]"
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Price with Animated Number: India-first INR (₹) */}
                  <div className="mb-8 pb-8 border-b border-black/[0.08] dark:border-white/[0.1]">
                    <div className="flex items-baseline flex-wrap gap-y-1 h-12">
                      <span
                        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                        className="text-4xl sm:text-5xl font-extrabold tracking-tight flex items-baseline"
                      >
                        <span className="mr-0.5">₹</span>
                        {plan.isFree ? (
                          <span>0</span>
                        ) : (
                          <span className="inline-flex items-baseline overflow-hidden">
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={isYearly ? plan.annualMonthlyEquivalent : plan.monthlyPrice}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-block font-extrabold"
                              >
                                {(isYearly ? plan.annualMonthlyEquivalent : plan.monthlyPrice).toLocaleString('en-IN')}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ml-2 ${
                          plan.featured ? "text-[#9CA3AF]" : "text-[#686875]"
                        }`}
                      >
                        {plan.isFree ? "/ free forever" : "/ month"}
                      </span>
                      {!plan.isFree && isYearly && (
                        <span
                          className={`ml-2.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            plan.featured
                              ? "bg-[#EAD8C6] text-[#11131A]"
                              : "bg-[#2A231C] text-[#E2C799]"
                          }`}
                        >
                          Save 20%
                        </span>
                      )}
                    </div>

                    {/* Sub-line: Annual Amount Charged / Billing Notes */}
                    <div className="h-5 mt-2.5 flex items-center">
                      {plan.isFree ? (
                        <span
                          className={`text-xs font-semibold tracking-wide uppercase ${
                            plan.featured ? "text-[#9CA3AF]" : "text-[#686875]"
                          }`}
                        >
                          FREE FOREVER
                        </span>
                      ) : isYearly ? (
                        <span
                          className={`text-xs font-semibold tracking-wide ${
                            plan.featured ? "text-[#EAD8C6]" : "text-[#11131A]"
                          }`}
                        >
                          Billed annually at ₹{plan.annualTotal.toLocaleString('en-IN')}/year
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-medium tracking-wide ${
                            plan.featured ? "text-[#9CA3AF]" : "text-[#686875]"
                          }`}
                        >
                          Billed monthly
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-3 pt-2">
                    <h4
                      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                      className={`font-bold text-xs uppercase tracking-[0.12em] mb-4 ${
                        plan.featured ? "text-[#EAD8C6]" : "text-[#11131A]"
                      }`}
                    >
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-3 font-normal">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm leading-snug">
                          <span
                            className={`shrink-0 mr-3 mt-0.5 ${
                              plan.featured ? "text-[#EAD8C6]" : "text-[#11131A]"
                            }`}
                          >
                            <CheckCheck className="h-4 w-4 stroke-[2.5]" />
                          </span>
                          <span
                            className={
                              plan.featured ? "text-[#E5E7EB]" : "text-[#374151]"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-0 pt-8 mt-auto">
                  <button
                    type="button"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-[13px] tracking-[0.10em] uppercase transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      plan.featured
                        ? "bg-[#FFFDF8] text-[#11131A] hover:bg-[#F0EBE1] shadow-lg"
                        : "bg-[#11131A] text-white hover:bg-[#2A2E3D]"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export { PricingSection3 };
