import React from "react";

interface BentoItem {
  title: string;
  description: string;
  imageUrl?: string;
  colSpan?: string;
}

interface FeatureProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  items?: BentoItem[];
}

const DEFAULT_ITEMS: BentoItem[] = [
  {
    title: "Connect Public Repositories",
    description: "Link GitHub commits, PRs, and arXiv research preprints to automatically generate verifiable proof of work.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    colSpan: "lg:col-span-2"
  },
  {
    title: "Faculty Laboratory Vouching",
    description: "Campus lab directors and professors anchor your node with cryptographic endorsements.",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1"
  },
  {
    title: "Instant Intent Matching",
    description: "Alumni broadcast technical needs; Kin matches skill graphs and creates instant warm groups.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1"
  },
  {
    title: "Direct Founder Access",
    description: "Skip recruiter gatekeepers and corporate spam. Connect directly with founders who value verifiable craft.",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    colSpan: "lg:col-span-2"
  }
];

function Feature({
  badge = "HOW TO USE KIN",
  title = "How the living proof network works.",
  subtitle = "From line-of-code commits to high-conviction alumni intros in four deterministic steps.",
  items = DEFAULT_ITEMS
}: FeatureProps) {
  return (
    <section id="how-to-use" className="w-full py-20 lg:py-32 px-[var(--gutter)] bg-[#FFFDF8] border-t border-[#E5E0D8]/60">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-12">
          
          {/* Header (No pill shape) */}
          <div className="flex gap-4 flex-col items-start max-w-3xl">
            <div>
              <span 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[12px] md:text-[13px] font-bold tracking-[0.26em] text-[#8A829A] uppercase block leading-none"
              >
                {badge}
              </span>
            </div>
            <div className="flex gap-4 flex-col">
              <h2 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[0.05em] text-[#11131A] leading-[1.25] text-left uppercase"
              >
                {title}
              </h2>
              <p 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-lg md:text-xl leading-[1.7] tracking-[0.02em] text-[#686875] text-left max-w-2xl font-normal"
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, index) => {
              const isWide = item.colSpan?.includes("col-span-2");

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-xl border border-[#E5E0D8] bg-[#FAF7F0] p-8 md:p-10 flex flex-col justify-end shadow-[0_4px_20px_rgba(34,18,10,0.03)] hover:shadow-[0_8px_30px_rgba(34,18,10,0.06)] hover:border-[#11131A]/20 transition-all duration-200 min-h-[280px] md:min-h-[300px] ${
                    item.colSpan || ""
                  }`}
                >
                  {/* Fixed Static Background Image (Zero jumping/zooming) */}
                  {item.imageUrl && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                      style={{ backgroundImage: `url('${item.imageUrl}')` }}
                    />
                  )}

                  {/* Gradient Scrim for crisp readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F0] via-[#FAF7F0]/95 to-[#FAF7F0]/60 pointer-events-none" />

                  {/* Content (Zero icons, zero step tags, zero arrow icons) */}
                  <div className="relative z-10 flex flex-col">
                    <h3 
                      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                      className="text-xl md:text-2xl font-bold tracking-tight text-[#11131A] mb-3"
                    >
                      {item.title}
                    </h3>
                    <p 
                      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                      className={`text-[#5A5B64] text-sm md:text-base leading-relaxed ${
                        isWide ? "max-w-lg" : "max-w-xs"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

export { Feature };
