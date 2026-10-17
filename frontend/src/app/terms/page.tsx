import React from 'react';
import type { Metadata } from 'next';
import LegalHeader from '@/components/kin/LegalHeader';
import KinFooter from '@/components/kin/KinFooter';
import TableOfContents from '@/components/kin/TableOfContents';
import { legalConfig } from '@/lib/legal-config';
import { FileText, ShieldAlert, CheckCircle2, UserCheck, AlertOctagon, Scale, Landmark } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours ISR

export const metadata: Metadata = {
  title: 'Terms of Service | KIN Living Academic Network',
  description:
    'Terms of Service for KIN. Rules of engagement for alumni requirement posting, candidate double opt-in introductions, zero-spam enforcement, and governing law.',
  alternates: {
    canonical: `${legalConfig.siteUrl}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'acceptable-use', title: '2. Acceptable Use & Zero-Spam Policy' },
  { id: 'how-intros-work', title: '3. How Introductions Work (Double Opt-In)' },
  { id: 'no-guarantee', title: '4. No Guarantee of Hiring Outcomes' },
  { id: 'suspension-termination', title: '5. Account Suspension & WhatsApp Blocking' },
  { id: 'limitation-liability', title: '6. Limitation of Liability' },
  { id: 'governing-law', title: '7. Governing Law & Dispute Resolution' },
  { id: 'contact-entity', title: '8. Legal Contact & Notices' },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#141815] flex flex-col font-body selection:bg-[#EAD8C6]">
      <LegalHeader />

      {/* Hero Banner */}
      <section className="w-full bg-[#11131A] text-white pt-14 pb-16 px-[var(--gutter)] border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B6E64A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#B6E64A]/10 border border-[#B6E64A]/30 text-[#B6E64A] text-[11px] font-mono tracking-widest uppercase mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>CAMPUS NETWORK TERMS OF ENGAGEMENT</span>
          </div>
          <h1
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            Terms of Service
          </h1>
          <p className="text-[#9CA3AF] text-base md:text-lg max-w-3xl leading-relaxed">
            By interacting with the KIN WhatsApp interface or web platform, you agree to these Terms. KIN connects collegiate alumni and proven student engineers under strict principles of mutual consent, academic integrity, and zero spam.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#9CA3AF]">
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
              Entity: {legalConfig.companyName}
            </span>
            <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
              Effective: {legalConfig.policyUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="w-full max-w-7xl mx-auto px-[var(--gutter)] py-12 md:py-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents */}
          <TableOfContents sections={SECTIONS} />

          {/* Terms Content */}
          <article className="flex-1 space-y-14 max-w-3xl leading-relaxed text-[#2D3139]">

            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">01</span>
                <span>Acceptance of Terms</span>
              </h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the services, applications, and WhatsApp bot operated by <strong>{legalConfig.companyName}</strong> (&ldquo;KIN&rdquo;).
              </p>
              <p>
                By initiating a chat with our WhatsApp number, transmitting voice notes, posting hiring requirements, or accepting candidate introductions, you certify that you are at least 18 years of age and agree to be bound by these Terms and our <a href="/privacy" className="text-emerald-700 underline font-medium">Privacy Policy</a>.
              </p>
            </section>

            {/* Section 2 */}
            <section id="acceptable-use" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">02</span>
                <span className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 inline" />
                  <span>Acceptable Use & Zero-Spam Policy</span>
                </span>
              </h2>
              <p>
                The KIN network is built on trusted campus relationships. You strictly agree NOT to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Post False or Phantom Requirements:</strong> Posting fictitious roles, unbacked venture listings, or fake compensation offers to harvest student resumes is strictly prohibited.</li>
                <li><strong>Transmit Unsolicited Broadcasts or Spam:</strong> You may not use WhatsApp or candidate contact information obtained through KIN to send mass marketing, advertising, cryptocurrency promotions, or unsolicited commercial messages.</li>
                <li><strong>Harass or Discriminate:</strong> Any harassment, abusive conduct, or discriminatory behavior targeting candidates or alumni based on gender, caste, religion, disability, or regional origin will result in immediate permanent banning.</li>
                <li><strong>Scrape or Harvest Data:</strong> Automated extraction of candidate profiles, contact numbers, or network graph data through bots, scripts, or reverse-engineering is expressly barred.</li>
                <li><strong>Circumvent Security:</strong> Forging webhook signatures, flooding WhatsApp rate limits, or injecting malicious prompts into LLM extraction fields is a breach of security subject to legal prosecution.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="how-intros-work" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">03</span>
                <span className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-600 inline" />
                  <span>How Introductions Work (Double Opt-In)</span>
                </span>
              </h2>
              <p>
                KIN operates on an inviolable <strong>Double Opt-In mechanism</strong>:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>When an alumnus identifies a matching student card and taps <em>&ldquo;Request intro&rdquo;</em>, contact details are <strong>NOT</strong> immediately revealed.</li>
                <li>A discrete introduction dispatch is sent to the candidate over WhatsApp containing the role summary, organization name, and alumnus background.</li>
                <li>The candidate has <strong>48 hours</strong> to review and tap either <em>&ldquo;Accept Intro&rdquo;</em> or <em>&ldquo;Decline&rdquo;</em>.</li>
                <li>Only upon the candidate&apos;s explicit affirmative acceptance are phone numbers and email contacts mutually shared between both parties.</li>
                <li>If the candidate declines or does not respond within 48 hours, the request expires gracefully and no contact details are ever disclosed.</li>
              </ol>
            </section>

            {/* Section 4 */}
            <section id="no-guarantee" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">04</span>
                <span className="flex items-center space-x-2">
                  <AlertOctagon className="w-5 h-5 text-amber-600 inline" />
                  <span>No Guarantee of Hiring Outcomes</span>
                </span>
              </h2>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
                <strong>Platform Disclaimer:</strong> KIN is a matching and introduction conduit. KIN is <strong>not</strong> an employer, headhunter, employment agency, or escrow intermediary.
              </div>
              <p>
                We do not guarantee:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>That an alumnus will receive candidate matches for any specific requirement.</li>
                <li>That any matched candidate will accept an introduction request.</li>
                <li>That any introduction will result in an interview, job offer, contract, or payment.</li>
                <li>The professional performance, background integrity, or character of any matched candidate or alumnus.</li>
              </ul>
              <p>
                Both alumni and students are solely responsible for conducting their own technical evaluations, reference checks, and employment contract agreements.
              </p>
            </section>

            {/* Section 5 */}
            <section id="suspension-termination" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">05</span>
                <span>Account Suspension & WhatsApp Blocking</span>
              </h2>
              <p>
                We reserve the right, in our sole discretion and without prior notice, to suspend, terminate, or block any phone number from accessing KIN services if:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You violate any provision of these Terms or our acceptable use charter.</li>
                <li>We receive credible complaints of spamming, harassment, or ghosting following accepted intros.</li>
                <li>You exceed security rate limits or tamper with our WhatsApp webhook protocols.</li>
                <li>Required by law enforcement or collegiate institution administrators.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="limitation-liability" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">06</span>
                <span className="flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-emerald-600 inline" />
                  <span>Limitation of Liability</span>
                </span>
              </h2>
              <p className="uppercase text-xs tracking-wider text-gray-500 font-mono">
                Please read this section carefully as it limits KIN&apos;s legal liability.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, KIN AND ITS DIRECTORS, EMPLOYEES, AND ACADEMIC PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF REVENUE, DATA LOSS, LOSS OF BUSINESS OPPORTUNITIES, OR EMPLOYMENT DISPUTES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL CUMULATIVE LIABILITY EXCEED THE AMOUNT PAID BY YOU TO KIN IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE THOUSAND INDIAN RUPEES (INR 1,000), WHICHEVER IS LESS.
              </p>
            </section>

            {/* Section 7 */}
            <section id="governing-law" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">07</span>
                <span className="flex items-center space-x-2">
                  <Landmark className="w-5 h-5 text-emerald-600 inline" />
                  <span>Governing Law & Dispute Resolution</span>
                </span>
              </h2>
              <p>
                These Terms and any dispute or claim arising out of or related to them shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>, without giving effect to any choice of law or conflict of law principles.
              </p>
              <p>
                Any legal suit, action, or proceeding arising out of or related to these Terms shall be instituted exclusively in the <strong>competent courts located in New Delhi, India</strong>, and each party irrevocably submits to the exclusive personal jurisdiction of such courts.
              </p>
            </section>

            {/* Section 8 */}
            <section id="contact-entity" className="scroll-mt-28 space-y-4">
              <h2
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-2xl font-bold text-[#11131A] flex items-center space-x-3 pb-3 border-b border-black/10"
              >
                <span className="text-[#B6E64A] bg-[#11131A] px-2.5 py-0.5 rounded text-sm font-mono">08</span>
                <span>Legal Contact & Notices</span>
              </h2>
              <p>
                All legal notices, questions, or formal disputes regarding these Terms must be directed in writing to:
              </p>
              <div className="p-4 rounded-xl bg-[#F4EFE6] border border-black/5 font-mono text-sm space-y-1">
                <div><strong>Legal Counsel:</strong> Legal & Compliance Department</div>
                <div><strong>Email:</strong> <a href={`mailto:${legalConfig.contactEmail}`} className="text-emerald-700 underline">{legalConfig.contactEmail}</a></div>
                <div><strong>Entity:</strong> {legalConfig.companyName}</div>
                <div><strong>Address:</strong> {legalConfig.companyAddress}</div>
              </div>
            </section>

          </article>
        </div>
      </main>

      <KinFooter />
    </div>
  );
}
