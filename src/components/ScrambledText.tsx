/**
 * ScrambledText — mouse-proximity character scramble effect
 * Inspired by Tom Miller / GSAP community (codepen.io/creativeocean/pen/NPWLwJM)
 *
 * Layout-stable design:
 *  - Words are wrapped in `display:inline-block; white-space:nowrap` so line-breaks
 *    only occur at space boundaries — exactly as native text.
 *  - Each character uses a "layout anchor" pattern:
 *      • A hidden <span> containing the original char defines the box dimensions.
 *      • A second <span> is positioned absolutely over it — this is what GSAP scrambles.
 *    This means scramble characters NEVER affect layout, preventing any height jitter.
 */
import { useEffect, useRef, type FC, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

interface ScrambledTextProps {
  /** Plain text string — no JSX children */
  children: string;
  className?: string;
  style?: CSSProperties;
  /** Pointer radius (px) within which chars scramble. Default 130. */
  radius?: number;
  /** Scramble animation duration per char (s). Default 1.2. */
  duration?: number;
  /** Scramble resolution speed (0–1). Default 0.5. */
  speed?: number;
  /** Characters used during scramble. Default '.:'. */
  scrambleChars?: string;
}

const ScrambledText: FC<ScrambledTextProps> = ({
  children,
  className = '',
  style = {},
  radius = 130,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Only target the absolutely-positioned overlay spans — never the hidden layout anchors
    const targets = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-char]'));

    const handleMove = (e: PointerEvent) => {
      targets.forEach(span => {
        const { left, top, width, height } = span.getBoundingClientRect();
        const dist = Math.hypot(
          e.clientX - (left + width / 2),
          e.clientY - (top + height / 2)
        );
        if (dist < radius) {
          gsap.to(span, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: span.dataset.char ?? '',
              chars: scrambleChars,
              speed,
            },
            ease: 'none',
          });
        }
      });
    };

    window.addEventListener('pointermove', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      gsap.killTweensOf(targets);
    };
  }, [radius, duration, speed, scrambleChars]);

  // Split into words so wrapping only occurs at space boundaries (word-level inline-block)
  const words = children.trim().split(' ');

  return (
    <span ref={containerRef} className={className} style={style} aria-label={children}>
      {words.map((word, wi) => (
        <span key={wi}>
          {/* Word-level wrapper: nowrap prevents line-breaks INSIDE a word */}
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {word.split('').map((char, ci) => (
              // Character-level wrapper: position:relative lets the overlay sit exactly on top
              <span key={ci} style={{ position: 'relative', display: 'inline-block' }}>
                {/* Layout anchor — invisible, holds the natural character width so layout never shifts */}
                <span style={{ visibility: 'hidden', userSelect: 'none' }} aria-hidden="true">
                  {char}
                </span>
                {/* Scramble target — absolutely positioned, GSAP changes only textContent here */}
                <span
                  data-char={char}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
          {/* Inter-word space — rendered as a regular text node so it behaves like native spacing */}
          {wi < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
