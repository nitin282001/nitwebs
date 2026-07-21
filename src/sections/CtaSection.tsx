import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";
import SpecularButton from "../components/ui/SpecularButton";

interface CtaSectionProps {
  title?: string;
  desc?: string;
  btnText?: string;
  btnLink?: string;
}

export default function CtaSection({
  title = "Ready to build your next platform?",
  desc = "Contact our design and engineering team today to review your project scope.",
  btnText = "Get in Touch",
  btnLink = "#contact"
}: CtaSectionProps) {
  const handleClick = () => {
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
    <section className="relative w-full py-20 px-6 overflow-hidden">
      <GridDivider />

      <div className="max-w-4xl mx-auto relative z-10 bg-surface/30 border border-border/80 rounded-3xl p-8 sm:p-12 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-headline font-normal text-foreground leading-[1.2]">
              {title}
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-secondary-text text-sm font-sans leading-relaxed">
              {desc}
            </p>
          </Reveal>
        </div>

        <Reveal className="shrink-0">
          <SpecularButton
            onClick={handleClick}
            size="md"
            tint="hsl(var(--foreground))"
            tintOpacity={1}
            textColor="hsl(var(--background))"
            lineColor="hsl(var(--primary))"
            baseColor="hsl(var(--border))"
            className="whitespace-nowrap"
          >
            {btnText}
          </SpecularButton>
        </Reveal>
      </div>
    </section>
  );
}
