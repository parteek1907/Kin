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
      statusColor: 'text-rose-700 bg-rose-50 border-rose-200',
      action: 'Sponsor Code2Career weekend sprint with Prof. Aradhana Verma'
    },
    {
      skill: 'Offline-First Sync & WebCrypto',
      demand: 14,
      demandPersona: 'NexaPay & Razorpay Core',
      supply: 5,
      status: 'Deficit (Urgent)',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
      action: 'Run 48-hr Fintech Proof-of-Work Hackathon with Rohan Mehta'
    },
    {
      skill: 'Spatial Computing & WebXR',
      demand: 6,
      demandPersona: 'Omnispatial AR',
      supply: 4,
      status: 'Balanced',
      statusColor: 'text-blue-700 bg-blue-50 border-blue-200',
      action: 'Facilitate lab equipment grant from DST TBI'
    },
    {
      skill: 'FastAPI & Distributed LSM Trees',
      demand: 22,
      demandPersona: 'Stripe, Zerodha & Cred',
      supply: 12,
      status: 'Healthy Supply',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      action: 'Direct pipeline to Stripe APAC university fellowships'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-[36px] shadow-[0_25px_80px_rgba(20,24,21,0.2)] overflow-hidden border border-black/10 flex flex-col text-[#141815]">
        
        {/* Header */}
        <div className="p-6 border-b border-black/[0.08] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#E25C38] flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-[#141815]">Institutional Opportunity & Skill-Gap Radar</h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F3EFEA] border border-black/5 text-[#E25C38] font-bold">
                  DEAN & TBI EXECUTIVE RADAR
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                Real-time macro telemetry comparing alumni founder intents vs verified campus codebases.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRadarModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-[#141815] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>WARM VOUCH CONVERSION</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600">88.4%</div>
              <p className="text-[11px] text-zinc-500 font-mono">
                vs. 7.2% average on cold LinkedIn / cold email DMs
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>WHATSAPP ZERO-LOGIN ACTIVITY</span>
                <Radio className="w-4 h-4 text-[#E25C38] animate-pulse" />
              </div>
              <div className="text-2xl font-black font-mono text-[#E25C38]">92.6%</div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Alumni respond to warm vouches within 4.2 minutes
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>TOTAL ROUTED OPPORTUNITIES</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-600">₹1.84 Cr</div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Paid sprints, research fellowships & seed contracts
              </p>
            </div>
          </div>

          {/* Actionable Curriculum Gap Alerts */}
          <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-amber-300 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Priority Curriculum Deficit Alert</span>
            </div>
            <p className="text-xs text-zinc-800 leading-relaxed font-mono">
              High Opportunity Deficit: <span className="text-[#E25C38] font-bold">18 Alumni Founders</span> searched for <span className="text-[#141815] font-bold">"Deterministic RAG & Production Vector Search"</span> this month, but only <span className="text-emerald-700 font-bold">7 verified student nodes</span> exist in the campus graph.
            </p>
          </div>

          {/* Telemetry Table */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">
              Institutional Intent vs Campus Supply Breakdown
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-[#FAF8F5]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#EFECE5] text-zinc-600 border-b border-black/[0.08]">
                  <tr>
                    <th className="p-3">Skill Domain</th>
                    <th className="p-3">Demand (Intents)</th>
                    <th className="p-3">Campus Supply</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Recommended TBI Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {telemetryRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="p-3 font-bold text-[#141815]">{row.skill}</td>
                      <td className="p-3 text-zinc-700">
                        {row.demand} Intents
                        <div className="text-[10px] text-zinc-400">{row.demandPersona}</div>
                      </td>
                      <td className="p-3 font-bold text-zinc-700">{row.supply} Verified Nodes</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-600 text-[11px]">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
