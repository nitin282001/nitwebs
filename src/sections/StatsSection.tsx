import GridDivider from "../components/GridDivider";
import Counter from "../components/Counter";
import { StaggerGrid } from "../lib/animations";
import { motion } from "motion/react";

interface StatItem {
  value: string;
  suffix?: string;
  label: string;
}

interface StatsSectionProps {
  stats?: StatItem[];
}

export default function StatsSection({ stats = [] }: StatsSectionProps) {
  const defaultStats = stats.length > 0 ? stats : [
    { value: "150", suffix: "+", label: "Projects Delivered" },
    { value: "6", suffix: "+", label: "Years Experience" },
    { value: "20", suffix: "+", label: "Technologies" },
    { value: "98", suffix: "%", label: "Satisfaction" }
  ];

  return (
    <section className="relative w-full py-16 px-6 overflow-hidden">
      <GridDivider />

      <div className="max-w-6xl mx-auto relative z-10">
        <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {defaultStats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="flex items-baseline">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <span className="text-secondary-text text-xs uppercase tracking-widest font-sans mt-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
