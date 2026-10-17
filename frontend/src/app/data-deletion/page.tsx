import React from 'react';
import type { Metadata } from 'next';
import LegalHeader from '@/components/kin/LegalHeader';
import KinFooter from '@/components/kin/KinFooter';
import TableOfContents from '@/components/kin/TableOfContents';
import DataDeletionForm from '@/components/kin/DataDeletionForm';
import { legalConfig } from '@/lib/legal-config';
import { waConfig } from '@/lib/whatsapp/config';
import { Trash2, Smartphone, ShieldCheck, Mail, Database, CheckCircle, Hash } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours ISR

export const metadata: Metadata = {
  title: 'Data Deletion Instructions & Portal | KIN Network',
  description:
    'Self-service user data erasure portal for KIN in compliance with India DPDP Act 2023. Send DELETE MY DATA on WhatsApp or use our 2-step verification form for permanent data removal.',
  alternates: {
    canonical: `${legalConfig.siteUrl}/data-deletion`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SECTIONS = [
  { id: 'overview', title: '1. Overview & Rights' },
  { id: 'deletion-methods', title: '2. Three Ways to Delete Your Data' },
  { id: 'web-form', title: '3. Interactive Deletion Form' },
  { id: 'scope-of-erasure', title: '4. Scope of Data Permanently Erased' },
  { id: 'anonymous-retention', title: '5. Anonymous Compliance Log' },
  { id: 'grievance-contact', title: '6. Grievance Officer Support' },
];

export default function DataDeletionPage() {
  const waDirectLink = `https://wa.me/${waConfig.publicBusinessNumber}?text=DELETE%20MY%20DATA`;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#141815] flex flex-col font-body selection:bg-[#EAD8C6]">
      <LegalHeader />

      {/* Hero Banner */}
      <section className="w-full bg-[#11131A] text-white pt-14 pb-16 px-[var(--gutter)] border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B6E64A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B6E64A]/10 border border-[#B6E64A]/30 text-[#B6E64A] text-[11px] font-mono tracking-widest uppercase mb-4">
            <Trash2 className="w-3.5 h-3.5" />
            <span>DPDP ACT 2023 COMPLIANT ERASURE CHARTER</span>
          </div>
          <h1
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            User Data Deletion
          </h1>
          <p className="text-[#9CA3AF] text-base md:text-lg max-w-3xl leading-relaxed">
            You maintain complete sovereignty over your academic and professional data. Learn how to immediately trigger full data deletion via WhatsApp, using the self-service web form below, or by contacting our Data Protection Officer.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#9CA3AF]">
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
              Entity: {legalConfig.companyName}
            </span>
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
              Status: Automated Self-Service Live
            </span>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="w-full max-w-7xl mx-auto px-[var(--gutter)] py-12 md:py-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents */}
          <TableOfContents sections={SECTIONS} />

          {/* Page Content */}
          <article className="flex-1 space-y-14 max-w-3xl leading-relaxed text-[#2D3139]">

            {/* Section 1 */}
            <section id="overview" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">01</span>
                <span>Overview & Rights</span>
              </h2>
              <p>
                Under Section 12 of India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, every Data Principal possesses the unconditional right to request the erasure of personal data that is no longer necessary for the purpose for which it was processed.
              </p>
              <p>
                KIN respects this right without friction. You do not need an account, password, or institutional approval to remove your information.
              </p>
            </section>

            {/* Section 2 */}
            <section id="deletion-methods" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">02</span>
                <span>Three Ways to Delete Your Data</span>
              </h2>
              <p>We provide three convenient channels to permanently delete your data:</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Method A */}
                <div className="p-5 rounded-2xl bg-[#11131A] text-white border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base mb-1">Option A: WhatsApp</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                      Send <strong>&ldquo;DELETE MY DATA&rdquo;</strong> to our WhatsApp bot. You will receive an interactive confirmation button to finalize deletion.
                    </p>
                  </div>
                  <a
                    href={waDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#B6E64A] text-[#11131A] font-bold text-xs uppercase tracking-wider hover:bg-[#cbf568] transition-colors"
                  >
                    <span>Open in WhatsApp</span>
                  </a>
                </div>

                {/* Method B */}
                <div className="p-5 rounded-2xl bg-[#11131A] text-white border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#B6E64A]/20 text-[#B6E64A] flex items-center justify-center mb-3">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base mb-1">Option B: Web Form</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                      Enter your phone number in the interactive form below. Receive a 6-digit WhatsApp code and confirm deletion directly on this page.
                    </p>
                  </div>
                  <a
                    href="#web-form"
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors"
                  >
                    <span>Jump to Form ↓</span>
                  </a>
                </div>

                {/* Method C */}
                <div className="p-5 rounded-2xl bg-[#11131A] text-white border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                      <Mail className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base mb-1">Option C: Email</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                      Email our Data Protection & Grievance Officer from your institutional or personal email stating your WhatsApp number.
                    </p>
                  </div>
                  <a
                    href={`mailto:${legalConfig.contactEmail}?subject=Data%20Deletion%20Request`}
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors"
                  >
                    <span>Email Privacy Team</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Section 3: Interactive Form */}
            <section id="web-form" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">03</span>
                <span>Interactive Deletion Form</span>
              </h2>
              <p>
                Use this self-service interface for instant verification and permanent data erasure. You will receive a 6-digit confirmation code on WhatsApp to verify ownership of the phone number.
              </p>

              {/* Render Interactive Form */}
              <div className="pt-2">
                <DataDeletionForm />
              </div>
            </section>

            {/* Section 4 */}
            <section id="scope-of-erasure" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">04</span>
                <span className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-600 inline" />
                  <span>Scope of Data Permanently Erased</span>
                </span>
              </h2>
              <p>
                When a deletion request is executed (via WhatsApp, web form, or email), KIN immediately erases:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F4EFE6] border border-black/5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Contact Profile:</strong> Your full name, university batch, institutional affiliation, and preferences are wiped.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F4EFE6] border border-black/5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Candidate Records (Students):</strong> All verified skills, portfolio URLs, GitHub proofs, and matching scores are permanently purged.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F4EFE6] border border-black/5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Requirements & Matches:</strong> All active and archived requirements, role descriptions, and candidate match cards are unlinked and destroyed.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F4EFE6] border border-black/5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Message Bodies & Transcripts:</strong> All historical WhatsApp message contents and voice transcripts are permanently overwritten with <code>[DELETED UPON USER REQUEST]</code>.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F4EFE6] border border-black/5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Introduction History:</strong> Dispatched and pending introduction requests are terminated immediately.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="anonymous-retention" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">05</span>
                <span className="flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-emerald-600 inline" />
                  <span>Anonymous Compliance Log</span>
                </span>
              </h2>
              <p>
                To demonstrate legal compliance with the DPDP Act and prevent re-indexing of opted-out phone numbers without storing personal data, we retain <strong>only an anonymous cryptographic entry</strong> in our audit log:
              </p>
              <div className="p-4 rounded-xl bg-[#11131A] text-white font-mono text-xs space-y-2 border border-white/10">
                <div className="text-[#B6E64A] font-bold">ANONYMIZED COMPLIANCE LOG SCHEMA:</div>
                <div className="text-gray-400">
                  &#123;<br />
                  &nbsp;&nbsp;&quot;confirmationCode&quot;: &quot;KIN-DEL-B8F102A7&quot;,<br />
                  &nbsp;&nbsp;&quot;phoneHash&quot;: &quot;e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&quot;, // One-way SHA-256<br />
                  &nbsp;&nbsp;&quot;requestedVia&quot;: &quot;web_form&quot; | &quot;whatsapp&quot;,<br />
                  &nbsp;&nbsp;&quot;status&quot;: &quot;completed&quot;,<br />
                  &nbsp;&nbsp;&quot;deletedAt&quot;: &quot;2026-10-17T17:50:00.000Z&quot;<br />
                  &#125;
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                The SHA-256 hash cannot be mathematically reversed to recover your phone number, but allows KIN to verify that a deletion request was successfully satisfied if queried by regulatory authorities.
              </p>
            </section>

            {/* Section 6 */}
            <section id="grievance-contact" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">06</span>
                <span>Grievance Officer Support</span>
              </h2>
              <p>
                If you encounter any difficulty utilizing the self-service web form or WhatsApp command, or if you require a formal confirmation certificate for institutional records, contact our designated Grievance Officer:
              </p>
              <div className="p-4 rounded-xl bg-[#F4EFE6] border border-black/5 font-mono text-sm space-y-1">
                <div><strong>Officer:</strong> {legalConfig.grievanceOfficer.name}</div>
                <div><strong>Email:</strong> <a href={`mailto:${legalConfig.grievanceOfficer.email}`} className="text-emerald-700 underline">{legalConfig.grievanceOfficer.email}</a></div>
                <div><strong>Address:</strong> {legalConfig.grievanceOfficer.address}</div>
                <div><strong>Entity:</strong> {legalConfig.companyName}</div>
              </div>
            </section>

          </article>
        </div>
      </main>

      <KinFooter />
    </div>
  );
}
