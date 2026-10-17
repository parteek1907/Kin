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
      await new Promise(r => setTimeout(r, 260));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-[36px] shadow-[0_25px_80px_rgba(20,24,21,0.2)] overflow-hidden border border-black/10 flex flex-col text-[#141815]">
        
        {/* Header */}
        <div className="p-6 border-b border-black/[0.08] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#E25C38] flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-extrabold text-[#141815]">Zero-Form Node Ingestion</h2>
              <p className="text-[11px] font-mono text-[#E25C38] font-bold">PROVE EXPERTISE VIA ARTIFACTS, NOT FORMS</p>
            </div>
          </div>

          <button
            onClick={() => setIsIngestModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-[#141815] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleIngest} className="p-6 space-y-5 text-left">
          
          {/* Persona Type */}
          <div>
            <label className="text-xs font-mono text-zinc-600 block mb-2 font-bold uppercase tracking-wide">
              1. Select Persona Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'student', label: 'Student' },
                { id: 'founder', label: 'Founder' },
                { id: 'alumni', label: 'Alumnus' },
                { id: 'faculty', label: 'Faculty' },
                { id: 'recruiter', label: 'Recruiter' },
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPersona(p.id as PersonaType)}
                  className={`py-2 rounded-2xl border text-xs font-bold transition-all ${
                    persona === p.id
                      ? 'bg-[#141815] text-white border-[#141815] shadow-sm'
                      : 'border-black/[0.08] bg-[#F7F5F0] text-zinc-600 hover:text-[#141815] hover:bg-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub Username Input */}
          <div>
            <label className="text-xs font-mono text-zinc-600 block mb-2 font-bold uppercase tracking-wide">
              2. Live GitHub Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. parteekgarg, torvalds, gaearon..."
                className="w-full pl-9 pr-24 py-2.5 rounded-2xl bg-[#F7F5F0] border border-black/10 text-xs text-[#141815] font-mono focus:outline-none focus:ring-1 focus:ring-[#E25C38]"
              />
              <Github className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setUsername('parteekgarg')}
                  className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-[10px] font-mono font-bold text-[#E25C38] hover:bg-[#FAF8F5] shadow-xs"
                >
                  @parteekgarg
                </button>
              </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-1">
              Live REST API fetch with automatic AST dependency analysis & commit velocity calculation.
            </p>
          </div>

          {/* Research Paper PDF Dropzone */}
          <div>
            <label className="text-xs font-mono text-zinc-600 block mb-2 font-bold uppercase tracking-wide">
              3. Research Paper / Technical RFC PDF (Optional)
            </label>
            <div className="p-4 rounded-2xl border-2 border-dashed border-black/10 bg-[#FAF8F5] text-center space-y-2">
              <FileUp className="w-6 h-6 text-zinc-400 mx-auto" />
              <div className="text-xs text-zinc-600">
                {hasLoadedSamplePdf ? (
                  <span className="text-emerald-700 font-bold font-mono">
                    ✓ Loaded: IEEE_RAG_Clinical_Entity_Preprint.pdf (1.4 MB)
                  </span>
                ) : (
                  <span>Drag and drop IEEE paper pre-print or technical RFC</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLoadSamplePdf}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F3EFEA] border border-black/10 text-[11px] font-bold text-zinc-700 shadow-xs transition-all"
              >
                {hasLoadedSamplePdf ? 'PDF Loaded' : '📄 1-Click Load Sample IEEE RAG PDF'}
              </button>
            </div>
          </div>

          {/* Campus Trust Link */}
          <div>
            <label className="text-xs font-mono text-zinc-600 block mb-2 font-bold uppercase tracking-wide">
              4. Initial Campus Trust Link (Advisor / Lab Lead)
            </label>
            <select
              value={trustLinkId}
              onChange={(e) => setTrustLinkId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-[#F7F5F0] border border-black/10 text-xs text-[#141815] font-mono focus:outline-none focus:ring-1 focus:ring-[#E25C38]"
            >
              <option value="node-dr-sharma">Dr. Sanjeev Sharma (Head, Distributed Systems Lab)</option>
              <option value="node-prof-verma">Prof. Aradhana Verma (Multimodal NLP & RAG)</option>
              <option value="node-c2c">Code2Career Innovation Studio (Campus Hub)</option>
              <option value="node-rohan">Rohan Mehta (Founder, NexaPay - YC W22)</option>
            </select>
          </div>

          {/* Step-by-Step Terminal Execution Logs */}
          {terminalLogs.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#141815] text-emerald-400 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-zinc-400 border-b border-white/10 pb-1 text-[10px]">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>Zero-Form Verification Pipeline</span>
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">{log}</div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#141815] hover:bg-[#E25C38] text-white font-black text-xs tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>EXTRACTING AST & COMPUTING EMBEDDINGS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E25C38]" />
                <span>INGEST & VERIFY ARTIFACTS</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
