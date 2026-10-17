'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  RotateCw,
  AlertTriangle,
  Building2,
  TrendingUp,
  Filter,
  Flag,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface FunnelData {
  totalRequirements: number;
  confirmedRequirements: number;
  introsRequested: number;
  introsAccepted: number;
  conversionRate: number;
}

interface RequirementItem {
  id: string;
  title: string;
  type: string;
  alumnusName: string;
  institution: string;
  phoneMasked: string;
  status: string;
  accuracyFlag: string;
  matchCount: number;
  avgMatchScore: number;
  createdAt: string;
  matches: Array<{ candidateName: string; score: number; status: string }>;
}

interface FailedJob {
  id: string;
  jobType: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  updatedAt: string;
}

export default function WhatsAppAdminPage() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [institutions, setInstitutions] = useState<Array<{ name: string; count: number }>>([]);
  const [selectedInst, setSelectedInst] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchData = async (inst = selectedInst) => {
    setLoading(true);
    try {
      const url = inst ? `/api/whatsapp/admin?institution=${encodeURIComponent(inst)}` : '/api/whatsapp/admin';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setFunnel(json.funnel);
        setRequirements(json.requirements || []);
        setFailedJobs(json.failedJobs || []);
        setInstitutions(json.institutions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/whatsapp/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_job', jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Job queued for immediate re-execution.');
        fetchData();
      } else {
        setStatusMessage('Failed to retry job.');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleFlagAccuracy = async (reqId: string, flag: string) => {
    try {
      await fetch('/api/whatsapp/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'flag_accuracy', requirementId: reqId, accuracyFlag: flag }),
      });
      setRequirements((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, accuracyFlag: flag } : r))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D0B] text-[#E0E6DC] p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202922] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B6E64A] animate-pulse" />
              <h1 className="text-2xl font-bold tracking-tight text-white">KIN WhatsApp Console</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#18231B] border border-[#2B3B2F] text-[#B6E64A] font-mono">
                TELEMETRY & QUEUE
              </span>
            </div>
            <p className="text-sm text-[#8B988E] mt-1">
              Real-time requirement extraction, candidate match quality, funnel metrics, and background jobs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Institution Filter */}
            <div className="flex items-center gap-2 bg-[#121814] border border-[#202922] rounded-xl px-3 py-2 text-sm">
              <Filter className="w-4 h-4 text-[#8B988E]" />
              <select
                aria-label="Filter requirements by institution"
                value={selectedInst}
                onChange={(e) => {
                  setSelectedInst(e.target.value);
                  fetchData(e.target.value);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#121814]">All Campuses</option>
                {institutions.map((i) => (
                  <option key={i.name} value={i.name} className="bg-[#121814]">
                    {i.name} ({i.count})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#161F18] border border-[#2B3B2F] rounded-xl text-sm font-medium hover:bg-[#1E2B21] transition text-white"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B6E64A]' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-[#162B1D] border border-[#2E5E3A] text-sm text-[#A8FFB2]">
            {statusMessage}
          </div>
        )}

        {/* Funnel Metrics */}
        {funnel && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#121814] border border-[#202922] p-5 rounded-2xl">
              <p className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Total Requirements</p>
              <p className="text-3xl font-bold text-white mt-2">{funnel.totalRequirements}</p>
              <p className="text-xs text-[#8B988E] mt-1">Submitted via voice & text</p>
            </div>

            <div className="bg-[#121814] border border-[#202922] p-5 rounded-2xl">
              <p className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Confirmed (Active)</p>
              <p className="text-3xl font-bold text-[#B6E64A] mt-2">{funnel.confirmedRequirements}</p>
              <p className="text-xs text-[#8B988E] mt-1">Alumnus verified echo</p>
            </div>

            <div className="bg-[#121814] border border-[#202922] p-5 rounded-2xl">
              <p className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Intros Requested</p>
              <p className="text-3xl font-bold text-white mt-2">{funnel.introsRequested}</p>
              <p className="text-xs text-[#8B988E] mt-1">Double opt-in initiated</p>
            </div>

            <div className="bg-[#121814] border border-[#202922] p-5 rounded-2xl">
              <p className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Intros Accepted</p>
              <p className="text-3xl font-bold text-[#B6E64A] mt-2">{funnel.introsAccepted}</p>
              <p className="text-xs text-[#8B988E] mt-1">Contacts exchanged</p>
            </div>

            <div className="bg-[#121814] border border-[#202922] p-5 rounded-2xl col-span-2 lg:col-span-1">
              <p className="text-xs font-mono text-[#8B988E] uppercase tracking-wider">Conversion</p>
              <p className="text-3xl font-bold text-white mt-2">{funnel.conversionRate}%</p>
              <p className="text-xs text-[#8B988E] mt-1">Lead to connection</p>
            </div>
          </div>
        )}

        {/* Failed Background Jobs Queue & Dead-Letter Table */}
        <div className="bg-[#121814] border border-[#202922] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${failedJobs.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <h2 className="text-base font-semibold text-white">Background Job Queue & Dead-Letter Table</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A1813] text-amber-300 border border-amber-900/40">
                {failedJobs.length} Failed / Dead
              </span>
            </div>
          </div>

          {failedJobs.length === 0 ? (
            <div className="text-center py-6 text-sm text-[#8B988E]">
              All background jobs (transcription, LLM extraction, matching) operating smoothly with zero dead letters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#202922] text-xs font-mono text-[#8B988E]">
                    <th className="pb-3">Job ID</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Attempts</th>
                    <th className="pb-3">Last Error</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B231D]">
                  {failedJobs.map((job) => (
                    <tr key={job.id} className="text-xs">
                      <td className="py-3 font-mono text-[#8B988E]">{job.id.slice(0, 10)}...</td>
                      <td className="py-3 font-medium text-white">{job.jobType}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono">{job.attempts} / {job.maxAttempts}</td>
                      <td className="py-3 text-red-300 max-w-xs truncate">{job.lastError || 'Unknown error'}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRetryJob(job.id)}
                          disabled={retryingJobId === job.id}
                          className="px-3 py-1 rounded-lg bg-[#162B1D] border border-[#2E5E3A] text-[#B6E64A] hover:bg-[#1E3B27] transition font-medium"
                        >
                          {retryingJobId === job.id ? 'Retrying...' : 'Retry Job'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Requirements & Match Quality */}
        <div className="bg-[#121814] border border-[#202922] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B6E64A]" />
              <h2 className="text-base font-semibold text-white">Recent Requirements & Match Quality</h2>
            </div>
            <span className="text-xs text-[#8B988E]">Showing {requirements.length} recent records</span>
          </div>

          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-center py-10 text-[#8B988E] text-sm">
                No requirements recorded yet. Message the KIN WhatsApp number to submit one.
              </div>
            ) : (
              requirements.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#0D120F] border border-[#1E2620] hover:border-[#2C382F] transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-base">{req.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B241E] text-[#B6E64A] border border-[#2D3D32]">
                        {req.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase ${
                          req.status === 'open'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#8B988E]">
                      Posted by <span className="text-white font-medium">{req.alumnusName}</span> ({req.institution}) • {req.phoneMasked} • {new Date(req.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <span className="text-white">
                        Matches: <strong className="text-[#B6E64A]">{req.matchCount}</strong>
                      </span>
                      <span className="text-white">
                        Avg Fit: <strong>{req.avgMatchScore}%</strong>
                      </span>
                      {req.matches.length > 0 && (
                        <span className="text-[#8B988E] truncate max-w-md">
                          Top: {req.matches.map((m) => `${m.candidateName} (${m.score}%)`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accuracy Flag Buttons */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <span className="text-xs text-[#8B988E] mr-1">Extraction:</span>
                    <button
                      onClick={() => handleFlagAccuracy(req.id, 'accurate')}
                      className={`px-2.5 py-1 rounded text-xs transition border ${
                        req.accuracyFlag === 'accurate'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                          : 'bg-[#151D17] text-[#8B988E] border-[#202922] hover:text-white'
                      }`}
                    >
                      Accurate
                    </button>
                    <button
                      onClick={() => handleFlagAccuracy(req.id, 'needs_review')}
                      className={`px-2.5 py-1 rounded text-xs transition border ${
                        req.accuracyFlag === 'needs_review'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                          : 'bg-[#151D17] text-[#8B988E] border-[#202922] hover:text-white'
                      }`}
                    >
                      Needs Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
