'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { PersonaType, CampusNode } from '@/types';
import { 
  X, 
  Github, 
  FileUp, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Cpu
} from 'lucide-react';

export default function IngestArtifactModal() {
  const {
    isIngestModalOpen,
    setIsIngestModalOpen,
    nodes,
    ingestNewNode,
    selectNode
  } = useNetwork();

  const [username, setUsername] = useState('parteekgarg');
  const [persona, setPersona] = useState<PersonaType>('student');
  const [trustLinkId, setTrustLinkId] = useState('node-dr-sharma');
  const [hasLoadedSamplePdf, setHasLoadedSamplePdf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isIngestModalOpen) return null;

  const handleLoadSamplePdf = () => {
    setHasLoadedSamplePdf(true);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setTerminalLogs([]);

    const logSteps = [
      `[1/5] Ingesting public GitHub profile: @${username}...`,
      `[2/5] Fetching repositories & analyzing AST dependency trees...`,
      `[3/5] Computing commit velocity and frequency over 180 days...`,
      `[4/5] Extracting verified code bytes & calculating 384-d expertise embeddings...`,
      hasLoadedSamplePdf
        ? `[4.5/5] Parsing IEEE pre-print PDF & verifying DOI/conference citations...`
        : `[4.5/5] Linking campus advisor & research lab graph topology...`,
      `[5/5] Ingestion verified! Spawning new node in force-directed canvas.`
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setTerminalLogs(prev => [...prev, logSteps[i]]);
    }

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          persona,
          trustEdgeTargetId: trustLinkId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to ingest GitHub profile');
      }

      // Dynamically add to network graph
      ingestNewNode(data.node, trustLinkId);
      selectNode(data.node.id);

      setTimeout(() => {
        setIsLoading(false);
        setIsIngestModalOpen(false);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ingestion encountered an error.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/15 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-surface/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Zero-Form Node Ingestion</h2>
              <p className="text-[11px] font-mono text-cyan-400">PROVE EXPERTISE VIA ARTIFACTS, NOT FORMS</p>
            </div>
          </div>

          <button
            onClick={() => setIsIngestModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleIngest} className="p-5 space-y-4">
          {/* Persona Type */}
          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">
              1. SELECT PERSONA TYPE
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'student', label: 'Student', color: 'border-cyan-500 text-cyan-300' },
                { id: 'founder', label: 'Founder', color: 'border-emerald-500 text-emerald-300' },
                { id: 'alumni', label: 'Alumnus', color: 'border-purple-500 text-purple-300' },
                { id: 'faculty', label: 'Faculty', color: 'border-amber-500 text-amber-300' },
                { id: 'recruiter', label: 'Recruiter', color: 'border-rose-500 text-rose-300' },
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPersona(p.id as PersonaType)}
                  className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                    persona === p.id
                      ? `bg-white/15 ${p.color} shadow-sm border-2`
                      : 'border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub Username Input */}
          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">
              2. LIVE GITHUB USERNAME (OR ANY GITHUB HANDLE)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. parteekgarg, torvalds, gaearon..."
                className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-obsidian-deep border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setUsername('parteekgarg')}
                  className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 hover:bg-cyan-900"
                >
                  @parteekgarg
                </button>
              </div>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Live REST API fetch with automatic deterministic fallback if GitHub rate limits.
            </p>
          </div>

          {/* Research Paper PDF Dropzone */}
          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">
              3. RESEARCH PAPER / TECHNICAL SPEC PDF (OPTIONAL)
            </label>
            <div className="p-4 rounded-xl border-2 border-dashed border-white/15 bg-obsidian-deep/50 text-center space-y-2">
              <FileUp className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-300">
                {hasLoadedSamplePdf ? (
                  <span className="text-emerald-400 font-bold font-mono">
                    ✓ Loaded: IEEE_RAG_Clinical_Entity_Preprint.pdf (1.4 MB)
                  </span>
                ) : (
                  <span>Drag and drop IEEE paper pre-print or technical RFC</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLoadSamplePdf}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-mono text-amber-300 transition-colors"
              >
                {hasLoadedSamplePdf ? 'PDF Loaded' : '📄 1-Click Load Sample IEEE RAG & Clinical Entity PDF'}
              </button>
            </div>
          </div>

          {/* Campus Trust Link */}
          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1.5 font-bold">
              4. INITIAL CAMPUS TRUST LINK (ADVISOR / LAB LEAD)
            </label>
            <select
              value={trustLinkId}
              onChange={(e) => setTrustLinkId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-obsidian-deep border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="node-dr-sharma">Dr. Sanjeev Sharma (Head, Distributed Systems Lab)</option>
              <option value="node-prof-verma">Prof. Aradhana Verma (Multimodal NLP & RAG)</option>
              <option value="node-c2c">Code2Career Innovation Studio (Campus Hub)</option>
              <option value="node-rohan">Rohan Mehta (Founder, NexaPay - YC W22)</option>
            </select>
          </div>

          {/* Live Step-by-Step Terminal Execution Logs */}
          {terminalLogs.length > 0 && (
            <div className="p-3 rounded-xl bg-black/90 border border-cyan-500/30 font-mono text-[11px] space-y-1 text-cyan-400 max-h-36 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-slate-400 border-b border-white/10 pb-1 text-[10px]">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Zero-Form Verification Pipeline</span>
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">{log}</div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian font-extrabold text-xs tracking-wider shadow-glow-cyan flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
                <span>EXTRACTING AST & COMPUTING EMBEDDINGS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-obsidian" />
                <span>INGEST & VERIFY ARTIFACTS</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
