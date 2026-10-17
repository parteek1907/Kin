import React from 'react';
import type { Metadata } from 'next';
import LegalHeader from '@/components/kin/LegalHeader';
import KinFooter from '@/components/kin/KinFooter';
import TableOfContents from '@/components/kin/TableOfContents';
import { legalConfig } from '@/lib/legal-config';
import { Shield, Lock, Cpu, Mic, Users, Scale, Clock, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours ISR

export const metadata: Metadata = {
  title: 'Privacy Policy | KIN Living Academic Network',
  description:
    'Official Privacy Policy for KIN. Transparent disclosure on WhatsApp voice note transcription, AI matching neutrality, double opt-in introductions, and India DPDP Act 2023 compliance.',
  alternates: {
    canonical: `${legalConfig.siteUrl}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SECTIONS = [
  { id: 'who-we-are', title: '1. Who We Are & Contact' },
  { id: 'data-we-collect', title: '2. Data We Collect' },
  { id: 'how-we-use-data', title: '3. How We Use Data' },
  { id: 'voice-notes-processing', title: '4. Voice Notes & Immediate Audio Deletion' },
  { id: 'ai-matching-neutrality', title: '5. AI Processing & Neutrality Guarantee' },
  { id: 'double-opt-in-sharing', title: '6. Double Opt-In & Third-Party Processors' },
  { id: 'legal-basis-consent', title: '7. Legal Basis & Consent Withdrawal' },
  { id: 'data-retention', title: '8. Data Retention Schedule' },
  { id: 'dpdp-rights-grievance', title: "9. Your Rights (India DPDP Act 2023) & Grievance Officer" },
  { id: 'security-children-transfers', title: '10. Security, Age Limits & Policy Changes' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#141815] flex flex-col font-body selection:bg-[#EAD8C6]">
      <LegalHeader />

      {/* Hero Banner */}
      <section className="w-full bg-[#11131A] text-white pt-14 pb-16 px-[var(--gutter)] border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B6E64A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B6E64A]/10 border border-[#B6E64A]/30 text-[#B6E64A] text-[11px] font-mono tracking-widest uppercase mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>TRANSPARENT ALUMNI & STUDENT DATA CHARTER</span>
          </div>
          <h1
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            Privacy Policy
          </h1>
          <p className="text-[#9CA3AF] text-base md:text-lg max-w-3xl leading-relaxed">
            KIN is designed around privacy-by-design. We do not require an app or password. This policy explains what happens when you message KIN on WhatsApp, how voice notes are transcribed, how our matching engine works neutrally, and your rights under India&apos;s Digital Personal Data Protection Act (DPDP Act 2023).
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#9CA3AF]">
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
              Company: {legalConfig.companyName}
            </span>
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
              Last Updated: {legalConfig.policyUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="w-full max-w-7xl mx-auto px-[var(--gutter)] py-12 md:py-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents */}
          <TableOfContents sections={SECTIONS} />

          {/* Policy Content */}
          <article className="flex-1 space-y-14 max-w-3xl leading-relaxed text-[#2D3139]">
            
            {/* Section 1 */}
            <section id="who-we-are" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">01</span>
                <span>Who We Are & Contact</span>
              </h2>
              <p>
                <strong>{legalConfig.companyName}</strong> (&ldquo;KIN&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates a conversational academic network connecting college alumni, verified student builders, and collegiate research faculty across accredited higher education institutions.
              </p>
              <p>
                For any questions or privacy inquiries regarding this policy or our data practices, contact our Data Privacy Team at:
              </p>
              <div className="p-4 rounded-xl bg-[#F4EFE6] border border-black/5 font-mono text-sm space-y-1">
                <div><strong>Email:</strong> <a href={`mailto:${legalConfig.contactEmail}`} className="text-emerald-700 underline">{legalConfig.contactEmail}</a></div>
                <div><strong>Entity:</strong> {legalConfig.companyName}</div>
                <div><strong>Registered Address:</strong> {legalConfig.companyAddress}</div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="data-we-collect" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">02</span>
                <span>Data We Collect</span>
              </h2>
              <p>
                We only collect data strictly necessary to facilitate alumni requirement discovery and verified student matching:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Phone Number:</strong> Your WhatsApp phone number in standardized E.164 format (e.g. <code>+91 98765 43210</code>), used as your primary identifier.</li>
                <li><strong>Name, Institution & Batch:</strong> Your identity and educational affiliation (e.g., IIIT Delhi, Batch of 2024), imported from institution rosters or provided during conversational onboarding.</li>
                <li><strong>Candidate Profiles & Skills (Students):</strong> Verified technical competencies, GitHub commit proofs, portfolio links, primary frameworks, and graduation year.</li>
                <li><strong>WhatsApp Inbound Messages & Voice Notes:</strong> Natural language text messages and audio notes sent by you describing hiring or project requirements.</li>
                <li><strong>Structured Requirement Details:</strong> Extracted role titles, required skills, preferred seniority, location/remote preference, headcount, and urgency.</li>
                <li><strong>Introduction Request & Match History:</strong> Records of candidate cards viewed, double opt-in intro requests dispatched, and candidate responses.</li>
                <li><strong>Basic Usage & Telemetry Logs:</strong> Timestamped webhook delivery receipts and error codes, with phone numbers masked for privacy compliance (e.g., <code>+91••••••3419</code>).</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="how-we-use-data" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">03</span>
                <span>How We Use Data</span>
              </h2>
              <p>Your information is used exclusively to:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Accurately parse and structure hiring, internship, and advisory requirements posted via text or audio.</li>
                <li>Execute objective candidate matching based solely on verified engineering proof and skill requirements.</li>
                <li>Deliver anonymized candidate cards directly inside your WhatsApp conversation window.</li>
                <li>Facilitate mutual Double Opt-In introductions between alumni and candidates.</li>
                <li>Maintain audit trails and handle user data deletion requests in accordance with applicable laws.</li>
              </ol>
            </section>

            {/* Section 4 */}
            <section id="voice-notes-processing" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">04</span>
                <span className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-emerald-600 inline" />
                  <span>Voice Notes & Immediate Audio Deletion</span>
                </span>
              </h2>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
                <strong>Strict Audio Retention Rule:</strong> When you send a WhatsApp voice note (in English, Hindi, or Hinglish), the raw audio stream is transcribed by an automated speech-to-text service (OpenAI Whisper or Groq Whisper). <strong>The raw audio file is permanently deleted from server memory immediately after transcription.</strong> We retain only the textual transcript.
              </div>
              <p>
                We do not build voiceprints, biometric profiles, or voice identification models from your voice notes.
              </p>
            </section>

            {/* Section 5 */}
            <section id="ai-matching-neutrality" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">05</span>
                <span className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-emerald-600 inline" />
                  <span>AI Processing & Neutrality Guarantee</span>
                </span>
              </h2>
              <p>
                KIN utilizes modern Large Language Models (LLMs) to extract structured requirements (such as technical skill tags, seniority level, and location preference) from colloquial conversational input.
              </p>
              <div className="p-5 rounded-xl bg-[#11131A] text-white border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-[#B6E64A] font-bold text-sm">
                  <Scale className="w-4 h-4" />
                  <span>Zero-Protected-Characteristic Policy</span>
                </div>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  Our matching engine is deterministic and mathematically auditable. <strong>Protected characteristics—including gender, age, religion, caste, socio-economic origin, and physical appearance—have exactly ZERO weight (0.0) in our scoring algorithms.</strong> Scoring is derived purely from verified skill overlap, code evidence, experience fit, and institutional graph proximity.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="double-opt-in-sharing" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">06</span>
                <span>Double Opt-In & Third-Party Processors</span>
              </h2>
              <p>
                <strong>Double Opt-In Guarantee:</strong> Candidate contact numbers and private emails are NEVER displayed publicly or shared with alumni upon initial search. Contact information is released <strong>strictly after the candidate receives the requirement summary and explicitly taps &ldquo;Accept Introduction&rdquo;</strong> in their own WhatsApp chat.
              </p>
              <p>We work with the following sub-processors to deliver KIN services:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-black/10 rounded-lg overflow-hidden">
                  <thead className="bg-[#EFECE6] text-left text-xs uppercase font-mono">
                    <tr>
                      <th className="p-3 border-b border-black/10">Processor</th>
                      <th className="p-3 border-b border-black/10">Role</th>
                      <th className="p-3 border-b border-black/10">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <tr>
                      <td className="p-3 font-semibold">Meta Platforms, Inc.</td>
                      <td className="p-3">WhatsApp Cloud API messaging infrastructure</td>
                      <td className="p-3">United States / Global</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Vercel Inc.</td>
                      <td className="p-3">Serverless application hosting and webhook runtime</td>
                      <td className="p-3">United States / Global Edge</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Groq Inc. / OpenAI, LLC</td>
                      <td className="p-3">Automated audio transcription and structured LLM extraction</td>
                      <td className="p-3">United States</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7 */}
            <section id="legal-basis-consent" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">07</span>
                <span>Legal Basis & Consent Withdrawal</span>
              </h2>
              <p>
                We process your personal data on the basis of your explicit consent, which is digitally recorded with an immutable timestamp upon your first message or onboarding confirmation.
              </p>
              <p>
                <strong>Withdrawing Consent:</strong> You may withdraw your consent at any time:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Send <strong>&ldquo;STOP&rdquo;</strong> to our WhatsApp number to immediately unsubscribe from updates.</li>
                <li>Send <strong>&ldquo;DELETE MY DATA&rdquo;</strong> or visit our <a href="/data-deletion" className="text-emerald-700 underline font-semibold">Data Deletion Portal</a> to permanently erase your records.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="data-retention" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">08</span>
                <span className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-emerald-600 inline" />
                  <span>Data Retention Schedule</span>
                </span>
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Voice Audio Files:</strong> 0 days (deleted immediately post-transcription).</li>
                <li><strong>Transcripts & Requirement Specs:</strong> Retained for <strong>12 months</strong> to allow alumni to revisit prior candidate matches, after which they are automatically expunged.</li>
                <li><strong>WhatsApp Operational Message Logs:</strong> Retained for <strong>6 months</strong> for security auditing and debugging.</li>
                <li><strong>User Deletion Requests:</strong> Executed immediately via automated self-service, or within maximum <strong>30 days</strong> for manual email requests.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="dpdp-rights-grievance" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">09</span>
                <span>Your Rights (India DPDP Act 2023) & Grievance Officer</span>
              </h2>
              <p>
                In compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, you hold the following rights:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Right to Access:</strong> Request a summary of personal data held about you and processing activities undertaken.</li>
                <li><strong>Right to Correction & Erasure:</strong> Rectify inaccurate personal data or demand permanent erasure.</li>
                <li><strong>Right of Grievance Redressal:</strong> Register complaints with our designated Grievance Officer.</li>
                <li><strong>Right to Nominate:</strong> Nominate an individual to exercise rights on your behalf in the event of death or incapacity.</li>
              </ul>

              <div className="mt-4 p-5 rounded-2xl bg-[#11131A] text-white border border-white/10 space-y-2">
                <div className="text-sm font-mono tracking-wider text-[#B6E64A] uppercase font-bold">
                  Designated Data Protection & Grievance Officer
                </div>
                <div className="text-sm space-y-1 pt-1 font-mono">
                  <div><strong>Name:</strong> {legalConfig.grievanceOfficer.name}</div>
                  <div><strong>Email:</strong> <a href={`mailto:${legalConfig.grievanceOfficer.email}`} className="text-[#B6E64A] underline">{legalConfig.grievanceOfficer.email}</a></div>
                  <div><strong>Address:</strong> {legalConfig.grievanceOfficer.address}</div>
                </div>
                <div className="text-xs text-[#9CA3AF] pt-2 border-t border-white/10">
                  We acknowledge all grievances within 24 hours and resolve inquiries within 30 days.
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="security-children-transfers" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">10</span>
                <span>Security, Age Limits & Policy Changes</span>
              </h2>
              <p>
                <strong>Security Measures:</strong> We employ HMAC-SHA256 signature verification on all Meta webhook payloads, rate limit verification endpoints, isolate environment secrets server-side, and mask phone numbers in operational telemetry.
              </p>
              <p>
                <strong>Children&apos;s Data:</strong> KIN is designed exclusively for university students, alumni, and academic researchers aged <strong>18 and older</strong>. We do not knowingly collect or solicit personal information from minors under 18.
              </p>
              <p>
                <strong>Policy Revisions:</strong> We may update this policy periodically to reflect operational or regulatory updates. Any material changes will be announced via WhatsApp notice or highlighted on this page.
              </p>
            </section>

          </article>
        </div>
      </main>

      <KinFooter />
    </div>
  );
}
