import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";
import { Star } from "lucide-react";

interface TestimonialItem {
  name: string;
  role: string;
  review: string;
}

interface TestimonialsSectionProps {
  badge?: string;
  title?: string;
  desc?: string;
  testimonials?: TestimonialItem[];
}

export default function TestimonialsSection({
  badge = "PARTNER TESTIMONIALS",
  title = "Client Transformed Outcomes",
  desc = "See what leading teams say about our bi-weekly sprint deliveries.",
  testimonials = []
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <Reveal key={idx} className="h-full">
              <div className="border border-border/80 bg-surface/30 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between h-full hover:border-primary/50 transition-all duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed font-sans font-normal">
                    "{item.review}"
                  </p>
                </div>
                <div className="mt-6 border-t border-border/40 pt-4 flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{item.name}</span>
                  <span className="text-[10px] text-secondary-text mt-0.5">{item.role}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
