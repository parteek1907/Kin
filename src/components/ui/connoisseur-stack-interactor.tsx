"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";

export interface MenuItem {
  num: string;
  name: string;
  clipId: string;
  image: string;
  tagline?: string;
  stat?: string;
}

const defaultItems: MenuItem[] = [
  {
    num: "01",
    name: "ARTIFACT VERIFICATION",
    clipId: "clip-slats",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
    tagline: "Cryptographic AST Code Parser",
    stat: "42,819 Commits Indexed"
  },
  {
    num: "02",
    name: "WARM TRUST ROUTING",
    clipId: "clip-modules",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    tagline: "Shortest Dijkstra Campus Path",
    stat: "94.2% Handshake Rate"
  },
  {
    num: "03",
    name: "INTENT BROADCAST",
    clipId: "clip-matrix",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
    tagline: "Zero-Login WhatsApp Bridge",
    stat: "60-Second Micro-Audits"
  }
];

export const ConnoisseurStackInteractor = ({
  items = defaultItems,
  className
}: { items?: MenuItem[]; className?: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<SVGImageElement>(null);
  const mainGroupRef = useRef<SVGGElement>(null);
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const createLoop = (index: number) => {
    const item = items[index];
    const selector = `#${item.clipId} .path`;

    if (masterTl.current) masterTl.current.kill();

    if (imageRef.current) imageRef.current.setAttribute("href", item.image);
    if (mainGroupRef.current) mainGroupRef.current.setAttribute("clip-path", `url(#${item.clipId})`);
    
    gsap.set(selector, { scale: 0, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

    // 1. IN
    tl.to(selector, {
      scale: 1,
      duration: 0.75,
      stagger: { amount: 0.35, from: "random" },
      ease: "power4.out",
    })
    // 2. IDLE
    .to(selector, {
      scale: 1.03,
      duration: 1.4,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      stagger: { amount: 0.15, from: "center" }
    })
    // 3. OUT
    .to(selector, {
      scale: 0,
      duration: 0.55,
      stagger: { amount: 0.25, from: "edges" },
      ease: "power3.in",
    });

    masterTl.current = tl;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      createLoop(0);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleItemHover = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    createLoop(index);
  };

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "flex flex-col lg:flex-row items-center justify-between w-full p-8 sm:p-14 lg:p-16 overflow-hidden",
        "bg-[#FAF8F5] border border-black/[0.08] rounded-[36px] shadow-[0_20px_50px_rgba(24,29,25,0.06)] relative", 
        className
      )}
    >
      {/* Warm Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.04] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#E25C38]/[0.04] blur-[140px] rounded-full pointer-events-none" />

      {/* LEFT SIDE: TACTILE EDITORIAL MENU */}
      <div className="z-20 w-full lg:w-1/2">
        <div className="mb-8 flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-bold">
            Interactive Stack Pillars
          </span>
        </div>

        <nav>
          <ul className="flex flex-col gap-8 sm:gap-9">
            {items.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <li
                  key={item.num}
                  onMouseEnter={() => handleItemHover(index)}
                  onClick={() => handleItemHover(index)}
                  className="group cursor-pointer select-none"
                >
                  <div className="flex items-start gap-5">
                    {/* Number */}
                    <span className={cn(
                      "text-xl sm:text-2xl font-mono font-bold transition-all duration-300 mt-1",
                      isActive 
                        ? "text-[#E25C38] scale-105" 
                        : "text-zinc-400 group-hover:text-zinc-600" 
                    )}>
                      {item.num}
                    </span>
                    
                    {/* Title & Tagline */}
                    <div className="flex flex-col">
                      <h2 className={cn(
                        "text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] transition-all duration-300 font-sans",
                        isActive 
                          ? "text-[#181D19] translate-x-2" 
                          : "text-zinc-400 hover:text-zinc-600"
                      )}>
                        {item.name}
                      </h2>
                      
                      {item.tagline && (
                        <p className={cn(
                          "mt-2 text-xs sm:text-sm font-medium transition-all duration-300",
                          isActive ? "text-zinc-600 opacity-100 translate-x-2" : "text-zinc-400 opacity-0"
                        )}>
                          {item.tagline} • <span className="font-mono text-[#E25C38] font-bold">{item.stat}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* RIGHT SIDE: GEOMETRIC APERTURES (CLEAN TECH SLATS - NO BURGER) */}
      <div className="relative w-full lg:w-1/2 flex justify-center items-center mt-12 lg:mt-0">
        <svg 
          viewBox="0 0 500 500" 
          className="w-full max-w-[440px] h-auto z-10 drop-shadow-[0_20px_45px_rgba(0,0,0,0.12)] rounded-[28px] overflow-hidden border border-black/[0.08] bg-[#EFECE5]"
        >
          <defs>
            {/* Aperture 1: Sleek Horizontal Slats */}
            <clipPath id="clip-slats">
              {Array.from({ length: 6 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x="20"
                  y={20 + i * 78}
                  width="460"
                  height="64"
                  rx="12"
                />
              ))}
            </clipPath>

            {/* Aperture 2: Architectural Quadrant Modules */}
            <clipPath id="clip-modules">
              <rect className="path" x="25" y="25" width="215" height="290" rx="18" />
              <rect className="path" x="25" y="330" width="215" height="145" rx="18" />
              <rect className="path" x="260" y="25" width="215" height="145" rx="18" />
              <rect className="path" x="260" y="185" width="215" height="290" rx="18" />
            </clipPath>

            {/* Aperture 3: 4x4 High-Precision Matrix */}
            <clipPath id="clip-matrix">
              {Array.from({ length: 16 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x={(i % 4) * 115 + 25}
                  y={Math.floor(i / 4) * 115 + 25}
                  width="100"
                  height="100"
                  rx="12" 
                />
              ))}
            </clipPath>
          </defs>

          <g ref={mainGroupRef} clipPath={`url(#${items[0].clipId})`}>
            <image
              ref={imageRef}
              href={items[0].image}
              width="500"
              height="500"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export const Component = ConnoisseurStackInteractor;
export default ConnoisseurStackInteractor;
