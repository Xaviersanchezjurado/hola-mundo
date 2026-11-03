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

export const HeroicPathCarousel: React.FC<HeroicPathCarouselProps> = ({ onSelectPath }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePath = HEROIC_PATHS[activeIndex];
  const previousPath = HEROIC_PATHS[(activeIndex - 1 + HEROIC_PATHS.length) % HEROIC_PATHS.length];
  const nextPath = HEROIC_PATHS[(activeIndex + 1) % HEROIC_PATHS.length];

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
          <p className="font-cinzel-decorative text-xl tracking-[0.18em] text-sky-300 sm:text-2xl">
          SELECT YOUR HEROIC PATH
        </p>
      </header>

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-center gap-2 sm:gap-5">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Ver Heroic Path anterior"
          className="absolute left-1 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg transition hover:border-sky-300/50 hover:bg-slate-800 hover:text-white sm:left-3 sm:h-12 sm:w-12"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={showPrevious}
          aria-label={`Ver ${previousPath.name}`}
          className="hidden shrink-0 opacity-55 transition duration-300 hover:scale-[1.03] hover:opacity-85 md:block"
        >
          <img
            src={`${HEROIC_PATHS_BASE_URL}${previousPath.image}`}
            alt={previousPath.name}
            className="h-[min(34vh,320px)] w-auto max-w-[20vw] object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          />
        </button>

        <button
          type="button"
          onClick={() => onSelectPath(activePath.name)}
          aria-label={`Seleccionar ${activePath.name}`}
          className="relative z-10 shrink-0 transition duration-500 hover:scale-[1.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
        >
          <img
            key={activePath.name}
            src={`${HEROIC_PATHS_BASE_URL}${activePath.image}`}
            alt={activePath.name}
            className="h-[min(52vh,520px)] w-auto max-w-[68vw] object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          />
        </button>

        <button
          type="button"
          onClick={showNext}
          aria-label={`Ver ${nextPath.name}`}
          className="hidden shrink-0 opacity-55 transition duration-300 hover:scale-[1.03] hover:opacity-85 md:block"
        >
          <img
            src={`${HEROIC_PATHS_BASE_URL}${nextPath.image}`}
            alt={nextPath.name}
            className="h-[min(34vh,320px)] w-auto max-w-[20vw] object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          />
        </button>

        <button
          type="button"
          onClick={showNext}
          aria-label="Ver Heroic Path siguiente"
          className="absolute right-1 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 shadow-lg transition hover:border-sky-300/50 hover:bg-slate-800 hover:text-white sm:right-3 sm:h-12 sm:w-12"
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
