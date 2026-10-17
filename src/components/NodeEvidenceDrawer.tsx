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

  return (
    <aside className="fixed top-20 right-4 z-30 w-88 sm:w-[420px] max-h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-2xl shadow-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-start justify-between bg-obsidian-surface/80">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={selectedNode.avatar}
              alt={selectedNode.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-400 shadow-glow-cyan"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#07090E] flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-extrabold text-white">{selectedNode.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase">
                {selectedNode.persona}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">{selectedNode.role}</p>
            <p className="text-[10px] font-mono text-slate-400">{selectedNode.department}</p>
          </div>
        </div>

        <button
          onClick={() => selectNode(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Dossier Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* VERALON-STYLE MATCH EVIDENCE CARD (When Intent Active) */}
        {activeIntent && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/60 to-purple-950/40 border border-cyan-500/40 shadow-glow-cyan">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Citation-Grounded Match</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-cyan-400 px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-400/40">
                {compositeScore}% FIT
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-obsidian-deep/80 border border-white/10 text-xs font-mono text-slate-200 mb-2">
              <div className="text-[10px] text-cyan-400 font-bold mb-1 flex items-center space-x-1">
                <GitCommit className="w-3 h-3" />
                <span>EXACT CODE CITATION:</span>
              </div>
              <p className="italic text-[11px] text-slate-300 leading-snug">
                "{matchEvidence ? matchEvidence.quote : selectedNode.proofOfWork?.repos[0]?.citations[0] || 'Verified AST dependency tree'}"
              </p>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Target Intent: {activeIntent.category}</span>
              <span className="text-emerald-400">Zero Hallucination Proof</span>
            </div>
          </div>
        )}

        {/* SUB-PANEL 1: VERIFIED PROOF-OF-WORK MATRIX (NOT A RESUME) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 font-bold">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Proof-of-Work Matrix</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">AST & COMMIT PARSED</span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-obsidian-deep/60 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400">IMPACT</div>
              <div className="text-base font-mono font-extrabold text-cyan-400">
                {selectedNode.proofOfWork?.verifiedImpactScore || 90}
                <span className="text-[10px] text-slate-500">/100</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-obsidian-deep/60 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400">COMMITS</div>
              <div className="text-base font-mono font-extrabold text-emerald-400">
                {selectedNode.proofOfWork?.totalCommits || 400}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-obsidian-deep/60 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400">REPOS</div>
              <div className="text-base font-mono font-extrabold text-purple-400">
                {selectedNode.proofOfWork?.repos?.length || 1}
              </div>
            </div>
          </div>

          {/* Languages from Code Bytes */}
          <div className="p-3 rounded-xl bg-obsidian-deep/60 border border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Verified Languages (Code Bytes)</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.proofOfWork?.topLanguages?.map(lang => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-200"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Repositories List */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Production Repositories</div>
            {selectedNode.proofOfWork?.repos?.map(repo => (
              <div
                key={repo.name}
                className="p-3 rounded-xl bg-obsidian-surface/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs text-white hover:text-cyan-400 flex items-center space-x-1.5"
                  >
                    <span>{repo.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                    {repo.impactScore} Pts
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">{repo.description}</p>

                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center space-x-1 text-cyan-300">
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
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center space-x-1">
                <FileText className="w-3 h-3 text-amber-400" />
                <span>Peer-Reviewed Papers & Pre-Prints</span>
              </div>
              {selectedNode.proofOfWork.papers.map((paper, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs">
                  <div className="font-bold text-white mb-1 leading-snug">{paper.title}</div>
                  <div className="text-[10px] font-mono text-amber-400 mb-1">{paper.conference} ({paper.year})</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">{paper.abstract}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUB-PANEL 2: SHORTEST VERIFIED TRUST PATH VISUALIZER */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 font-bold">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Shortest Verified Trust Path</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              TRUST: {highlightedPath?.compositeTrustScore || 0.94}
            </span>
          </div>

          {highlightedPath ? (
            <div className="p-3.5 rounded-xl bg-obsidian-deep/80 border border-amber-500/30 space-y-3">
              {/* Visual Hop Chain */}
              <div className="space-y-2">
                {highlightedPath.hops.map((hop, idx) => (
                  <div key={idx} className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      <span className="font-bold text-white">{hop.fromNode.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({hop.fromNode.persona})</span>
                    </div>

                    <div className="ml-1 pl-3 border-l-2 border-dashed border-amber-400/60 py-1 text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                      <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{hop.relationship}</span>
                      <span className="text-slate-500">[{Math.round(hop.trustWeight * 100)}%]</span>
                    </div>

                    {idx === highlightedPath.hops.length - 1 && (
                      <div className="flex items-center space-x-2 pt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                        <span className="font-bold text-white">{hop.toNode.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({hop.toNode.persona})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Rationale */}
              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 font-mono leading-relaxed">
                💡 <span className="text-amber-300">Why this bridge works:</span> {highlightedPath.rationale}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-obsidian-deep/40 border border-white/5 text-xs text-slate-400 text-center font-mono">
              Direct connection or multi-hop link ready to vouch.
            </div>
          )}
        </div>
      </div>

      {/* SUB-PANEL 3: 2-WAY ACTION CONTROLS */}
      <div className="p-4 border-t border-white/10 bg-obsidian-surface/90 space-y-2">
        {/* Button 1: Request 1-Tap Warm Vouch via WhatsApp */}
        <button
          onClick={() => requestWarmVouch(selectedNode.id)}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-obsidian font-bold text-xs tracking-wide shadow-glow-green flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
        >
          <Smartphone className="w-4 h-4 text-obsidian" />
          <span>
            {vouchStatus === 'vouched'
              ? '✅ 3-Person Intro Group Active (Open WhatsApp)'
              : 'Request 1-Tap Warm Vouch via WhatsApp'}
          </span>
        </button>

        {/* Button 2: Unlock via 60-Second Technical Micro-Audit */}
        <button
          onClick={() => setIsMicroAuditModalOpen(true)}
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center justify-center space-x-2 transition-colors"
        >
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Unlock via 60-Second Technical Micro-Audit</span>
        </button>
      </div>
    </aside>
  );
}
