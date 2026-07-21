import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, animate, type MotionValue } from "motion/react";
import GridDivider from "../components/GridDivider";

export interface IndustryItem {
  title: string;
  subheading?: string;
  desc?: string;
  icon?: string;
  tags?: string[];
  image?: string;
  imageUrl?: string;
}

export interface IndustriesOrbitProps {
  header: {
    badge: string;
    title: string;
    desc?: string;
  };
  items: IndustryItem[];
  isDesktop: boolean;
  prefersReducedMotion: boolean;
}

const fallbackImages: Record<string, string> = {
  "Construction": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
  "Healthcare": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop",
  "FinTech": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
  "Retail & eCommerce": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
  "Manufacturing": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
  "Logistics & Supply Chain": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
  "Real Estate": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop",
  "Education (EdTech)": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop"
};

const fallbackTags: Record<string, string[]> = {
  "Construction": ["Project Management", "Compliance", "Workforce Ops"],
  "Healthcare": ["Patient Portals", "HIPAA Secure", "Appointment Systems"],
  "FinTech": ["Payment APIs", "Digital Wallets", "Enterprise Security"],
  "Retail & eCommerce": ["Omnichannel", "Inventory Control", "Customer Portals"],
  "Manufacturing": ["ERP Integration", "IoT Systems", "Production Ops"],
  "Logistics & Supply Chain": ["Fleet Tracking", "Warehouse Ops", "Route Optimization"],
  "Real Estate": ["Property CRM", "Listing Portals", "Digital Tours"],
  "Education (EdTech)": ["LMS Platforms", "Virtual Classrooms", "Student Portals"]
};

// Given a card's fixed base angle and the ring's live rotation, returns the
// shortest signed angular distance from "facing the camera" (0deg). The
// +540 offset absorbs any negative input (rotation ranges 0..-360) before
// the final mod, so this stays correct across the whole scroll range.
function angularDistance(baseAngle: number, rotation: number): number {
  const raw = (baseAngle + rotation) % 360;
  const norm = ((raw + 540) % 360) - 180;
  return Math.abs(norm);
}

// -----------------------------------------------------------------------------
// Sleek Compact 3D Orbit Card
// -----------------------------------------------------------------------------
interface OrbitCardProps {
  item: IndustryItem;
  idx: number;
  total: number;
  rotation: MotionValue<number>;
  radius: number;
  isActive: boolean;
  onSelectCard?: (idx: number) => void;
}

const OrbitCard = React.memo(function OrbitCard({ item, idx, total, rotation, radius, isActive, onSelectCard }: OrbitCardProps) {
  const baseAngle = (idx / total) * 360;

  // Depth styling is derived straight from the shared rotation motion value —
  // these write to the DOM on every animation frame without triggering a
  // React re-render, which is what keeps this smooth during scroll/drag.
  const dist = useTransform(rotation, (r) => angularDistance(baseAngle, r));
  const opacity = useTransform(dist, [0, 180], [1, 0.2]);
  const scale = useTransform(dist, [0, 90, 180], [1, 0.88, 0.84]);
  const zIndex = useTransform(dist, (d) => Math.round(100 - (d / 180) * 90));

  const image = item.image || item.imageUrl || fallbackImages[item.title] || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop";
  const tags = item.tags || fallbackTags[item.title] || [];
  const headline = item.subheading || item.title;

  return (
    <motion.div
      onClick={() => onSelectCard?.(idx)}
      style={{
        rotateY: baseAngle,
        z: radius,
        scale,
        opacity,
        zIndex,
        backfaceVisibility: "hidden"
      }}
      // Motion's default transform order is translate-then-rotate, which
      // would spin each card in place instead of positioning it around the
      // ring. rotateY must apply before translateZ so cards fan out onto
      // the circle (matches the plain-CSS `rotateY(...) translateZ(...)`
      // string the original implementation built by hand).
      transformTemplate={({ rotateY, z, scale }) => `rotateY(${rotateY}) translateZ(${z}) scale(${scale})`}
      className={`group absolute top-1/2 left-1/2 -ml-[130px] -mt-[180px] sm:-ml-[142px] sm:-mt-[195px] w-[260px] sm:w-[285px] h-[360px] sm:h-[390px] rounded-2xl overflow-hidden cursor-pointer border bg-neutral-950 shadow-xl flex flex-col justify-between p-5 sm:p-6 select-none transition-colors duration-300 ${
        isActive
          ? "border-primary/60 shadow-[0_0_35px_rgba(139,92,246,0.25)] ring-1 ring-primary/40"
          : "border-white/10 hover:border-white/30"
      }`}
    >
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 group-hover:from-black/90 group-hover:via-black/40 transition-colors duration-500" />
      </div>

      {/* Top Tag Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-950 uppercase px-3 py-1 rounded-full bg-white shadow-md border border-white/80">
          {item.title}
        </span>
        {isActive && (
          <span className="text-[9px] font-mono font-bold text-primary bg-white backdrop-blur-md px-2.5 py-1 rounded-full border border-primary/30 shadow-md">
            FEATURED
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="text-base sm:text-lg font-normal font-headline text-white leading-snug group-hover:text-primary-tint transition-colors duration-300">
          {headline}
        </h3>

        {item.desc && (
          <p className="text-neutral-300 text-xs leading-relaxed line-clamp-2 font-sans">
            {item.desc}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {tags.slice(0, 2).map((tag, tIdx) => (
              <span
                key={tIdx}
                className="text-[10px] font-semibold text-neutral-900 bg-white/95 backdrop-blur-md border border-white/80 px-2.5 py-0.5 rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Subscribes to a rotation motion value and returns the nearest card index,
// re-rendering only when that index actually changes (a handful of times
// per scroll pass) instead of on every continuous rotation tick.
function useActiveIndex(rotation: MotionValue<number>, total: number): number {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const step = 360 / total;
    const unsubscribe = rotation.on("change", (r) => {
      const idx = (((Math.round(-r / step) % total) + total) % total);
      if (idx !== lastRef.current) {
        lastRef.current = idx;
        setActiveIndex(idx);
      }
    });
    return () => unsubscribe();
  }, [rotation, total]);

  return activeIndex;
}

// -----------------------------------------------------------------------------
// Main IndustriesOrbit Component
// -----------------------------------------------------------------------------
export default function IndustriesOrbit({
  header,
  items,
  isDesktop,
  prefersReducedMotion
}: IndustriesOrbitProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Desktop Scroll-driven rotation (200vh track for responsive scrolling)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const ringRotation = useTransform(scrollYProgress, [0, 1], [0, -360]);

  // Manual drag adds an offset on top of the scroll-driven rotation, so
  // scroll and drag compose instead of fighting each other for ownership
  // of the ring. Combined explicitly (not via array-form useTransform,
  // which was observed to stop tracking dragOffset updates after the
  // initial mount) so both sources reliably drive the same output value.
  const dragOffset = useMotionValue(0);
  const displayRotation = useMotionValue(0);
  useEffect(() => {
    const recompute = () => displayRotation.set(ringRotation.get() + dragOffset.get());
    recompute();
    const u1 = ringRotation.on("change", recompute);
    const u2 = dragOffset.on("change", recompute);
    return () => { u1(); u2(); };
  }, [ringRotation, dragOffset, displayRotation]);
  const activeIndex = useActiveIndex(displayRotation, items.length);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartOffset.current = dragOffset.get();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    dragOffset.set(dragStartOffset.current + deltaX * 0.4);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const total = items.length;
    const step = 360 / total;
    const combined = displayRotation.get();
    const nearestIndex = Math.round(-combined / step);
    const snapAngle = -nearestIndex * step;
    animate(dragOffset, snapAngle - ringRotation.get(), { type: "spring", stiffness: 200, damping: 24 });
  };

  // Scroll to bring clicked card to front
  const handleSelectCard = (targetIdx: number) => {
    if (!sectionRef.current) return;
    animate(dragOffset, 0, { type: "spring", stiffness: 200, damping: 24 });

    const total = items.length;
    const targetAngle = 360 - (targetIdx / total) * 360;
    const targetProgress = ((targetAngle % 360) + 360) % 360 / 360;

    const rect = sectionRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sectionTop = rect.top + scrollTop;
    const scrollableDistance = rect.height - window.innerHeight;

    if (scrollableDistance > 0) {
      const targetY = sectionTop + targetProgress * scrollableDistance;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  // ---------------------------------------------------------------------------
  // Path 1: Reduced Motion (Accessibility Fallback)
  // ---------------------------------------------------------------------------
  if (prefersReducedMotion) {
    return (
      <section id="industries" className="relative py-20 bg-surface/30 px-6">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-2">
              {header.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal font-headline text-foreground leading-tight">
              {header.title}
            </h2>
            {header.desc && (
              <p className="text-secondary-text text-sm leading-relaxed max-w-xl mt-3">
                {header.desc}
              </p>
            )}
          </div>

          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin">
            {items.map((item, idx) => {
              const image = item.image || item.imageUrl || fallbackImages[item.title] || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop";
              const tags = item.tags || fallbackTags[item.title] || [];
              return (
                <div
                  key={idx}
                  className="snap-start shrink-0 w-[260px] sm:w-[285px] h-[360px] rounded-2xl overflow-hidden relative border border-border bg-neutral-950 p-6 flex flex-col justify-between"
                >
                  <img src={image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-mono font-bold text-neutral-950 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white shadow-sm border border-white/80">
                      {item.title}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col gap-2">
                    <h3 className="text-lg font-headline text-white">{item.subheading || item.title}</h3>
                    {item.desc && <p className="text-xs text-neutral-300 line-clamp-2">{item.desc}</p>}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold text-neutral-900 bg-white/95 px-2.5 py-0.5 rounded-full border border-white/80 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Path 2: Mobile / Tablet Drag Orbit (unpinned)
  // ---------------------------------------------------------------------------
  if (!isDesktop) {
    return <MobileOrbitSection header={header} items={items} />;
  }

  // ---------------------------------------------------------------------------
  // Path 3: Desktop Pinned 3D Orbit (Compact 200vh track)
  // ---------------------------------------------------------------------------
  const radius = 420; // Compact radius for elegant card proportions

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="relative h-[200vh] bg-surface/30"
    >
      <GridDivider />

      {/* Ambient static radial purple glow (clean, non-distracting) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.09),transparent_70%)] z-0" />

      {/* Sticky viewport frame */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-between py-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-6xl mx-auto w-full px-6 relative z-10 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-2">
                {header.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal font-headline text-foreground leading-[1.15]">
                {header.title}
              </h2>
            </div>
            {header.desc && (
              <p className="text-secondary-text text-sm leading-relaxed max-w-sm md:text-right shrink-0">
                {header.desc}
              </p>
            )}
          </div>
        </div>

        {/* 3D Orbit Cylinder Container */}
        <div
          className="relative w-full flex-1 flex items-center justify-center pointer-events-auto z-10 cursor-grab active:cursor-grabbing touch-pan-y select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="relative w-full h-[420px] flex items-center justify-center"
            style={{
              perspective: "1200px",
              perspectiveOrigin: "50% 50%"
            }}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                rotateY: displayRotation
              }}
            >
              {items.map((item, idx) => (
                <OrbitCard
                  key={idx}
                  item={item}
                  idx={idx}
                  total={items.length}
                  rotation={displayRotation}
                  radius={radius}
                  isActive={idx === activeIndex}
                  onSelectCard={handleSelectCard}
                />
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Mobile Drag-to-Rotate Orbit Component
// -----------------------------------------------------------------------------
function MobileOrbitSection({ header, items }: { header: IndustriesOrbitProps["header"]; items: IndustryItem[] }) {
  const dragRotation = useMotionValue(0);
  const activeIndex = useActiveIndex(dragRotation, items.length);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const startRot = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startRot.current = dragRotation.get();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    dragRotation.set(startRot.current + deltaX * 0.4);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const current = dragRotation.get();
    const total = items.length;
    const step = 360 / total;
    const nearestIndex = Math.round(-current / step);
    const snapAngle = -nearestIndex * step;

    animate(dragRotation, snapAngle, { type: "spring", stiffness: 200, damping: 24 });
  };

  const mobileRadius = 280;

  return (
    <section id="industries" className="relative py-16 bg-surface/30 overflow-hidden">
      <GridDivider />
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-2">
          {header.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-headline text-foreground">{header.title}</h2>
        {header.desc && <p className="text-secondary-text text-xs mt-2">{header.desc}</p>}
      </div>

      {/* Touch Drag Orbit Ring */}
      <div
        className="relative w-full h-[400px] flex items-center justify-center touch-pan-y select-none"
        style={{ perspective: "900px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d", rotateY: dragRotation }}
        >
          {items.map((item, idx) => (
            <OrbitCard
              key={idx}
              item={item}
              idx={idx}
              total={items.length}
              rotation={dragRotation}
              radius={mobileRadius}
              isActive={idx === activeIndex}
            />
          ))}
        </motion.div>
      </div>

      <p className="text-center text-xs font-mono text-secondary-text mt-3">
        SWIPE TO ROTATE ORBIT
      </p>
    </section>
  );
}
