import {
  Cpu,
  Layers,
  Globe,
  Workflow,
  Cloud,
  Palette,
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Lock,
  Hammer,
  Activity,
  CreditCard,
  ShoppingBag,
  Factory,
  Truck,
  Building2,
  GraduationCap,
  type LucideIcon
} from "lucide-react";
import GridDivider from "../components/GridDivider";
import { Reveal, StaggerGrid } from "../lib/animations";
import { motion } from "motion/react";

// Finite, named-import map (mirrors the icon set used across the homepage's
// services/industries sections) — keeps this tree-shakeable. A wildcard
// `import * as LucideIcons` here would force the entire icon library into
// every bundle that shares this module, including the homepage.
const ICON_MAP: Record<string, LucideIcon> = {
  Cpu, Layers, Globe, Workflow, Cloud, Palette, Star, CheckCircle,
  Mail, Phone, MapPin, MessageSquare, Lock, Hammer, Activity,
  CreditCard, ShoppingBag, Factory, Truck, Building2, GraduationCap
};

interface CardItem {
  icon?: string;
  title: string;
  desc: string;
}

interface CardsSectionProps {
  badge?: string;
  title?: string;
  desc?: string;
  cards?: CardItem[];
}

export default function CardsSection({
  badge = "WHAT WE OFFER",
  title = "Our Core Capabilities",
  desc = "We build intelligent digital solutions across these domains.",
  cards = []
}: CardsSectionProps) {
  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Cpu;
    return ICON_MAP[iconName] || Cpu;
  };

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-24 px-6 overflow-hidden">
      <GridDivider />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
          {badge && (
            <Reveal>
              <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest">
                {badge}
              </span>
            </Reveal>
          )}
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-headline font-normal text-foreground leading-[1.2]">
              {title}
            </h2>
          </Reveal>
          {desc && (
            <Reveal>
              <p className="text-secondary-text text-sm sm:text-base font-sans leading-relaxed">
                {desc}
              </p>
            </Reveal>
          )}
        </div>

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = getIcon(card.icon);
            return (
              <motion.div
                key={idx}
                className="border border-border/80 bg-surface/30 backdrop-blur-md rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group flex flex-col justify-between"
                whileHover={{ y: -4 }}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-headline font-normal text-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-secondary-text text-xs leading-relaxed font-sans">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
