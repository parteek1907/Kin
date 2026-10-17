'use client';

import React from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  GitBranch, 
  GitCommit, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  FileText, 
  Award, 
  Lock, 
  Smartphone, 
  X,
  Sparkles,
  Link2
} from 'lucide-react';

export default function NodeEvidenceDrawer() {
  const {
    selectedNode,
    selectNode,
    activeIntent,
    highlightedPath,
    requestWarmVouch,
    setIsMicroAuditModalOpen,
    vouchStatus
  } = useNetwork();

  if (!selectedNode) return null;

  // Find active intent evidence for this node if available
  const matchEvidence = activeIntent?.evidenceList?.find(e => e.nodeId === selectedNode.id);
  const compositeScore = matchEvidence ? matchEvidence.score : selectedNode.proofOfWork?.verifiedImpactScore || 94;

  const personaColors: Record<string, { bg: string; text: string }> = {
    student: { bg: 'bg-[#EFF6FF] border-[#BFDBFE]', text: 'text-[#1D4ED8]' },
    founder: { bg: 'bg-[#FEF3C7] border-[#FDE68A]', text: 'text-[#B45309]' },
    faculty: { bg: 'bg-[#ECFDF5] border-[#A7F3D0]', text: 'text-[#047857]' },
    alumni: { bg: 'bg-[#FFF1F2] border-[#FECDD3]', text: 'text-[#BE123C]' },
    recruiter: { bg: 'bg-[#FDF2F8] border-[#FBCFE8]', text: 'text-[#BE185D]' },
  };

  const currentPersona = personaColors[selectedNode.persona] || { bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-800' };

  return (
    <aside className="fixed top-20 right-4 z-50 w-88 sm:w-[420px] max-h-[calc(100vh-6rem)] flex flex-col bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_70px_rgba(20,24,21,0.15)] overflow-hidden border border-black/10 text-[#141815] animate-in fade-in slide-in-from-right-4 duration-200">
      
      {/* Header */}
      <div className="p-5 border-b border-black/[0.08] flex items-start justify-between bg-[#FAF8F5]">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src={selectedNode.avatar}
              alt={selectedNode.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-[#E25C38] shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-[#141815]">{selectedNode.name}</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${currentPersona.bg} ${currentPersona.text}`}>
                {selectedNode.persona}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-medium">{selectedNode.role}</p>
            <p className="text-[10px] font-mono text-zinc-400">{selectedNode.department}</p>
          </div>
        </div>

        <button
          onClick={() => selectNode(null)}
          className="p-1.5 rounded-full text-zinc-400 hover:text-[#141815] hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Dossier Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* Match Evidence Card (When Intent Active) */}
        {activeIntent && (
          <div className="p-4 rounded-[24px] bg-[#FEF3C7] border border-[#F59E0B]/30 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#92400E] font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Citation-Grounded Match</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-[#92400E] px-2.5 py-0.5 rounded-full bg-white/70 border border-[#F59E0B]/30">
                {compositeScore}% FIT
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#F59E0B]/20 text-xs font-mono text-zinc-800 mb-2">
              <div className="text-[10px] text-[#D97706] font-bold mb-1 flex items-center space-x-1">
                <GitCommit className="w-3 h-3" />
                <span>EXACT CODE CITATION:</span>
              </div>
              <p className="italic text-[11px] text-zinc-700 leading-snug">
                "{matchEvidence ? matchEvidence.quote : selectedNode.proofOfWork?.repos[0]?.citations[0] || 'Verified AST dependency tree'}"
              </p>
            </div>

            <div className="text-[10px] font-mono text-[#92400E] flex items-center justify-between">
              <span>Intent: {activeIntent.category}</span>
              <span className="text-emerald-700 font-bold">Zero Hallucination Proof</span>
            </div>
          </div>
        )}

        {/* SUB-PANEL 1: VERIFIED PROOF-OF-WORK MATRIX */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5 font-bold">
              <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Proof-of-Work Matrix</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">AST PARSED</span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] text-center">
              <div className="text-[10px] font-mono text-zinc-500">IMPACT</div>
              <div className="text-base font-mono font-black text-[#E25C38]">
                {selectedNode.proofOfWork?.verifiedImpactScore || 90}
                <span className="text-[10px] text-zinc-400">/100</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] text-center">
              <div className="text-[10px] font-mono text-zinc-500">COMMITS</div>
              <div className="text-base font-mono font-black text-emerald-600">
                {selectedNode.proofOfWork?.totalCommits || 400}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] text-center">
              <div className="text-[10px] font-mono text-zinc-500">REPOS</div>
              <div className="text-base font-mono font-black text-zinc-800">
                {selectedNode.proofOfWork?.repos?.length || 1}
              </div>
            </div>
          </div>

          {/* Languages from Code Bytes */}
          <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Verified Languages (Code Bytes)</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.proofOfWork?.topLanguages?.map(lang => (
                <span
                  key={lang}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-black/10 text-[11px] font-mono text-zinc-800 font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Repositories List */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Production Repositories</div>
            {selectedNode.proofOfWork?.repos?.map(repo => (
              <div
                key={repo.name}
                className="p-3.5 rounded-2xl bg-white border border-black/[0.08] hover:border-black/20 shadow-sm transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs text-[#141815] hover:text-[#E25C38] flex items-center space-x-1.5"
                  >
                    <span>{repo.name}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                    {repo.impactScore} Pts
                  </span>
                </div>

                <p className="text-[11px] text-zinc-600 leading-snug">{repo.description}</p>

                <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center space-x-1 text-[#E25C38] font-bold">
                    <GitCommit className="w-3 h-3" />
                    <span>#{repo.recentCommitHash}</span>
                  </div>
                  <span>{repo.commitsCount} commits</span>
                </div>
              </div>
            ))}
          </div>

          {/* Research Papers (If any) */}
          {selectedNode.proofOfWork?.papers && selectedNode.proofOfWork.papers.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center space-x-1">
                <FileText className="w-3 h-3 text-amber-600" />
                <span>Peer-Reviewed Papers & Pre-Prints</span>
              </div>
              {selectedNode.proofOfWork.papers.map((paper, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-amber-300 text-xs text-left">
                  <div className="font-bold text-[#141815] mb-1 leading-snug">{paper.title}</div>
                  <div className="text-[10px] font-mono text-amber-700 mb-1 font-bold">{paper.conference} ({paper.year})</div>
                  <p className="text-[11px] text-zinc-700 leading-relaxed italic">{paper.abstract}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUB-PANEL 2: SHORTEST VERIFIED TRUST PATH VISUALIZER */}
        <div className="space-y-3 pt-3 border-t border-black/[0.08] text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5 font-bold">
              <Link2 className="w-3.5 h-3.5 text-[#E25C38]" />
              <span>Shortest Verified Trust Path</span>
            </span>
            <span className="text-[10px] font-mono text-[#E25C38] font-bold">
              TRUST: {highlightedPath?.compositeTrustScore || 0.94}
            </span>
          </div>

          {highlightedPath ? (
            <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-black/[0.08] space-y-3">
              <div className="space-y-2">
                {highlightedPath.hops.map((hop, idx) => (
                  <div key={idx} className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E25C38]"></div>
                      <span className="font-bold text-[#141815]">{hop.fromNode.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">({hop.fromNode.persona})</span>
                    </div>

                    <div className="ml-1 pl-3 border-l-2 border-dashed border-[#E25C38]/40 py-1 text-[10px] font-mono text-[#E25C38] flex items-center space-x-1">
                      <ArrowRight className="w-3 h-3 text-[#E25C38] shrink-0" />
                      <span>{hop.relationship}</span>
                      <span className="text-zinc-400">[{Math.round(hop.trustWeight * 100)}%]</span>
                    </div>

                    {idx === highlightedPath.hops.length - 1 && (
                      <div className="flex items-center space-x-2 pt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                        <span className="font-bold text-[#141815]">{hop.toNode.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">({hop.toNode.persona})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-black/[0.06] text-[11px] text-zinc-600 font-mono leading-relaxed">
                💡 <span className="text-[#E25C38] font-bold">Why this bridge works:</span> {highlightedPath.rationale}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-black/[0.05] text-xs text-zinc-500 text-center font-mono">
              Direct connection or multi-hop link ready to vouch.
            </div>
          )}
        </div>
      </div>

      {/* SUB-PANEL 3: ACTION CONTROLS */}
      <div className="p-5 border-t border-black/[0.08] bg-[#FAF8F5] space-y-2.5">
        {/* Button 1: WhatsApp Bridge */}
        <button
          onClick={() => requestWarmVouch(selectedNode.id)}
          className="w-full py-3 px-4 rounded-full bg-[#254B33] hover:bg-[#1D3B28] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
        >
          <Smartphone className="w-4 h-4" />
          <span>
            {vouchStatus === 'vouched'
              ? '✅ 3-Person Intro Group Active (Open WhatsApp)'
              : 'Request 1-Tap Warm Vouch via WhatsApp'}
          </span>
        </button>

        {/* Button 2: Micro-Audit */}
        <button
          onClick={() => setIsMicroAuditModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-full bg-white hover:bg-[#EFECE5] border border-black/10 text-xs font-semibold text-zinc-700 flex items-center justify-center space-x-2 transition-all shadow-sm"
        >
          <Lock className="w-3.5 h-3.5 text-[#E25C38]" />
          <span>Unlock via 60-Second Technical Micro-Audit</span>
        </button>
      </div>
    </aside>
  );
}
