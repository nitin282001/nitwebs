import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";
import SpecularButton from "../components/ui/SpecularButton";

interface HeroSectionProps {
  badge?: string;
  title?: string;
  desc?: string;
  btnText?: string;
  btnLink?: string;
}

export default function HeroSection({
  badge = "AI-first software development",
  title = "Nitwebs",
  desc = "We engineer AI products, scalable software, SaaS platforms, mobile apps, and automation systems for ambitious companies worldwide.",
  btnText = "Get Started",
  btnLink = "#contact"
}: HeroSectionProps) {
  const scrollToContact = () => {
    if (btnLink.startsWith("#")) {
      const target = document.getElementById(btnLink.replace("#", ""));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = btnLink;
    }
  };

  return (
    <section className="relative w-full py-24 sm:py-32 px-6 overflow-hidden flex flex-col items-center text-center">
      <GridDivider />
      
      <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
        <Reveal>
          <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary-tint/50 border border-primary/20 text-primary uppercase mb-6 inline-block">
            {badge}
          </span>
        </Reveal>

        <Reveal>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal font-headline text-foreground leading-[1.1] mb-6 max-w-3xl">
            {title}
          </h1>
        </Reveal>

        <Reveal>
          <p className="text-secondary-text text-base sm:text-lg md:text-xl font-sans leading-relaxed mb-10 max-w-2xl">
            {desc}
          </p>
        </Reveal>

        <Reveal>
          <SpecularButton
            onClick={scrollToContact}
            size="lg"
            tint="hsl(var(--foreground))"
            tintOpacity={1}
            textColor="hsl(var(--background))"
            lineColor="hsl(var(--primary))"
            baseColor="hsl(var(--border))"
          >
            {btnText}
          </SpecularButton>
        </Reveal>
      </div>
    </section>
  );
}
