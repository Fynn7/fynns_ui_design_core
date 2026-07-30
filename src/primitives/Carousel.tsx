import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { IconButton } from "./IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { Tooltip } from "./Tooltip";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type CarouselVariant = "hero" | "multi";

export type CarouselItemProps = HTMLAttributes<HTMLDivElement> & {
  /** Accessible name for this slide. */
  label?: string;
  children?: ReactNode;
};

/**
 * One carousel slide surface. Prefer passing `label` for screen readers.
 */
export function CarouselItem({
  label,
  className,
  children,
  ...rest
}: CarouselItemProps) {
  return (
    <div
      {...rest}
      className={join("fynns-carousel-item", className)}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
    >
      {children}
    </div>
  );
}
CarouselItem.displayName = "CarouselItem";

export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  /** Accessible name for the carousel region. */
  ariaLabel: string;
  /** `hero` = full-width slides; `multi` = peek neighbors (default). */
  variant?: CarouselVariant;
  /** Controlled active index. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  showArrows?: boolean;
  showIndicators?: boolean;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
  /** Slide children — typically `<CarouselItem>`s. */
  children: ReactNode;
};

function collectSlides(children: ReactNode): ReactElement[] {
  return Children.toArray(children).filter(isValidElement) as ReactElement[];
}

function clampIndex(i: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, i));
}

/**
 * M3 Carousel — horizontal snap strip with optional arrows and indicators.
 * Keyboard: Left/Right/Home/End when the region is focused. Drag/swipe via
 * native overflow + scroll-snap. Indices clamp at the ends (no wrap).
 * @see https://m3.material.io/components/carousel/overview
 */
export function Carousel({
  ariaLabel,
  variant = "multi",
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  showArrows = true,
  showIndicators = true,
  prevAriaLabel = "Previous slide",
  nextAriaLabel = "Next slide",
  children,
  className,
  ...rest
}: CarouselProps) {
  const baseId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const ignoreScrollRef = useRef(false);
  const clearIgnoreTimerRef = useRef(0);
  const activeRef = useRef(0);
  const slides = collectSlides(children);
  const count = slides.length;

  const [uncontrolled, setUncontrolled] = useState(() =>
    clampIndex(defaultIndex, Math.max(count, 1)),
  );
  const active = clampIndex(
    indexProp !== undefined ? indexProp : uncontrolled,
    count,
  );
  activeRef.current = active;

  const commit = useCallback(
    (next: number) => {
      const clamped = clampIndex(next, count);
      if (indexProp === undefined) setUncontrolled(clamped);
      if (clamped !== activeRef.current) onIndexChange?.(clamped);
      activeRef.current = clamped;
      return clamped;
    },
    [count, indexProp, onIndexChange],
  );

  const scrollToIndex = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>(
      `[data-carousel-index="${i}"]`,
    );
    if (!slide) return;

    ignoreScrollRef.current = true;
    window.clearTimeout(clearIgnoreTimerRef.current);
    const clearIgnore = () => {
      ignoreScrollRef.current = false;
      track.removeEventListener("scrollend", clearIgnore);
    };
    track.addEventListener("scrollend", clearIgnore, { once: true });
    clearIgnoreTimerRef.current = window.setTimeout(
      clearIgnore,
      behavior === "smooth" ? 500 : 50,
    );

    // Center the slide in the track (side gutters make first/last reachable).
    // Use viewport rects — offsetLeft can be relative to a non-track offsetParent.
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const trackRect = track.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const slideLeftInTrack =
      slideRect.left - trackRect.left + track.scrollLeft;
    const left =
      slideLeftInTrack - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({
      left: Math.min(maxScroll, Math.max(0, left)),
      behavior,
    });
  }, []);

  const navigateTo = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      const next = commit(i);
      scrollToIndex(next, behavior);
    },
    [commit, scrollToIndex],
  );

  const go = (delta: number) => {
    navigateTo(activeRef.current + delta);
  };

  // Initial alignment when slide count / variant changes.
  useEffect(() => {
    if (count === 0) return;
    scrollToIndex(activeRef.current, "auto");
  }, [count, variant, scrollToIndex]);

  // External controlled index updates (not from our own navigateTo).
  const prevIndexPropRef = useRef(indexProp);
  useEffect(() => {
    if (indexProp === undefined || count === 0) return;
    if (prevIndexPropRef.current === indexProp) return;
    prevIndexPropRef.current = indexProp;
    // Parent changed index without going through navigateTo.
    if (indexProp !== activeRef.current) {
      activeRef.current = clampIndex(indexProp, count);
      scrollToIndex(activeRef.current, "smooth");
    }
  }, [indexProp, count, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;

    let ticking = false;
    const syncFromScroll = () => {
      if (ignoreScrollRef.current) return;
      const nodes = Array.from(
        track.querySelectorAll<HTMLElement>("[data-carousel-index]"),
      );
      if (nodes.length === 0) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      // At hard ends, prefer first/last — mid-point nearest can stay on the
      // previous slide when the last card cannot fully center.
      if (maxScroll > 0 && track.scrollLeft <= 1) {
        commit(0);
        return;
      }
      if (maxScroll > 0 && track.scrollLeft >= maxScroll - 1) {
        commit(nodes.length - 1);
        return;
      }
      const mid = track.scrollLeft + track.clientWidth / 2;
      const trackRect = track.getBoundingClientRect();
      let best = 0;
      let bestDist = Infinity;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        const center =
          rect.left - trackRect.left + track.scrollLeft + rect.width / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = Number(node.dataset.carouselIndex);
        }
      }
      commit(best);
    };

    const onScroll = () => {
      if (ignoreScrollRef.current || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        syncFromScroll();
      });
    };

    const onScrollEnd = () => {
      if (ignoreScrollRef.current) return;
      syncFromScroll();
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scrollend", onScrollEnd);
    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", onScrollEnd);
    };
  }, [commit, count]);

  useEffect(() => {
    return () => window.clearTimeout(clearIgnoreTimerRef.current);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      navigateTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      navigateTo(count - 1);
    }
  };

  if (count === 0) return null;

  const atStart = active <= 0;
  const atEnd = active >= count - 1;

  return (
    <div
      {...rest}
      className={join(
        "fynns-carousel",
        `fynns-carousel--${variant}`,
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="fynns-carousel-stage">
        {showArrows ? (
          <Tooltip content={prevAriaLabel}>
            <IconButton
              type="button"
              className="fynns-carousel-arrow fynns-carousel-arrow--prev"
              aria-label={prevAriaLabel}
              aria-controls={`${baseId}-track`}
              disabled={atStart}
              onClick={() => go(-1)}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <div
          id={`${baseId}-track`}
          ref={trackRef}
          className="fynns-carousel-track"
        >
          {slides.map((slide, i) => {
            const props = slide.props as CarouselItemProps;
            const label = props.label ?? `Slide ${i + 1} of ${count}`;
            const content = isValidElement(slide)
              ? cloneElement(slide, {
                  label,
                  "aria-hidden": i !== active ? true : undefined,
                } as Partial<CarouselItemProps>)
              : slide;
            return (
              <div
                key={slide.key ?? i}
                className="fynns-carousel-slide"
                data-carousel-index={i}
              >
                {content}
              </div>
            );
          })}
        </div>
        {showArrows ? (
          <Tooltip content={nextAriaLabel}>
            <IconButton
              type="button"
              className="fynns-carousel-arrow fynns-carousel-arrow--next"
              aria-label={nextAriaLabel}
              aria-controls={`${baseId}-track`}
              disabled={atEnd}
              onClick={() => go(1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
      {showIndicators ? (
        <div
          className="fynns-carousel-indicators"
          role="tablist"
          aria-label={ariaLabel}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              className={join(
                "fynns-carousel-indicator",
                i === active && "fynns-carousel-indicator--active",
              )}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => navigateTo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
