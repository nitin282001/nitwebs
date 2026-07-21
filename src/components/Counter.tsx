import { useEffect, useState, useRef } from "react";
import { useMotionValue, useTransform, useInView, animate } from "motion/react";

interface CounterProps {
  value: string;
  suffix?: string;
}

export default function Counter({ value, suffix = "" }: CounterProps) {
  const numericVal = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayVal, setDisplayVal] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      animate(count, numericVal, {
        duration: 2,
        ease: "easeOut",
      });
    }
  }, [isInView, numericVal, count]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      setDisplayVal(latest.toLocaleString());
    });
  }, [rounded]);

  return (
    <span ref={ref} className="font-headline text-4xl sm:text-5xl font-normal text-foreground">
      {displayVal}
      {suffix && <span className="text-primary ml-0.5">{suffix}</span>}
    </span>
  );
}
