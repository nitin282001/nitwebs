import { motion } from "motion/react";
import { 
  Layers, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Sparkles,
  ArrowUpRight,
  type LucideIcon 
} from "lucide-react";
import GridDivider from "../components/GridDivider";
import { Reveal, StaggerGrid, fadeUp } from "../lib/animations";

interface Point {
  icon: LucideIcon;
  title: string;
  desc: string;
  how: string;
  why: string;
  tag: string;
}

const POINTS: Point[] = [
  {
    icon: Layers,
    title: "Multi-tenant by design",
    desc: "One codebase, one deploy — full data and permission isolation per customer without per-client forks.",
    how: "Row-level isolation, not app-level hacks",
    why: "Your roadmap never forks per client",
    tag: "Architecture",
  },
  {
    icon: CreditCard,
    title: "Subscription billing, wired in on day one",
    desc: "Usage-based, seat-based, or hybrid pricing — integrated before your first customer signs up.",
    how: "Stripe & Paddle-native from commit one",
    why: "Change plans without touching checkout code",
    tag: "Monetization",
  },
  {
    icon: Zap,
    title: "A process built for speed",
    desc: "Discovery to production in weeks, not quarters, with a working build you can test every sprint.",
    how: "Shippable builds every week, not one big reveal",
    why: "You steer before we've built the wrong thing",
    tag: "Velocity",
  },
  {
    icon: ShieldCheck,
    title: "Built to handle enterprise growth",
    desc: "Load-tested architecture designed for your next million users, not just your first hundred.",
    how: "Load-tested well past projected peak traffic",
    why: "Growth is a metric here, never a rewrite",
    tag: "Scalability",
  },
];

interface SaasShowcaseSectionProps {
  data?: {
    visible?: boolean;
    badge?: string;
    title?: string;
    desc?: string;
  };
}

export default function SaasShowcaseSection({ data }: SaasShowcaseSectionProps) {
  if (data?.visible === false) {
    return null;
  }

  const badge = data?.badge || "Our Specialty";
  const title = data?.title || "Engineered for SaaS at Scale";
  const desc = data?.desc || "Most agencies bolt SaaS features onto products never built to carry them. We ship multi-tenancy, billing, and scale on day one — so the platform you launch with is the same one you grow on.";

  return (
    <section id="platform" className="relative py-24 px-6 overflow-hidden">
      <GridDivider />
      
      <div className="max-w-6xl mx-auto">
        {/* Header Block */}
        <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-mono text-primary dark:text-purple-400 font-semibold tracking-widest uppercase block mb-3">
              {badge}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground leading-[1.15]">
              {title}
            </h2>
          </div>

          <div className="max-w-md border-l-2 border-primary/40 pl-5 py-1">
            <p className="text-secondary-text text-sm sm:text-base leading-relaxed">
              {desc}
            </p>
          </div>
        </Reveal>

        {/* 2x2 Feature Cards Grid */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {POINTS.map((point, idx) => {
            const Icon = point.icon;

            return (
              <motion.div
                key={point.title}
                variants={fadeUp}
                className="group relative rounded-3xl border border-border/80 bg-surface/40 p-7 sm:p-9 transition-all duration-300 hover:border-primary/50 hover:bg-surface/80 hover:shadow-xl backdrop-blur-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Subtle Ambient Hover Glow */}
                <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/25 transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Top Bar: Icon + Step Tag + Index */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold tracking-wider text-primary dark:text-purple-200 uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/20 dark:bg-primary/30 dark:border-primary/50 shadow-sm">
                        {point.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-headline font-bold text-foreground/15 group-hover:text-primary/30 transition-colors select-none">
                        0{idx + 1}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-secondary-text/40 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-normal font-headline text-foreground group-hover:text-primary transition-colors mb-3">
                    {point.title}
                  </h3>

                  <p className="text-secondary-text text-sm sm:text-base leading-relaxed mb-8">
                    {point.desc}
                  </p>
                </div>

                {/* Technical Execution Box */}
                <div className="mt-auto rounded-2xl border border-border/60 bg-background/60 p-4 transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-background/90">
                  <div className="flex flex-col gap-2.5">
                    {/* How it's built */}
                    <div className="flex items-start gap-2.5">
                      <Terminal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full text-xs">
                        <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-semibold">How:</span>
                        <span className="text-foreground/90 font-medium">{point.how}</span>
                      </div>
                    </div>

                    <div className="border-t border-border/40 my-0.5" />

                    {/* Why it wins */}
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full text-xs">
                        <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-semibold">Why it wins:</span>
                        <span className="text-secondary-text">{point.why}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
