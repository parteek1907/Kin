'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, List } from 'lucide-react';

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Sticky Selector */}
      <div className="lg:hidden sticky top-[73px] z-40 w-full bg-[#11131A]/90 backdrop-blur-md border-b border-white/10 mb-8 py-2">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between px-4 py-2 text-[13px] font-mono tracking-wider text-[#B6E64A] bg-white/5 rounded-lg border border-white/10"
        >
          <span className="flex items-center space-x-2">
            <List className="w-4 h-4" />
            <span>TABLE OF CONTENTS</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpenMobile ? 'rotate-180' : ''}`} />
        </button>

        {isOpenMobile && (
          <div className="mt-2 bg-[#1A1D26] rounded-xl border border-white/15 p-3 shadow-2xl space-y-1 max-h-72 overflow-y-auto">
            {sections.map((section, idx) => {
              const isActive = activeId === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => scrollTo(e, section.id)}
                  className={`block px-3 py-2 text-[13px] rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#B6E64A]/15 text-[#B6E64A] font-medium'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-[#B6E64A]/60 font-mono text-[11px] mr-2">0{idx + 1}.</span>
                  {section.title}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 p-5 rounded-2xl bg-[#11131A] border border-white/10 shadow-xl">
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-[0.2em] uppercase text-[#B6E64A] mb-4 pb-3 border-b border-white/10">
            <List className="w-3.5 h-3.5" />
            <span>Contents Navigation</span>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {sections.map((section, idx) => {
              const isActive = activeId === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => scrollTo(e, section.id)}
                  className={`group flex items-start space-x-2.5 px-3 py-2 rounded-lg text-[13px] transition-all leading-snug ${
                    isActive
                      ? 'bg-[#B6E64A]/10 text-white font-medium border-l-2 border-[#B6E64A]'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] mt-0.5 ${
                      isActive ? 'text-[#B6E64A] font-bold' : 'text-white/30 group-hover:text-white/60'
                    }`}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className={isActive ? 'text-white' : ''}>{section.title}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
