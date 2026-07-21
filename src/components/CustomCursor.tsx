import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useLocation } from "react-router-dom";

export default function CustomCursor() {
  const location = useLocation();
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth lag physics for the outer circular ring
  const springConfig = { damping: 35, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Disable custom cursor on admin page to retain high-precision default system cursor for editing
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
  }, []);

  useEffect(() => {
    if (isTouchDevice || isAdminPage) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.getAttribute("role") === "button" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA";

      setIsHovered(!!isClickable);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Inject styles to hide default cursor globally
    const style = document.createElement("style");
    style.id = "custom-cursor-hide-default";
    style.innerHTML = `
      body, a, button, input, select, textarea, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      
      const el = document.getElementById("custom-cursor-hide-default");
      if (el) el.remove();
    };
  }, [mouseX, mouseY, isVisible, isTouchDevice, isAdminPage]);

  if (isTouchDevice || isAdminPage || !isVisible) return null;

  return (
    <>
      {/* Outer lagging hollow circular ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 1.6 : 1,
          backgroundColor: isHovered ? "rgba(139, 92, 246, 0.1)" : "rgba(0, 0, 0, 0)", // transparent purple tint on hover
        }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      />
      {/* Inner instant point cursor */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-primary pointer-events-none z-[9999]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      />
    </>
  );
}
