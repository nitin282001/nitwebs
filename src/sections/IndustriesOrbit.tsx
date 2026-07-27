import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";

export interface IndustryItem {
  title: string;
  subheading?: string;
  desc?: string;
  icon?: string;
  tags?: string[];
  image?: string;
  imageUrl?: string;
}

export interface IndustriesOrbitProps {
  header?: {
    badge?: string;
    title?: string;
    desc?: string;
  };
  items?: IndustryItem[];
  isDesktop?: boolean;
  prefersReducedMotion?: boolean;
}

const DEFAULT_ITEMS: IndustryItem[] = [
  {
    title: "Artificial Intelligence",
    subheading: "Applied AI & Automation Solutions",
    desc: "We build custom machine learning pipelines, NLP models, and computer vision software to automate operational workflows.",
    tags: ["Machine Learning", "NLP", "Workflow Automation"],
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Generative AI",
    subheading: "Next-Gen LLM & Generative Systems",
    desc: "Deploy fine-tuned LLM agents, RAG enterprise search engines, and generative media production tools tailored to your domain.",
    tags: ["LLM Agents", "RAG Enterprise", "Custom Fine-Tuning"],
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "AR / VR & Spatial",
    subheading: "Immersive 3D & Spatial Computing",
    desc: "Craft interactive AR/VR applications, 3D product configurators, and spatial digital twins for enterprise training.",
    tags: ["Spatial Computing", "3D Web", "Interactive VR"],
    imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Blockchain & Web3",
    subheading: "Decentralized & Secure Ledger Tech",
    desc: "We build secure, industry-changing blockchain solutions, smart contracts, and decentralized architectures that revolutionize industries.",
    tags: ["Smart Contracts", "DeFi Protocols", "Tokenomics"],
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Metaverse & Gaming",
    subheading: "Virtual Environments & Ecosystems",
    desc: "Engaging virtual worlds, real-time multiplayer spaces, and digital asset management for global brand engagement.",
    tags: ["Virtual Worlds", "Real-Time 3D", "Digital Assets"],
    imageUrl: "https://images.unsplash.com/photo-1614680376593-902f749f7b68?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Data Analytics & BI",
    subheading: "Real-Time Insights & Platform Intelligence",
    desc: "Transform raw data streams into actionable executive dashboards, predictive forecasting, and unified data lakes.",
    tags: ["Data Architecture", "BI Dashboards", "Predictive Analytics"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
  }
];

export default function IndustriesOrbit({
  header,
  items = []
}: IndustriesOrbitProps) {
  const displayItems = items.length > 0 ? items : DEFAULT_ITEMS;
  const [rawActiveIdx, setActiveIdx] = useState<number>(0);
  const activeIdx = Math.max(0, Math.min(rawActiveIdx, displayItems.length - 1));

  const badgeText = header?.badge || "TECHNOLOGY SOLUTIONS";
  const titleText = header?.title || "Crafting Solutions with Technology that Works For You";
  const descText = header?.desc || "From Artificial Intelligence and Generative LLMs to Blockchain and Data Analytics, we build scalable software tailored to your growth goals.";

  return (
    <section id="industries" className="relative py-24 px-6 bg-transparent overflow-hidden">
      <GridDivider />
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-4xl mb-12">
          <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">
            {badgeText}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground leading-[1.15] mb-4">
            {titleText}
          </h2>
          <p className="text-secondary-text text-base sm:text-lg font-sans leading-relaxed">
            {descText}
          </p>
        </Reveal>

        {/* Interactive Accordion Cards Container */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px] w-full select-none">
          {displayItems.map((item, idx) => {
            const isExpanded = activeIdx === idx;
            const bgImg = item.imageUrl || item.image || DEFAULT_ITEMS[idx % DEFAULT_ITEMS.length].imageUrl;
            const subheading = item.subheading || item.title;
            const desc = item.desc || "High-performance software engineered for business acceleration and seamless digital integration.";

            return (
              <motion.div
                key={item.title + idx}
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                layout
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border border-border/80 shadow-2xl flex flex-col justify-between transition-all duration-500 ${
                  isExpanded
                    ? "lg:flex-[3.5] min-h-[440px] lg:min-h-[500px] border-primary/50"
                    : "lg:flex-1 min-h-[140px] lg:min-h-[500px] hover:border-white/40"
                }`}
              >
                {/* Background Image with Dynamic Gradient */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
                  style={{ backgroundImage: `url(${bgImg})` }}
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isExpanded
                      ? "bg-gradient-to-t from-black/95 via-black/50 to-black/70"
                      : "bg-gradient-to-t from-black/90 via-black/60 to-black/80 hover:bg-black/50"
                  }`}
                />

                {/* Card Container */}
                <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                  {/* Top Row: Title (when expanded) + Arrow Icon */}
                  <div className={`w-full flex items-center ${isExpanded ? "justify-between" : "justify-end"}`}>
                    {isExpanded && (
                      <h3 className="font-headline font-normal text-white text-xl sm:text-2xl tracking-tight">
                        {item.title}
                      </h3>
                    )}

                    {/* Arrow Action Badge */}
                    <div
                      className={`w-9 h-9 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all ${
                        isExpanded ? "bg-primary text-white border-primary scale-110" : "opacity-70 group-hover:opacity-100"
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Collapsed Title View (Bigger font, Vertical on Desktop) */}
                  {!isExpanded && (
                    <div className="my-auto pt-4 lg:pt-0 flex items-center justify-center">
                      <h3 className="font-headline font-normal text-white text-lg sm:text-xl lg:text-lg tracking-widest uppercase whitespace-nowrap lg:[writing-mode:vertical-lr] lg:rotate-180 opacity-95 transition-all">
                        {item.title}
                      </h3>
                    </div>
                  )}

                  {/* Expanded Details Bottom Content */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-auto"
                      >
                        <h4 className="text-xl sm:text-2xl font-headline font-normal text-white mb-3 leading-snug">
                          {subheading}
                        </h4>
                        <p className="text-neutral-300 text-xs sm:text-sm font-sans leading-relaxed max-w-lg">
                          {desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
