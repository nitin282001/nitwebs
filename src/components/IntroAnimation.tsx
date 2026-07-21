import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import NitwebsLogo from "./NitwebsLogo";

export default function IntroAnimation() {
  const [shouldPlay, setShouldPlay] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check dev URL query bypass (?intro=1)
    const searchParams = new URLSearchParams(window.location.search);
    const forceIntro = searchParams.get("intro") === "1";

    // 2. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 3. Check sessionStorage
    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem("nitwebs_intro_played") === "true";
    } catch (e) {
      alreadyPlayed = false;
    }

    const play = forceIntro || (!alreadyPlayed && !prefersReducedMotion);

    if (!play) {
      setShouldPlay(false);
      setIsDone(true);
      return;
    }

    setShouldPlay(true);
    setIsDone(false);

    let fadeTimer: ReturnType<typeof setTimeout>;
    let doneTimer: ReturnType<typeof setTimeout>;

    // Step 1: Start fading out overlay after opacity fade completes (1.2s)
    fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    // Step 2: Unmount overlay after fade completes (1.8s)
    doneTimer = setTimeout(() => {
      setIsDone(true);
      setShouldPlay(false);
      try {
        sessionStorage.setItem("nitwebs_intro_played", "true");
      } catch (e) {}
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!shouldPlay || isDone) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.62, 0.05, 0.2, 1] }}
        className="fixed inset-0 z-[9999] bg-background flex items-center justify-center pointer-events-auto select-none overflow-hidden"
      >
        <div className="flex flex-col items-center justify-center p-6">
          <NitwebsLogo className="h-12 sm:h-16 w-auto text-foreground" isAnimating={true} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
