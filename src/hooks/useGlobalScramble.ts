import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

export function useGlobalScramble() {
  useEffect(() => {
    const radius = 130;
    const duration = 1.2;
    const speed = 0.5;
    const scrambleChars = '.:';

    // Process a single heading element and split it into layout-stable spans
    const processElement = (el: HTMLElement) => {
      const currentText = el.textContent || '';
      
      // Avoid processing if it's already scrambled and the text hasn't changed
      if (el.dataset.scrambled === 'true' && el.dataset.originalText === currentText) {
        return;
      }
      
      // Avoid recursive loops during mutation
      if (el.classList.contains('scramble-processing')) {
        return;
      }

      el.classList.add('scramble-processing');
      el.dataset.originalText = currentText;
      el.innerHTML = ''; // Clear original content safely

      const words = currentText.trim().split(' ');
      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        word.split('').forEach((char) => {
          const charWrapper = document.createElement('span');
          charWrapper.style.position = 'relative';
          charWrapper.style.display = 'inline-block';

          // Hidden layout anchor (maintains layout dimension)
          const anchor = document.createElement('span');
          anchor.style.visibility = 'hidden';
          anchor.style.userSelect = 'none';
          anchor.setAttribute('aria-hidden', 'true');
          anchor.textContent = char;

          // Absolute scramble target
          const target = document.createElement('span');
          target.className = 'scramble-char-target';
          target.setAttribute('data-char', char);
          target.setAttribute('aria-hidden', 'true');
          target.style.position = 'absolute';
          target.style.inset = '0';
          target.style.display = 'flex';
          target.style.alignItems = 'center';
          target.style.justifyContent = 'center';
          target.textContent = char;

          charWrapper.appendChild(anchor);
          charWrapper.appendChild(target);
          wordSpan.appendChild(charWrapper);
        });

        el.appendChild(wordSpan);

        if (wi < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      el.dataset.scrambled = 'true';
      el.classList.remove('scramble-processing');
    };

    let observer: MutationObserver | null = null;

    // Find all matching headings and process them
    const queryAndProcess = () => {
      // Temporarily disconnect observer during DOM manipulation to prevent triggers
      observer?.disconnect();

      const headings = document.querySelectorAll<HTMLElement>(
        'h1.font-headline, h2.font-headline, [data-scramble="true"]'
      );
      headings.forEach((heading) => {
        // Skip elements within admin panel to keep admin text clean
        if (heading.closest('#admin-dashboard')) {
          return;
        }
        // Skip small badges, labels, or elements with text-xs, text-sm, text-base, text-lg
        if (
          heading.classList.contains('text-xs') ||
          heading.classList.contains('text-sm') ||
          heading.classList.contains('text-base') ||
          heading.classList.contains('text-lg')
        ) {
          return;
        }

        const hasTargets = heading.querySelector('.scramble-char-target') !== null;
        if (hasTargets) {
          // Already scrambled, do not process again
          return;
        }

        processElement(heading);
      });

      // Reconnect observer
      if (observer) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    };

    // Set up MutationObserver to auto-process headings that render or change dynamically
    observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target;
          const element = target.nodeType === Node.ELEMENT_NODE ? (target as HTMLElement) : target.parentElement;
          if (!element) continue;

          // Find if this mutation occurred within a heading
          const heading = element.closest('h1.font-headline, h2.font-headline, [data-scramble="true"]');
          
          if (heading) {
            // Reprocess only if the heading was cleared of our custom targets (e.g. re-rendered by React)
            const hasTargets = heading.querySelector('.scramble-char-target') !== null;
            if (!hasTargets && !heading.classList.contains('scramble-processing')) {
              shouldProcess = true;
            }
          } else {
            // If mutation is outside headings, check if a new heading element was added
            if (mutation.type === 'childList') {
              let containsHeading = false;
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const el = node as HTMLElement;
                  if (
                    el.matches('h1.font-headline, h2.font-headline, [data-scramble="true"]') ||
                    el.querySelector('h1.font-headline, h2.font-headline, [data-scramble="true"]')
                  ) {
                    containsHeading = true;
                  }
                }
              });
              if (containsHeading) {
                shouldProcess = true;
              }
            }
          }
        }
      }
      if (shouldProcess) {
        queryAndProcess();
      }
    });

    // Run initial processing
    queryAndProcess();

    // Global mouse-proximity scramble effect.
    // Coalesced to one pass per animation frame (native pointermove can fire
    // far faster than 60Hz) and pre-filtered to headings whose bounding box
    // is actually near the viewport, so we're not calling getBoundingClientRect
    // (a forced layout reflow) on every character span of every heading on the
    // whole page for every mouse pixel moved.
    let pending: PointerEvent | null = null;
    let rafId: number | null = null;

    const runScrambleCheck = (e: PointerEvent) => {
      const headings = document.querySelectorAll<HTMLElement>(
        'h1.font-headline, h2.font-headline, [data-scramble="true"]'
      );
      headings.forEach((heading) => {
        const hb = heading.getBoundingClientRect();
        const nearHeading =
          e.clientX >= hb.left - radius &&
          e.clientX <= hb.right + radius &&
          e.clientY >= hb.top - radius &&
          e.clientY <= hb.bottom + radius;
        if (!nearHeading) return;

        const targets = heading.querySelectorAll<HTMLElement>('.scramble-char-target');
        targets.forEach((span) => {
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
      });
    };

    const handleMove = (e: PointerEvent) => {
      pending = e;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (pending) runScrambleCheck(pending);
      });
    };

    window.addEventListener('pointermove', handleMove);

    return () => {
      observer?.disconnect();
      window.removeEventListener('pointermove', handleMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
      const targets = document.querySelectorAll<HTMLElement>('.scramble-char-target');
      gsap.killTweensOf(targets);
    };
  }, []);
}
