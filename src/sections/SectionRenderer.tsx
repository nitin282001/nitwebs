import HeroSection from "./HeroSection";
import TextSection from "./TextSection";
import CardsSection from "./CardsSection";
import StatsSection from "./StatsSection";
import CtaSection from "./CtaSection";
import FaqSection from "./FaqSection";
import ContactSection from "./ContactSection";
import TestimonialsSection from "./TestimonialsSection";
import SpacerSection from "./SpacerSection";

interface SectionRendererProps {
  sections?: any[];
}

export default function SectionRenderer({ sections = [] }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, idx) => {
        const key = section._id || `section-${idx}`;
        switch (section.type) {
          case "hero":
            return <HeroSection key={key} {...section} />;
          case "text":
            return <TextSection key={key} {...section} />;
          case "cards":
            return <CardsSection key={key} {...section} />;
          case "stats":
            return <StatsSection key={key} {...section} />;
          case "cta":
            return <CtaSection key={key} {...section} />;
          case "faq":
            return <FaqSection key={key} {...section} />;
          case "contact":
            return <ContactSection key={key} {...section} />;
          case "testimonials":
            return <TestimonialsSection key={key} {...section} />;
          case "spacer":
            return <SpacerSection key={key} {...section} />;
          default:
            return (
              <div key={key} className="py-6 px-6 border border-dashed border-red-300 text-red-500 text-xs font-mono text-center">
                Unknown section block type: "{section.type}"
              </div>
            );
        }
      })}
    </>
  );
}
