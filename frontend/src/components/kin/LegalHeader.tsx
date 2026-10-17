'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Shield, FileText, Trash2, ExternalLink } from 'lucide-react';
import { waConfig } from '@/lib/whatsapp/config';

export default function LegalHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/privacy', label: 'Privacy Policy', icon: Shield },
    { href: '/terms', label: 'Terms of Service', icon: FileText },
    { href: '/data-deletion', label: 'Data Deletion', icon: Trash2 },
  ];

  const waLink = `https://wa.me/${waConfig.publicBusinessNumber}?text=Hi`;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#11131A]/95 backdrop-blur-md border-b border-white/10 text-[#FFFDF8] px-[var(--gutter)] py-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Return Link */}
        <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start">
          <Link
            href="/"
            className="flex items-center space-x-2 text-[13px] font-mono tracking-wider text-[#9CA3AF] hover:text-[#B6E64A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#B6E64A]" />
            <span>RETURN TO KIN</span>
          </Link>

          <div className="h-4 w-px bg-white/20 hidden md:block" />

          <Link href="/" className="flex items-center space-x-2.5">
            <img
              src="/images/kin_logo.png"
              alt="KIN"
              className="w-7 h-7 object-contain drop-shadow-[0_2px_8px_rgba(182,230,74,0.25)]"
            />
            <span
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="font-bold text-[18px] tracking-[0.24em] uppercase text-white"
            >
              KIN
            </span>
            <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-[#B6E64A]/10 text-[#B6E64A] border border-[#B6E64A]/30 font-semibold">
              TRUST & LEGAL
            </span>
          </Link>
        </div>

        {/* Tab Links */}
        <nav className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#B6E64A] text-[#11131A] font-semibold shadow-[0_0_15px_rgba(182,230,74,0.35)]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#11131A]' : 'text-[#B6E64A]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[12px] font-mono tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors ml-2"
          >
            <span>WHATSAPP BOT</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      </div>
    </header>
  );
}
