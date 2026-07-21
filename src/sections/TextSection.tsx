import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";

interface TextSectionProps {
  title?: string;
  desc?: string;
  image?: string;
  imagePosition?: "left" | "right";
  badge?: string;
}

export default function TextSection({
  title = "Nitwebs Engineering Approach",
  desc = "We build digital platforms combining design beauty with robust backend pipelines.",
  image = "",
  imagePosition = "right",
  badge = ""
}: TextSectionProps) {
  const hasImage = !!image;

  return (
    <section className="relative w-full py-24 px-6 overflow-hidden bg-surface/10">
      <GridDivider />

      <div className="max-w-6xl mx-auto relative z-10">
        {hasImage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Left Position */}
            {imagePosition === "left" && (
              <Reveal className="border border-border/80 rounded-3xl overflow-hidden shadow-xl aspect-video md:aspect-square bg-neutral-100">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </Reveal>
            )}

            {/* Content Column */}
            <div className="flex flex-col gap-4">
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
              <Reveal>
                <p className="text-secondary-text text-sm sm:text-base font-sans leading-relaxed">
                  {desc}
                </p>
              </Reveal>
            </div>

            {/* Image Right Position */}
            {imagePosition === "right" && (
              <Reveal className="border border-border/80 rounded-3xl overflow-hidden shadow-xl aspect-video md:aspect-square bg-neutral-100">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </Reveal>
            )}
          </div>
        ) : (
          /* Simple centered text layout */
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
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
            <Reveal>
              <p className="text-secondary-text text-sm sm:text-base font-sans leading-relaxed">
                {desc}
              </p>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
