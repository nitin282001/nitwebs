import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "../lib/animations";
import GridDivider from "../components/GridDivider";
import LetterGlitch from "../components/ui/LetterGlitch";
import SpecularButton from "../components/ui/SpecularButton";

interface AboutUsSectionProps {
  glitchColors?: string[];
}

export default function AboutUsSection({ glitchColors }: AboutUsSectionProps) {
  const handleScrollToContact = () => {
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="relative py-24 px-6 overflow-hidden bg-transparent">
      {/* Corner plus glyphs and line at the start of the section */}
      <GridDivider />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {/* Left Column: Content */}
          <motion.div
            className="lg:col-span-6 flex flex-col justify-center text-left"
            variants={fadeUp}
          >
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-6 leading-[1.15]">
              We Engineer the Future of Software
            </h2>
            <div className="space-y-4 text-secondary-text text-sm sm:text-base leading-relaxed mb-8 font-sans">
              <p>
                At Nitwebs, we combine world-class engineering, artificial intelligence, and strategic design to construct premium digital products. Our team builds secure, scalable platforms that resolve complex operational challenges for high-growth enterprises globally.
              </p>
              <p>
                From custom SaaS architectures and automated system integrations to cutting-edge AI models, we embed quality-first engineering into every line of code. We partner with ambitious organizations to deliver measurable, transformative outcomes.
              </p>
            </div>
            <SpecularButton
              onClick={handleScrollToContact}
              size="md"
              radius={12}
              tint="hsl(var(--foreground))"
              tintOpacity={1}
              textColor="hsl(var(--background))"
              lineColor="hsl(var(--primary))"
              baseColor="hsl(var(--border))"
              className="px-6 py-2.5 text-sm font-semibold w-fit self-start cursor-pointer"
            >
              Learn More
            </SpecularButton>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div
            className="lg:col-span-6 w-full flex justify-center items-center"
            variants={fadeUp}
          >
            {/* Borderless wrapper with radial fade mask on the edges */}
            <div 
              className="relative w-full h-[350px] sm:h-[400px] lg:h-[550px] overflow-hidden flex items-center justify-center"
              style={{
                maskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent), linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent), linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in"
              }}
            >
              <div className="absolute inset-0 w-full h-full">
                <LetterGlitch
                  glitchColors={glitchColors || [
                    "hsl(var(--primary))",
                    "hsl(var(--secondary-text))",
                    "hsl(var(--foreground))"
                  ]}
                  glitchSpeed={55}
                  centerVignette={false}
                  outerVignette={true}
                  smooth={true}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
