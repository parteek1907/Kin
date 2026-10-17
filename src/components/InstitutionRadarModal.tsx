'use client';

import React from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  Building2, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Users, 
  Lightbulb,
  Radio
} from 'lucide-react';

export default function InstitutionRadarModal() {
  const { isRadarModalOpen, setIsRadarModalOpen, nodes, intents } = useNetwork();

  if (!isRadarModalOpen) return null;

  const telemetryRows = [
    {
      skill: 'Deterministic RAG & pgvector',
      demand: 18,
      demandPersona: 'Alumni Founders & Databricks',
      supply: 7,
      status: 'Deficit (High Value)',
      statusColor: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
      action: 'Sponsor Code2Career weekend sprint with Prof. Aradhana Verma'
    },
    {
      skill: 'Offline-First Sync & WebCrypto',
      demand: 14,
      demandPersona: 'NexaPay & Razorpay Core',
      supply: 5,
      status: 'Deficit (Urgent)',
      statusColor: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
      action: 'Run 48-hr Fintech Proof-of-Work Hackathon with Rohan Mehta'
    },
    {
      skill: 'Spatial Computing & WebXR',
      demand: 6,
      demandPersona: 'Omnispatial AR',
      supply: 4,
      status: 'Balanced',
      statusColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40',
      action: 'Facilitate lab equipment grant from DST TBI'
    },
    {
      skill: 'FastAPI & Distributed LSM Trees',
      demand: 22,
      demandPersona: 'Stripe, Zerodha & Cred',
      supply: 12,
      status: 'Healthy Supply',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      action: 'Direct pipeline to Stripe APAC university fellowships'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl overflow-hidden border border-indigo-500/30 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-surface/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white">Institutional Opportunity & Skill-Gap Radar</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold">
                  DEAN & TBI EXECUTIVE RADAR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-time macro telemetry comparing alumni founder intents vs verified campus codebases.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRadarModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-obsidian-deep/80 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>WARM VOUCH CONVERSION</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">88.4%</div>
              <p className="text-[11px] text-slate-400 font-mono">
                vs. 7.2% average on cold LinkedIn / cold email DMs
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-deep/80 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>WHATSAPP ZERO-LOGIN ACTIVITY</span>
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-cyan-400">92.6%</div>
              <p className="text-[11px] text-slate-400 font-mono">
                Alumni respond to warm vouches within 4.2 minutes
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-deep/80 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>TOTAL ROUTED OPPORTUNITIES</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-400">₹1.84 Cr</div>
              <p className="text-[11px] text-slate-400 font-mono">
                Paid sprints, research fellowships & seed contracts
              </p>
            </div>
          </div>

          {/* Actionable Curriculum Gap Alerts */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-obsidian-deep border border-rose-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase tracking-wider font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Priority Curriculum Deficit Alert</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              High Opportunity Deficit: <span className="text-rose-400 font-bold">18 Alumni Founders</span> searched for <span className="text-white font-bold">"Deterministic RAG & Production Vector Search"</span> this month, but only <span className="text-cyan-400 font-bold">7 verified student nodes</span> exist in the campus graph.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-[11px] font-mono text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Recommended Action: Sponsor Code2Career Weekend Build Sprint with Alumni Mentor Rohan Mehta & Prof. Aradhana Verma.</span>
            </div>
          </div>

          {/* Telemetry Matrix: Real-Time Supply vs Demand */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Ecosystem Skill Supply vs Demand Balance Matrix</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Campus Synced</span>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-obsidian-deep/60">
              <div className="grid grid-cols-12 p-3 bg-obsidian-surface text-[10px] font-mono text-slate-400 uppercase border-b border-white/10">
                <div className="col-span-4">Technical Domain</div>
                <div className="col-span-3 text-center">Industry Demand</div>
                <div className="col-span-2 text-center">Campus Supply</div>
                <div className="col-span-3 text-right">Ecosystem Status</div>
              </div>

              <div className="divide-y divide-white/5">
                {telemetryRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-3.5 items-center text-xs font-mono hover:bg-white/5 transition-colors">
                    <div className="col-span-4">
                      <div className="font-bold text-white">{row.skill}</div>
                      <div className="text-[10px] text-slate-400 truncate">{row.action}</div>
                    </div>

                    <div className="col-span-3 text-center">
                      <div className="font-extrabold text-amber-400">{row.demand} Intents</div>
                      <div className="text-[10px] text-slate-500 truncate">{row.demandPersona}</div>
                    </div>

                    <div className="col-span-2 text-center">
                      <div className="font-extrabold text-cyan-400">{row.supply} Builders</div>
                      <div className="text-[10px] text-slate-500">Verified AST</div>
                    </div>

                    <div className="col-span-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
