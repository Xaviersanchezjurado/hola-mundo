import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroicPathCarouselProps {
  onSelectPath: (pathName: string) => void;
}

const HEROIC_PATHS = [
  { name: 'Agent', image: '1_agent.png' },
  { name: 'Envoy', image: '2_envoy.png' },
  { name: 'Hunter', image: '3_hunter.png' },
  { name: 'Leader', image: '4_leader.png' },
  { name: 'Scholar', image: '5_scholar.png' },
  { name: 'Warrior', image: '6_warrior.png' },
];

const HEROIC_PATHS_BASE_URL = `${import.meta.env.BASE_URL}heroic_paths/`;

// Posición de cada imagen respecto a la activa: -1 izquierda, 0 centro, 1 derecha.
// Usa la distancia circular más corta para que el carrusel pueda dar la vuelta.
const getCarouselOffset = (index: number, activeIndex: number, total: number) => {
  const diff = (index - activeIndex + total) % total;
  return diff > total / 2 ? diff - total : diff;
};

export const HeroicPathCarousel: React.FC<HeroicPathCarouselProps> = ({ onSelectPath }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + HEROIC_PATHS.length) % HEROIC_PATHS.length);
  };
  const showNext = () => {
    setActiveIndex((index) => (index + 1) % HEROIC_PATHS.length);
  };

  return (
    <section className="absolute inset-0 z-20 isolate flex flex-col items-center justify-center gap-3 overflow-hidden bg-slate-950/95 px-3 py-4 backdrop-blur-md sm:gap-5">
      <div className="starfield-background absolute inset-0 z-0 pointer-events-none opacity-70" />

      <header className="relative z-10 -translate-y-3 text-center sm:-translate-y-5">
        <p className="heroic-path-heading font-cinzel-decorative text-xl tracking-[0.18em] text-sky-300 sm:text-2xl">
          SELECT YOUR HEROIC PATH
        </p>
      </header>

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-center gap-1 sm:gap-4">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Ver Heroic Path anterior"
          className="z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg transition hover:border-sky-300/50 hover:bg-slate-800 hover:text-white sm:h-12 sm:w-12"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="heroic-carousel-stage relative h-[min(52vh,520px)] min-w-0 flex-1">
          {HEROIC_PATHS.map((path, index) => {
            const offset = getCarouselOffset(index, activeIndex, HEROIC_PATHS.length);
            const isActive = offset === 0;
            const isSide = Math.abs(offset) === 1;
            const isHidden = !isActive && !isSide;

            return (
              <button
                key={path.name}
                type="button"
                onClick={() => (isActive ? onSelectPath(path.name) : setActiveIndex(index))}
                aria-label={isActive ? `Seleccionar ${path.name}` : `Mostrar ${path.name}`}
                aria-current={isActive ? 'true' : undefined}
                aria-hidden={isHidden || undefined}
                tabIndex={isHidden ? -1 : 0}
                className={`heroic-carousel-slide group absolute left-1/2 top-1/2 origin-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 ${
                  isActive
                    ? 'z-20 opacity-100'
                    : isSide
                    ? 'z-10 opacity-55 max-md:pointer-events-none max-md:opacity-0'
                    : 'pointer-events-none opacity-0'
                }`}
                style={{
                  transform: `translate(-50%, -50%) translateX(calc(${offset} * var(--carousel-spread))) scale(${isActive ? 1 : 0.62})`,
                }}
              >
                <div className="heroic-carousel-image-frame">
                  <img
                    src={`${HEROIC_PATHS_BASE_URL}${path.image}`}
                    alt={path.name}
                    draggable={false}
                    className="heroic-carousel-image h-[min(52vh,520px)] w-auto max-w-[68vw] object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={showNext}
          aria-label="Ver Heroic Path siguiente"
          className="z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg transition hover:border-sky-300/50 hover:bg-slate-800 hover:text-white sm:h-12 sm:w-12"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-2" aria-label="Elegir Heroic Path">
        {HEROIC_PATHS.map((path, index) => (
          <button
            key={path.name}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Mostrar ${path.name}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-7 bg-sky-300' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
