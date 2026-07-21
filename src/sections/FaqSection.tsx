import { useState } from "react";
import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  badge?: string;
  title?: string;
  desc?: string;
  faqs?: FaqItem[];
}

export default function FaqSection({
  badge = "FAQ CENTER",
  title = "Frequently Asked Questions",
  desc = "Answers to common inquiries about our technology timeline and approach.",
  faqs = []
}: FaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const defaultFaqs = faqs.length > 0 ? faqs : [
    { q: "How long does a project take?", a: "Standard enterprise applications and AI pipelines are shipped within 8 to 12 weeks. We work on strict bi-weekly sprint delivery periods." },
    { q: "Do you hand over full source repositories?", a: "Yes. Every line of code we write is fully handed over in Git repositories with complete ownership rights." },
    { q: "How does dedicated developer embedding work?", a: "We embed senior programmers directly inside your Slack and GitHub workflows to speed up your roadmap." }
  ];

  return (
    <section className="relative w-full py-24 px-6 overflow-hidden">
      <GridDivider />

      <div className="max-w-4xl mx-auto relative z-10">
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
              <p className="text-secondary-text text-sm font-sans leading-relaxed">
                {desc}
              </p>
            </Reveal>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {defaultFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Reveal key={idx}>
                <div className="border border-border/80 rounded-2xl bg-surface/30 backdrop-blur-md overflow-hidden">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-sans text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-secondary-text text-xs sm:text-sm leading-relaxed border-t border-border/40 font-sans">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
