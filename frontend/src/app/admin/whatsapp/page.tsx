'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  RotateCw,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface MessageRecord {
  id: string;
  waMessageId: string;
  phoneMasked: string;
  direction: 'inbound' | 'outbound';
  type: string;
  body: string | null;
  templateName: string | null;
  status: string;
  errorCode: string | null;
  createdAt: string;
}

interface AdminData {
  summary: {
    contactsCount: number;
    totalOutbound: number;
    failuresCount: number;
  };
  templateStats: Array<{ templateName: string; count: number }>;
  messages: MessageRecord[];
}

export default function WhatsAppAdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/admin');
      if (res.ok) {
        const json = await res.json();
        setData(json);
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

  const handleResend = async (messageId: string) => {
    setResendingId(messageId);
    setActionMsg(null);
    try {
      const res = await fetch('/api/whatsapp/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionMsg(`✅ Resent message successfully. New ID: ${json.newMessageId}`);
        fetchData();
      } else {
        setActionMsg(`❌ Resend failed: ${json.error}`);
      }
    } catch (err: any) {
      setActionMsg(`❌ Error: ${err.message}`);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#07080C] text-white pt-28 pb-20 px-[var(--gutter)] flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-[#B6E64A]/10 border border-[#B6E64A]/30 text-[#B6E64A]">
                Admin Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              WhatsApp Observability
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Message audit trail, delivery metrics, template dispatch volumes, and failure recovery
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition-colors flex items-center gap-2"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/settings/notifications"
              className="px-4 py-2 rounded-xl bg-[#B6E64A] text-[#07080C] text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              User Settings
            </Link>
          </div>
        </div>

        {/* Action feedback banner */}
        {actionMsg && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200">
            {actionMsg}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wider mb-2">
              <span>Opted-In Contacts</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {data?.summary.contactsCount ?? 0}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wider mb-2">
              <span>Total Dispatches</span>
              <Send className="w-4 h-4 text-[#B6E64A]" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {data?.summary.totalOutbound ?? 0}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wider mb-2">
              <span>Delivery Failures</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              {data?.summary.failuresCount ?? 0}
            </div>
          </div>
        </div>

        {/* Template Counts Grid */}
        {data?.templateStats && data.templateStats.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-[#0F1117] border border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">
              Template Dispatch Volumes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.templateStats.map((tpl) => (
                <div key={tpl.templateName} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] font-mono text-zinc-400 truncate">{tpl.templateName}</div>
                  <div className="text-lg font-bold font-mono text-white mt-1">{tpl.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Audit Table */}
        <div className="rounded-2xl bg-[#0F1117] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent WhatsApp Message Activity</h2>
            <span className="text-xs font-mono text-zinc-400">
              {data?.messages?.length ?? 0} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Recipient / Sender</th>
                  <th className="py-3 px-4">Type / Template</th>
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {data?.messages?.map((msg) => (
                  <tr key={msg.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {msg.direction === 'outbound' ? (
                        <span className="inline-flex items-center gap-1 text-[#B6E64A]">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Outbound
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-cyan-400">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Inbound
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-zinc-300">
                      {msg.phoneMasked}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 text-[11px]">
                        {msg.templateName || msg.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-zinc-400 font-sans">
                      {msg.body || '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {msg.status === 'read' ? (
                        <span className="text-cyan-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Read
                        </span>
                      ) : msg.status === 'delivered' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Delivered
                        </span>
                      ) : msg.status === 'failed' ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Failed ({msg.errorCode || 'Err'})
                        </span>
                      ) : msg.status === 'sent' ? (
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <span className="text-zinc-400">{msg.status}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {msg.status === 'failed' ? (
                        <button
                          onClick={() => handleResend(msg.id)}
                          disabled={resendingId === msg.id}
                          className="px-2.5 py-1 rounded bg-[#B6E64A]/10 border border-[#B6E64A]/30 text-[#B6E64A] hover:bg-[#B6E64A]/20 transition-colors uppercase text-[10px] font-semibold flex items-center gap-1 ml-auto"
                        >
                          {resendingId === msg.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCw className="w-3 h-3" />
                          )}
                          Resend
                        </button>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {(!data?.messages || data.messages.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-sans">
                      No WhatsApp activity recorded yet. Inbound webhook events and outbound notifications will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
