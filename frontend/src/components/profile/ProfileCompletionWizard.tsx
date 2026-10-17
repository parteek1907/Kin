'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Linkedin,
  Github,
  Globe,
  UploadCloud,
  Code2,
  FileText,
  Clock,
  Layers,
  ExternalLink,
  Loader2,
  Compass,
  Award,
  Check,
} from 'lucide-react';
import { useAuth, UserProfile } from '@/context/AuthContext';

interface ProfileCompletionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'student' | 'professional' | 'alumni';
}

function cleanUrl(input?: string, prefix?: 'linkedin' | 'github'): string {
  if (!input) return '';
  let trimmed = input.trim();
  if (!trimmed) return '';

  if (prefix === 'linkedin') {
    if (!trimmed.includes('linkedin.com')) {
      const handle = trimmed.replace(/^@/, '');
      return `https://linkedin.com/in/${handle}`;
    }
  } else if (prefix === 'github') {
    if (!trimmed.includes('github.com')) {
      const handle = trimmed.replace(/^@/, '');
      return `https://github.com/${handle}`;
    }
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export default function ProfileCompletionWizard({
  isOpen,
  onClose,
  initialRole = 'student',
}: ProfileCompletionWizardProps) {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();

  const isStudent =
    initialRole === 'student' ||
    user?.userType === 'student' ||
    (typeof window !== 'undefined' && localStorage.getItem('kin_network_role') === 'student');

  const roleType: 'student' | 'professional' = isStudent ? 'student' : 'professional';

  // Step 1 to 4
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Student Form State
  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || 'IIIT Delhi');
  const [degree, setDegree] = useState(user?.headline || 'B.Tech Computer Science & AI');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '2026');

  // Shared Link State
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');

  // Student Step 3 & 4
  const [skillsInput, setSkillsInput] = useState(
    user?.skills && user.skills.length > 0
      ? user.skills.join(', ')
      : 'React, Next.js, Python, FastAPI, TypeScript, PyTorch'
  );
  const [careerTrack, setCareerTrack] = useState(
    user?.role || 'Full-Stack & AI Systems Builder'
  );
  const [bio, setBio] = useState(
    user?.summary ||
      (isStudent
        ? 'Undergraduate CS builder building agentic intelligence workflows, high-concurrency backends, and full-stack interfaces.'
        : 'Tech leader & engineering mentor helping campus builders ship production-grade software.')
  );
  const [topProjectUrl, setTopProjectUrl] = useState(user?.topProjectUrl || '');
  const [topProjectDescription, setTopProjectDescription] = useState(
    user?.topProjectDescription || ''
  );
  const [resumeFileName, setResumeFileName] = useState(user?.resumeName || '');

  // Professional / Alumni Specific State
  const [currentCompany, setCurrentCompany] = useState(
    !isStudent ? (user?.institution || 'Anthropic / TechCorp AI') : 'IIIT Delhi'
  );
  const [jobTitle, setJobTitle] = useState(
    !isStudent ? (user?.role || 'Senior Distributed Systems Architect') : 'Student'
  );
  const [almaMater, setAlmaMater] = useState(
    user?.institution || 'IIIT Delhi (Class of 2021)'
  );
  const [contributionTypes, setContributionTypes] = useState<string[]>([
    'Mentoring Students',
    'Hiring Engineers',
  ]);
  const [officeHours, setOfficeHours] = useState(
    user?.officeHours || '1 hour bi-weekly via WhatsApp / Zoom'
  );

  // Pre-fill from current user when modal opens
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.institution) setInstitution(user.institution);
      if (user.headline) setDegree(user.headline);
      if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl);
      if (user.githubUrl) setGithubUrl(user.githubUrl);
      if (user.portfolioUrl) setPortfolioUrl(user.portfolioUrl);
      if (user.summary) setBio(user.summary);
      if (user.skills && user.skills.length > 0) {
        setSkillsInput(user.skills.join(', '));
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const toggleContribution = (type: string) => {
    if (contributionTypes.includes(type)) {
      setContributionTypes(contributionTypes.filter((t) => t !== type));
    } else {
      setContributionTypes([...contributionTypes, type]);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResumeUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
    }
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    const cleanedLinkedin = cleanUrl(linkedinUrl, 'linkedin');
    const cleanedGithub = cleanUrl(githubUrl, 'github');
    const cleanedPortfolio = cleanUrl(portfolioUrl);
    const cleanedProjectUrl = cleanUrl(topProjectUrl, 'github');

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedData: Partial<UserProfile> = {
      name: name.trim() || 'Verified Member',
      role: isStudent ? careerTrack.trim() : jobTitle.trim(),
      headline: isStudent ? degree.trim() : `${jobTitle} at ${currentCompany}`,
      institution: isStudent ? institution.trim() : currentCompany.trim(),
      userType: roleType,
      verificationStatus: isStudent ? 'verified_student' : 'verified_professional',
      linkedinUrl: cleanedLinkedin || undefined,
      githubUrl: cleanedGithub || undefined,
      portfolioUrl: cleanedPortfolio || undefined,
      summary: bio.trim(),
      skills: skillsArray,
      graduationYear: graduationYear.trim() || undefined,
      resumeName: resumeFileName || undefined,
      officeHours: !isStudent ? officeHours.trim() : undefined,
      interests: !isStudent ? contributionTypes : [careerTrack],
      topProjectUrl: cleanedProjectUrl || undefined,
      topProjectDescription: topProjectDescription.trim() || undefined,
    };

    try {
      await updateUserProfile(updatedData);

      // Persist to server API route
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          email: user?.email || 'builder@kin.network',
          studentId: user?.studentId,
          businessId: user?.businessId,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
        router.push(`/dashboard?role=${roleType === 'professional' ? 'alumni' : 'student'}`);
      }, 1200);
    } catch (err) {
      console.error('Failed to complete profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-[32px] bg-white border border-slate-100 p-6 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.25)] text-slate-900 my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Pill & Stepper */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isStudent ? 'bg-orange-100 text-[#E25C38]' : 'bg-slate-900 text-white'
                }`}
              >
                {isStudent ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                  Step {currentStep} of 4 • {isStudent ? 'Student Profile' : 'Professional Profile'}
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {currentStep === 1 && (isStudent ? 'Academic & Core Identity' : 'Professional Affiliation')}
                  {currentStep === 2 && 'Public Footprint & Links'}
                  {currentStep === 3 && (isStudent ? 'Tech Stack & Specialization' : 'Mentorship & Network Scope')}
                  {currentStep === 4 && (isStudent ? 'Proof of Work & Resume' : 'Executive Bio & Welcome Note')}
                </h2>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 mr-8">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === currentStep
                      ? 'w-7 bg-[#E25C38]'
                      : s < currentStep
                      ? 'w-2.5 bg-emerald-500'
                      : 'w-2.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              STEP 1: IDENTITY & AFFILIATION
              ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-600">
                {isStudent
                  ? 'Verify your name and academic credentials. This establishes your verified reputation on campus.'
                  : 'Enter your leadership identity and firm. Students and alumni will discover you through these credentials.'}
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name <span className="text-[#E25C38]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prateek Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                />
              </div>

              {isStudent ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        University / Campus <span className="text-[#E25C38]">*</span>
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. IIIT Delhi"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Graduation Year <span className="text-[#E25C38]">*</span>
                      </label>
                      <input
                        type="text"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        placeholder="e.g. 2026 or 2027"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Degree & Major / Branch
                    </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science & Artificial Intelligence"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Current Company / Firm <span className="text-[#E25C38]">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        placeholder="e.g. Google DeepMind, Anthropic, Stealth AI"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Current Job Title <span className="text-[#E25C38]">*</span>
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Staff Systems Architect / Founder"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Alma Mater / Degree Background
                    </label>
                    <input
                      type="text"
                      value={almaMater}
                      onChange={(e) => setAlmaMater(e.target.value)}
                      placeholder="e.g. IIIT Delhi (Class of 2021) or Stanford MS"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              STEP 2: PUBLIC FOOTPRINT & REAL CLICKABLE LINKS
              ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-600">
                Add your real links. These will be rendered as active, clickable links directly on your dashboard profile.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                    <span>LinkedIn Profile URL</span>
                  </span>
                  {linkedinUrl && (
                    <a
                      href={cleanUrl(linkedinUrl, 'linkedin')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Test link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username or username"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-800" />
                    <span>GitHub Profile URL</span>
                  </span>
                  {githubUrl && (
                    <a
                      href={cleanUrl(githubUrl, 'github')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-slate-800 hover:underline flex items-center gap-0.5"
                    >
                      <span>Test link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username or username"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Personal Website / Company / Portfolio</span>
                  </span>
                  {portfolioUrl && (
                    <a
                      href={cleanUrl(portfolioUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Test link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourwebsite.dev or https://company.ai"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all font-mono"
                />
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              STEP 3: SKILLS, FOCUS & SCOPE
              ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              {isStudent ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Primary Tech Stack & Skills (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. React, Next.js, FastAPI, PyTorch, Docker, TypeScript"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Primary Career Interest
                    </label>
                    <input
                      type="text"
                      value={careerTrack}
                      onChange={(e) => setCareerTrack(e.target.value)}
                      placeholder="e.g. AI Systems Builder, Full-Stack Software Engineer, Foundational ML"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Builder Summary / Headline Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell alumni and founders what you love building and what you are learning next..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all resize-none leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      How would you like to contribute to the campus network?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Mentoring Students',
                        'Hiring Engineers',
                        'Sponsoring Bounties',
                        'Reviewing Code PRs',
                        'Mock Technical Interviews',
                        'Founder Networking',
                      ].map((item) => {
                        const active = contributionTypes.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleContribution(item)}
                            className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                              active
                                ? 'bg-[#E25C38]/10 border-[#E25C38] text-[#E25C38]'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{item}</span>
                            {active && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Mentorship Slot / Office Hours Availability
                    </label>
                    <input
                      type="text"
                      value={officeHours}
                      onChange={(e) => setOfficeHours(e.target.value)}
                      placeholder="e.g. 1 hour every alternate weekend via WhatsApp / Zoom"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Core Domain Expertise (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. Distributed Consensus, LLM Fine-tuning, Product Strategy, Seed Capital"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              STEP 4: PROOF OF WORK & RESUME
              ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              {isStudent ? (
                <>
                  <p className="text-xs text-slate-600">
                    Showcase your flagship repository and attach your verified CV to complete your onboarding.
                  </p>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#E25C38]" />
                      <span>Featured GitHub Project URL</span>
                    </label>
                    <input
                      type="text"
                      value={topProjectUrl}
                      onChange={(e) => setTopProjectUrl(e.target.value)}
                      placeholder="https://github.com/username/flagship-repo"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Project Highlights in 1-2 Sentences
                    </label>
                    <input
                      type="text"
                      value={topProjectDescription}
                      onChange={(e) => setTopProjectDescription(e.target.value)}
                      placeholder="e.g. High-throughput indexing pipeline processing 10k events/sec using Go & Redis."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                      <span>Upload CV / Resume (PDF / Doc)</span>
                    </label>
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#E25C38] transition-all bg-slate-50 flex flex-col items-center justify-center text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        id="resume-file-input"
                        onChange={handleResumeUploadSim}
                        className="hidden"
                      />
                      <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="w-7 h-7 text-[#E25C38] mb-1.5" />
                        <span className="text-xs font-bold text-slate-800">
                          {resumeFileName ? resumeFileName : 'Click to select Resume file'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {resumeFileName ? 'File attached • Ready for verification' : 'PDF, DOCX, or text'}
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    Add a personal note or advice for campus students looking up to your trajectory.
                  </p>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Executive Bio & Career Summary
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your journey from university to your current leadership role..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Top Advice for Campus Builders
                    </label>
                    <input
                      type="text"
                      value={topProjectDescription}
                      onChange={(e) => setTopProjectDescription(e.target.value)}
                      placeholder="e.g. Focus on end-to-end distributed systems depth and verified open-source PRs."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] focus:bg-white transition-all"
                    />
                  </div>
                </>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile successfully persisted! Directing to verified dashboard...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              NAVIGATION & ACTIONS FOOTER
              ═════════════════════════════════════════════════════════════════ */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-[#E25C38] hover:bg-[#cf4b27] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save & Launch Dashboard</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
