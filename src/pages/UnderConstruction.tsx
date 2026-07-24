import GridLines from "../components/GridLines";
import { Reveal } from "../lib/animations";
import NitwebsLogo from "../components/NitwebsLogo";

export default function UnderConstruction({ logoConfig }: { logoConfig?: any }) {
  return (
    <div className="relative isolate w-full min-h-screen flex flex-col justify-center bg-background text-foreground selection:bg-primary-tint selection:text-foreground overflow-hidden">
      {/* Blueprint grid lines */}
      <GridLines />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full flex flex-col justify-center items-center py-20">
        <div className="w-full max-w-xl flex flex-col items-center text-center">
          
          {/* Logo */}
          <Reveal className="mb-8">
            <NitwebsLogo logoConfig={logoConfig} className="!max-h-16 !h-16 text-3xl sm:text-4xl w-auto" />
          </Reveal>

          {/* Heading */}
          <Reveal className="mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.15] tracking-[-0.02em] font-headline text-foreground">
              We're building <br />something remarkable
            </h1>
          </Reveal>

          {/* Subheading */}
          <Reveal className="mb-8">
            <p className="text-secondary-text text-sm sm:text-base leading-relaxed">
              Our site is undergoing technical modernization and custom upgrades. 
              We'll be back online with enhanced tools and experiences shortly.
            </p>
          </Reveal>

        </div>
      </div>
    </div>
  );
}
