'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Sparkles,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Lock,
  ArrowRight,
  Globe,
  MapPin,
  Loader2,
} from 'lucide-react';

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [phone, setPhone] = useState('+919876543201');
  const [name, setName] = useState('Aditi Sharma');
  const [headline, setHeadline] = useState('Final Year CS @ IIIT Delhi | Full-Stack & Systems');
  const [institution, setInstitution] = useState('IIIT Delhi');
  const [batch, setBatch] = useState('2024');
  const [location, setLocation] = useState('Delhi');
  const [isRemote, setIsRemote] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [available, setAvailable] = useState(true);
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL']);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/candidate?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        const cand = data.candidate;
        setName(cand.name);
        setHeadline(cand.headline);
        setInstitution(cand.institution);
        setBatch(cand.batch);
        setLocation(cand.location);
        setIsRemote(cand.isRemote);
        setDiscoverable(cand.discoverable);
        setAvailable(cand.available);
        setSkills(cand.skills || []);
        setConsentAgreed(Boolean(cand.consentGivenAt));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneE164: phone,
          name,
          headline,
          institution,
          batch,
          location,
          isRemote,
          discoverable,
          available,
          skills,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D0B] flex items-center justify-center text-white">
        <Loader2 className="w-6 h-6 animate-spin text-[#B6E64A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D0B] text-[#E0E6DC] p-6 lg:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#202922] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#B6E64A] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            Candidate Privacy & Discoverability Portal
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Candidate Settings</h1>
          <p className="text-sm text-[#8B988E] mt-1">
            Control how college alumni discover your skills on KIN. Your contact details are never shared without your explicit click.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-[#162B1D] border border-[#2E5E3A] text-sm text-[#A8FFB2] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#B6E64A]" />
            Your candidate profile preferences and consent have been updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Status & Availability Toggles */}
          <div className="bg-[#121814] border border-[#202922] rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-white">Discoverability & Opportunity Status</h2>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D120F] border border-[#1E2620]">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-white">WhatsApp Discoverability</span>
                <p className="text-xs text-[#8B988E]">
                  Allow alumni looking for talent to match with your profile via KIN.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiscoverable(!discoverable)}
                className="text-white focus:outline-none"
              >
                {discoverable ? (
                  <ToggleRight className="w-9 h-9 text-[#B6E64A]" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-[#4B554D]" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D120F] border border-[#1E2620]">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-white">Currently Available</span>
                <p className="text-xs text-[#8B988E]">
                  Flag that you are actively open to new internships, hires, or mentorship.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className="text-white focus:outline-none"
              >
                {available ? (
                  <ToggleRight className="w-9 h-9 text-[#B6E64A]" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-[#4B554D]" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D120F] border border-[#1E2620]">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-white">Open to Remote Roles</span>
                <p className="text-xs text-[#8B988E]">
                  Include your profile for remote work requirements across India.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRemote(!isRemote)}
                className="text-white focus:outline-none"
              >
                {isRemote ? (
                  <ToggleRight className="w-9 h-9 text-[#B6E64A]" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-[#4B554D]" />
                )}
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-[#121814] border border-[#202922] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Profile Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8B988E] mb-1.5 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D120F] border border-[#202922] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6E64A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B988E] mb-1.5 uppercase">WhatsApp Phone (E.164)</label>
                <input
                  type="text"
                  value={phone}
                  readOnly
                  className="w-full bg-[#161C18] border border-[#202922] rounded-xl px-4 py-2.5 text-sm text-[#8B988E] font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B988E] mb-1.5 uppercase">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#0D120F] border border-[#202922] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6E64A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B988E] mb-1.5 uppercase">Batch</label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full bg-[#0D120F] border border-[#202922] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6E64A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8B988E] mb-1.5 uppercase">Headline / Focus</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#0D120F] border border-[#202922] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6E64A]"
              />
            </div>
          </div>

          {/* Skills Tag Input */}
          <div className="bg-[#121814] border border-[#202922] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Skills & Technologies</h2>
            <p className="text-xs text-[#8B988E]">
              KIN matches requirements against these tags using skill overlap and semantic cosine similarity.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1B261E] text-[#B6E64A] border border-[#2B3E2F]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill (e.g. PyTorch, Rust, Figma)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 bg-[#0D120F] border border-[#202922] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#B6E64A]"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 rounded-xl bg-[#16261A] border border-[#2E5E3A] text-[#B6E64A] hover:bg-[#1E3B27] text-sm font-medium transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Explicit Consent Agreement */}
          <div className="bg-[#121814] border border-[#202922] rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentCheckbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#2E5E3A] text-[#B6E64A] focus:ring-[#B6E64A] focus:ring-offset-[#0A0D0B] bg-[#0D120F] cursor-pointer"
                required
              />
              <label htmlFor="consentCheckbox" className="text-xs text-[#8B988E] leading-relaxed cursor-pointer">
                <strong className="text-white">Explicit Privacy & Double Opt-In Consent:</strong> I agree to allow KIN to match my profile for relevant campus hiring, internship, and collaboration requests. I understand that my phone number and email will <strong className="text-white">never be disclosed</strong> to alumni unless I explicitly click <strong className="text-[#B6E64A]">"Yes"</strong> in response to an introduction request on WhatsApp.
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || !consentAgreed}
              className="px-6 py-3 rounded-full bg-[#B6E64A] text-black font-semibold text-sm hover:bg-[#c9f563] transition shadow-lg shadow-[#b6e64a]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
