import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion, LayoutGroup } from "motion/react";
import NitwebsLogo from "../components/NitwebsLogo";

interface IntroContextType {
  isTransitioned: boolean;
  isLoaded: boolean;
  shouldPlay: boolean;
  logoConfig?: any;
  setLogoConfig: (config: any) => void;
  replayIntro: () => void;
}

const IntroContext = createContext<IntroContextType>({
  isTransitioned: true,
  isLoaded: true,
  shouldPlay: false,
  setLogoConfig: () => {},
  replayIntro: () => {},
});

export const useIntroAnimation = () => useContext(IntroContext);

const checkInitialShouldPlay = () => {
  if (typeof window === "undefined") return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("intro") === "1") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem("nitwebs_intro_played") !== "true";
  } catch (e) {
    return true;
  }
};

export const IntroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialPlay] = useState<boolean>(checkInitialShouldPlay);
  const [shouldPlay, setShouldPlay] = useState<boolean>(initialPlay);
  const [isTransitioned, setIsTransitioned] = useState<boolean>(!initialPlay);
  const [isLoaded, setIsLoaded] = useState<boolean>(!initialPlay);
  const [logoConfig, setLogoConfig] = useState<any>(null);

  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timer1Ref.current) clearTimeout(timer1Ref.current);
    if (timer2Ref.current) clearTimeout(timer2Ref.current);
  };

  const startIntroSequence = () => {
    clearTimers();
    setShouldPlay(true);
    setIsTransitioned(false);
    setIsLoaded(false);

    // Lock body scroll during intro
    document.body.style.overflow = "hidden";

    // 1. At 1250ms: trigger FLIP travel to header and content reveal
    timer1Ref.current = setTimeout(() => {
      setIsTransitioned(true);
    }, 1250);

    // 2. At 2500ms: intro sequence complete, unlock scroll
    timer2Ref.current = setTimeout(() => {
      setIsLoaded(true);
      document.body.style.overflow = "";
      try {
        sessionStorage.setItem("nitwebs_intro_played", "true");
      } catch (e) {}
    }, 2500);
  };

  useEffect(() => {
    if (initialPlay) {
      startIntroSequence();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      clearTimers();
      document.body.style.overflow = "";
    };
  }, []);

  const replayIntro = () => {
    startIntroSequence();
  };

  return (
    <IntroContext.Provider
      value={{
        isTransitioned,
        isLoaded,
        shouldPlay,
        logoConfig,
        setLogoConfig,
        replayIntro,
      }}
    >
      <LayoutGroup id="animate-ui-logo-layout">
        {/* Centered Logo during Initial Load Phase (0ms to 1250ms), sliding seamlessly to header at 1250ms */}
        {shouldPlay && !isTransitioned && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background pointer-events-auto select-none">
            <motion.div
              layoutId="site-logo-main"
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 24,
                mass: 0.8,
              }}
              className="flex items-center justify-center"
            >
              <NitwebsLogo
                className="h-10 sm:h-14 w-auto object-contain"
                logoConfig={logoConfig}
                isDrawing={true}
              />
            </motion.div>
          </div>
        )}

        {children}
      </LayoutGroup>
    </IntroContext.Provider>
  );
};
