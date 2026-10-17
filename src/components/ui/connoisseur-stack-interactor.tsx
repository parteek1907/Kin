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
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80",
    tagline: "Cryptographic AST Code Parser",
    stat: "42,819 Commits Indexed"
  },
  {
    num: "02",
    name: "WARM TRUST ROUTING",
    clipId: "clip-modules",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
    tagline: "Shortest Dijkstra Campus Path",
    stat: "94.2% Handshake Rate"
  },
  {
    num: "03",
    name: "INTENT BROADCAST",
    clipId: "clip-matrix",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1000&q=80",
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

    // 1. IN (Expo Out)
    tl.to(selector, {
      scale: 1,
      duration: 0.75,
      stagger: { amount: 0.35, from: "random" },
      ease: "power4.out",
    })
    // 2. IDLE (Subtle Breath)
    .to(selector, {
      scale: 1.03,
      duration: 1.4,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      stagger: { amount: 0.15, from: "center" }
    })
    // 3. OUT (Expo In)
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
        "flex flex-col lg:flex-row items-center justify-between w-full p-8 sm:p-14 lg:p-20 overflow-hidden",
        "bg-[#07090F] border border-white/[0.08] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative", 
        className
      )}
    >
      {/* Muted Atmospheric Gradient */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* LEFT SIDE: EDITORIAL HIGH-CRAFT MENU */}
      <div className="z-20 w-full lg:w-1/2">
        <div className="mb-8 flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-400 font-semibold">
            Nexus Kinetic Stack Engine
          </span>
        </div>

        <nav>
          <ul className="flex flex-col gap-8 sm:gap-10">
            {items.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <li
                  key={item.num}
                  onMouseEnter={() => handleItemHover(index)}
                  onClick={() => handleItemHover(index)}
                  className="group cursor-pointer select-none"
                >
                  <div className="flex items-start gap-6">
                    {/* Number */}
                    <span className={cn(
                      "text-xl sm:text-2xl font-mono font-bold transition-all duration-300 mt-1",
                      isActive 
                        ? "text-cyan-400" 
                        : "text-zinc-600 group-hover:text-zinc-400" 
                    )}>
                      {item.num}
                    </span>
                    
                    {/* Title & Tagline */}
                    <div className="flex flex-col">
                      <h2 className={cn(
                        "text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] transition-all duration-300 font-sans",
                        isActive 
                          ? "text-white translate-x-2" 
                          : "text-zinc-500 hover:text-zinc-300"
                      )}>
                        {item.name}
                      </h2>
                      
                      {item.tagline && (
                        <p className={cn(
                          "mt-2 text-xs sm:text-sm font-medium transition-all duration-300",
                          isActive ? "text-zinc-300 opacity-100 translate-x-2" : "text-zinc-600 opacity-0"
                        )}>
                          {item.tagline} • <span className="font-mono text-cyan-400 font-semibold">{item.stat}</span>
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

      {/* RIGHT SIDE: GEOMETRIC SVG MORPHING APERTURES (NO BURGER) */}
      <div className="relative w-full lg:w-1/2 flex justify-center items-center mt-12 lg:mt-0">
        <svg 
          viewBox="0 0 500 500" 
          className="w-full max-w-[440px] h-auto z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0D16]"
        >
          <defs>
            {/* Aperture 1: Sleek Horizontal Code Slats */}
            <clipPath id="clip-slats">
              {Array.from({ length: 6 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x="20"
                  y={20 + i * 78}
                  width="460"
                  height="64"
                  rx="8"
                />
              ))}
            </clipPath>

            {/* Aperture 2: Precision Architectural Quadrant Modules */}
            <clipPath id="clip-modules">
              <rect className="path" x="25" y="25" width="215" height="290" rx="14" />
              <rect className="path" x="25" y="330" width="215" height="145" rx="14" />
              <rect className="path" x="260" y="25" width="215" height="145" rx="14" />
              <rect className="path" x="260" y="185" width="215" height="290" rx="14" />
            </clipPath>

            {/* Aperture 3: 4x4 High-Density Micro-Matrix */}
            <clipPath id="clip-matrix">
              {Array.from({ length: 16 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x={(i % 4) * 115 + 25}
                  y={Math.floor(i / 4) * 115 + 25}
                  width="100"
                  height="100"
                  rx="8" 
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
