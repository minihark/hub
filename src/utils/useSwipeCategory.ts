import { useRef, useEffect, useState, RefObject } from 'react';
import { AppCategory } from '../types';
import { playTabClick } from './audio';

interface SwipeSample {
  x: number;
  time: number;
}

interface UseSwipeCategoryOptions {
  activeCategories: AppCategory[];
  selectedCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
}

export function useSwipeCategory({
  activeCategories,
  selectedCategory,
  onSelectCategory,
  containerRef,
  enabled = true,
}: UseSwipeCategoryOptions) {
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Keep latest state in ref to avoid stale closure issues in DOM event listeners
  const optionsRef = useRef({ activeCategories, selectedCategory, onSelectCategory, enabled });
  optionsRef.current = { activeCategories, selectedCategory, onSelectCategory, enabled };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let axisLock: 'horizontal' | 'vertical' | null = null;
    let samples: SwipeSample[] = [];

    function handleTouchStart(e: TouchEvent) {
      if (!optionsRef.current.enabled || e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Ignore touches starting inside inner horizontal scrollers, buttons, links, or inputs
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('#category-filter-scroller') ||
        target?.closest('#favorites-ribbon') ||
        target?.closest('button') ||
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('a')
      ) {
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
      axisLock = null;
      samples = [{ x: touch.clientX, time: performance.now() }];
    }

    function handleTouchMove(e: TouchEvent) {
      if (!startX || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const now = performance.now();
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Trailing window for velocity calculation (last 120ms)
      samples.push({ x: touch.clientX, time: now });
      const windowStart = now - 120;
      while (samples.length > 2 && samples[0].time < windowStart) {
        samples.shift();
      }

      // Early axis lock decision once movement exceeds 10px
      if (!axisLock) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX >= 10 || absY >= 10) {
          if (absX > absY * 1.3) {
            axisLock = 'horizontal';
          } else {
            axisLock = 'vertical';
          }
        }
      }

      // If locked horizontally, cancel default scrolling to provide clean swipe physics
      if (axisLock === 'horizontal') {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (axisLock !== 'horizontal' || !startX) {
        startX = 0;
        startY = 0;
        axisLock = null;
        samples = [];
        return;
      }

      const touch = e.changedTouches[0];
      const totalDeltaX = touch.clientX - startX;
      const now = performance.now();

      // Compute trailing window velocity (px/ms)
      let velocityX = 0;
      if (samples.length >= 2) {
        const oldest = samples[0];
        const dt = now - oldest.time;
        if (dt > 10) {
          velocityX = (touch.clientX - oldest.x) / dt;
        }
      }

      const absX = Math.abs(totalDeltaX);
      const absV = Math.abs(velocityX);

      // Trigger condition: either total displacement >= 48px or quick flick >= 0.35 px/ms (with min 25px displacement)
      const isSwipe = absX >= 48 || (absV >= 0.35 && absX >= 25);

      if (isSwipe) {
        const { activeCategories, selectedCategory, onSelectCategory } = optionsRef.current;
        const currentIndex = activeCategories.indexOf(selectedCategory);

        if (totalDeltaX < 0) {
          // Swipe Left -> Next Category
          if (currentIndex < activeCategories.length - 1 && currentIndex !== -1) {
            const nextCat = activeCategories[currentIndex + 1];
            setSlideDirection('left');
            playTabClick();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(12); } catch {}
            }
            onSelectCategory(nextCat);
          }
        } else {
          // Swipe Right -> Previous Category
          if (currentIndex > 0) {
            const prevCat = activeCategories[currentIndex - 1];
            setSlideDirection('right');
            playTabClick();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(12); } catch {}
            }
            onSelectCategory(prevCat);
          }
        }
      }

      startX = 0;
      startY = 0;
      axisLock = null;
      samples = [];
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [containerRef]);

  // Reset slide direction after animation completes
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 250);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  return { slideDirection };
}
