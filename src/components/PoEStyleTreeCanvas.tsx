import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TalentNode, NodeStatus, PathCategory } from '../types/talent';
import { ALL_TALENTS, TALENTS_BY_ID, getTreeConnections, ConnectionLink } from '../data/talents';
import { ZoomIn, ZoomOut, Maximize2, Compass, Layers, Sparkles } from 'lucide-react';

interface PoEStyleTreeCanvasProps {
  selectedTalents: string[];
  activeCategory: PathCategory | 'all';
  getNodeStatus: (id: string) => NodeStatus;
  hoveredTalentId: string | null;
  onHoverTalent: (talentId: string | null, clientPos?: { x: number; y: number }) => void;
  onSelectTalent: (talentId: string) => void;
  searchHighlightId?: string | null;
}

export const PoEStyleTreeCanvas: React.FC<PoEStyleTreeCanvasProps> = ({
  selectedTalents,
  activeCategory,
  getNodeStatus,
  hoveredTalentId,
  onHoverTalent,
  onSelectTalent,
  searchHighlightId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const connections = useRef<ConnectionLink[]>(getTreeConnections()).current;

  // Transform state: translate and scale
  // Tree coordinate space is 5400 x 4200, center is around (2400, 2200)
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.55,
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Center initial view on Heroic Paths center (2400, 2100)
  const centerView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const targetX = 2400;
    const targetY = 2100;
    const targetScale = clientWidth < 768 ? 0.35 : 0.55;
    setTransform({
      x: clientWidth / 2 - targetX * targetScale,
      y: clientHeight / 2 - targetY * targetScale,
      scale: targetScale,
    });
  }, []);

  useEffect(() => {
    centerView();
    window.addEventListener('resize', centerView);
    return () => window.removeEventListener('resize', centerView);
  }, [centerView]);

  // Jump to specific category coordinates when activeCategory changes
  useEffect(() => {
    if (!containerRef.current || activeCategory === 'all') return;
    const { clientWidth, clientHeight } = containerRef.current;
    const targetScale = clientWidth < 768 ? 0.45 : 0.65;
    const coords: Record<PathCategory, { x: number; y: number }> = {
      heroic: { x: 2400, y: 2100 },
      radiant: { x: 4200, y: 1100 },
      metallic: { x: 3000, y: 3400 },
      awakening: { x: 1200, y: 3500 },
      sand: { x: 800, y: 2500 },
      dor: { x: 1100, y: 1100 },
    };
    const c = coords[activeCategory];
    if (c) {
      setTransform({
        x: clientWidth / 2 - c.x * targetScale,
        y: clientHeight / 2 - c.y * targetScale,
        scale: targetScale,
      });
    }
  }, [activeCategory]);

  // Jump to search highlighted talent
  useEffect(() => {
    if (!searchHighlightId || !containerRef.current) return;
    const talent = TALENTS_BY_ID[searchHighlightId];
    if (!talent) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const targetScale = 0.85;
    setTransform({
      x: clientWidth / 2 - talent.x * targetScale,
      y: clientHeight / 2 - talent.y * targetScale,
      scale: targetScale,
    });
  }, [searchHighlightId]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse or middle mouse
    if (e.button !== 0 && e.button !== 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.18), 1.6);

    // Zoom towards mouse position
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  };

  // Zoom control buttons
  const zoomIn = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newScale = Math.min(transform.scale * 1.25, 1.6);
    setTransform((prev) => ({
      x: clientWidth / 2 - (clientWidth / 2 - prev.x) * (newScale / prev.scale),
      y: clientHeight / 2 - (clientHeight / 2 - prev.y) * (newScale / prev.scale),
      scale: newScale,
    }));
  };

  const zoomOut = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newScale = Math.max(transform.scale * 0.8, 0.18);
    setTransform((prev) => ({
      x: clientWidth / 2 - (clientWidth / 2 - prev.x) * (newScale / prev.scale),
      y: clientHeight / 2 - (clientHeight / 2 - prev.y) * (newScale / prev.scale),
      scale: newScale,
    }));
  };

  // Touch handlers for mobile/tablet pinch & drag
  const touchStart = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y,
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStart.current.dist = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTransform((prev) => ({
        ...prev,
        x: e.touches[0].clientX - touchStart.current.x,
        y: e.touches[0].clientY - touchStart.current.y,
      }));
    } else if (e.touches.length === 2 && touchStart.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchStart.current.dist;
      const newScale = Math.min(Math.max(transform.scale * ratio, 0.18), 1.6);
      touchStart.current.dist = dist;
      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="relative h-full w-full overflow-hidden bg-radial from-slate-900 via-slate-950 to-black cursor-grab active:cursor-grabbing select-none"
    >
      {/* Background Constellation Dust & Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Main SVG Tree World */}
      <svg
        className="absolute top-0 left-0 w-[5400px] h-[4400px] pointer-events-none overflow-visible"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Blue Glowing Filter for Acquired Connections */}
          <filter id="blue-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Green Glowing Filter for Available Connections */}
          <filter id="green-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Blue Gradient for Energy Pulses */}
          <linearGradient id="blueEnergy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Green Gradient */}
          <linearGradient id="greenEnergy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        {/* Central Cosmere Decorative Rings & Runes */}
        <g opacity="0.25">
          <circle cx="2400" cy="2100" r="180" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="2400" cy="2100" r="320" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 8" />
          <circle cx="2400" cy="2100" r="480" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 12" />
          <circle cx="2400" cy="2100" r="750" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 15" />
          <circle cx="2400" cy="2100" r="1100" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2 20" />
          {/* Radial Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="2400"
              y1="2100"
              x2={2400 + Math.cos((deg * Math.PI) / 180) * 1200}
              y2={2100 + Math.sin((deg * Math.PI) / 180) * 1200}
              stroke="#38bdf8"
              strokeWidth="0.5"
              strokeDasharray="4 20"
            />
          ))}
        </g>

        {/* Constellation Lines / Branches */}
        <g id="tree-connections">
          {connections.map((link, idx) => {
            const from = TALENTS_BY_ID[link.fromId];
            const to = TALENTS_BY_ID[link.toId];
            if (!from || !to) return null;

            const fromStatus = getNodeStatus(from.id);
            const toStatus = getNodeStatus(to.id);

            const isAcquiredLink = fromStatus === 'acquired' && toStatus === 'acquired';
            const isAvailableLink =
              (fromStatus === 'acquired' && toStatus === 'available') ||
              (toStatus === 'acquired' && fromStatus === 'available');

            // Line styles based on PoE status
            let strokeColor = '#334155'; // Gray locked
            let strokeWidth = 2;
            let filter = undefined;
            let strokeDash = undefined;

            if (isAcquiredLink) {
              strokeColor = '#38bdf8'; // Blue acquired
              strokeWidth = 3.5;
              filter = 'url(#blue-glow)';
            } else if (isAvailableLink) {
              strokeColor = '#4ade80'; // Green available
              strokeWidth = 2.5;
              filter = 'url(#green-glow)';
              strokeDash = '4 4';
            }

            // Draw curved organic branch line
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const cx1 = from.x + dx * 0.4;
            const cy1 = from.y;
            const cx2 = from.x + dx * 0.6;
            const cy2 = to.y;
            const pathD = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;

            return (
              <g key={`link-${idx}`}>
                {/* Background thicker line for glow */}
                {isAcquiredLink && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="6"
                    opacity="0.4"
                  />
                )}
                {/* Main line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  filter={filter}
                  opacity={isAcquiredLink ? 1 : isAvailableLink ? 0.9 : 0.35}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Interactive HTML Rectangular Nodes */}
      <div
        className="absolute top-0 left-0 w-[5400px] h-[4400px] pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {ALL_TALENTS.map((talent) => {
          const status = getNodeStatus(talent.id);
          const isSelected = status === 'acquired';
          const isAvailable = status === 'available';
          const isLocked = status === 'locked';
          const isHovered = hoveredTalentId === talent.id;
          const isHighlighted = searchHighlightId === talent.id;

          // Category Dimming if category filter active
          const isCategoryMatch = activeCategory === 'all' || talent.category === activeCategory;
          const categoryOpacity = isCategoryMatch ? 1 : 0.25;

          // Rectangle Width and Height based on name length
          const rectWidth = talent.isKeyTalent ? 130 : 110;
          const rectHeight = talent.isKeyTalent ? 46 : 38;

          // Color classes per requirements:
          // Azul for acquired, Verde for available, Gris for locked
          let styleClasses = '';
          if (isSelected) {
            styleClasses =
              'border-blue-400 bg-gradient-to-br from-blue-700 to-sky-900 text-white shadow-lg shadow-sky-500/50 ring-2 ring-sky-300';
          } else if (isAvailable) {
            styleClasses =
              'border-emerald-400 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900/80 text-emerald-300 shadow-md shadow-emerald-500/30 hover:border-emerald-300 hover:scale-105 animate-pulse';
          } else {
            styleClasses =
              'border-slate-800 bg-slate-950/85 text-slate-500 hover:border-slate-700 hover:text-slate-400';
          }

          if (isHighlighted) {
            styleClasses += ' ring-4 ring-amber-400 scale-110';
          }

          return (
            <div
              key={talent.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTalent(talent.id);
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onHoverTalent(talent.id, { x: rect.right + 10, y: rect.top });
              }}
              onMouseLeave={() => {
                onHoverTalent(null);
              }}
              className={`absolute pointer-events-auto rounded-lg border px-2 py-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer font-sans ${styleClasses}`}
              style={{
                left: talent.x - rectWidth / 2,
                top: talent.y - rectHeight / 2,
                width: rectWidth,
                height: rectHeight,
                opacity: categoryOpacity,
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                zIndex: isSelected ? 20 : isAvailable ? 15 : 10,
              }}
              title={talent.name}
            >
              {/* Badge for code (1, 2, a, b, key) */}
              <div className="flex items-center gap-1 w-full justify-between">
                <span
                  className={`text-[9px] font-mono px-1 rounded font-semibold ${
                    isSelected
                      ? 'bg-blue-400 text-slate-950'
                      : isAvailable
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {talent.code || '·'}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-70 truncate max-w-[70px]">
                  {talent.specialty || talent.pathName}
                </span>
              </div>

              {/* Exact short name on rectangle */}
              <span className="mt-0.5 text-[11px] font-bold leading-tight truncate w-full">
                {talent.shortName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Controls (HUD bottom-left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/85 p-1.5 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={centerView}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Centrar vista en Heroic Paths"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Sector Navigator Mini-Pills (bottom center) */}
      <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/85 p-1 backdrop-blur-md shadow-2xl text-[11px]">
        {[
          { label: 'Heroic', x: 2400, y: 2100 },
          { label: 'Radiant', x: 4200, y: 1100 },
          { label: 'Metallic Arts', x: 3000, y: 3400 },
          { label: 'Awakening', x: 1200, y: 3500 },
          { label: 'Sand Mastery', x: 800, y: 2500 },
          { label: 'The Dor', x: 1100, y: 1100 },
        ].map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              if (!containerRef.current) return;
              const { clientWidth, clientHeight } = containerRef.current;
              const sScale = 0.65;
              setTransform({
                x: clientWidth / 2 - s.x * sScale,
                y: clientHeight / 2 - s.y * sScale,
                scale: sScale,
              });
            }}
            className="rounded-lg px-2.5 py-1 font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Mini-Map Indicator (bottom right) */}
      <div className="hidden lg:block absolute bottom-4 right-4 z-20 w-44 h-32 rounded-xl border border-slate-800 bg-slate-950/90 p-1.5 backdrop-blur-md shadow-2xl overflow-hidden pointer-events-none">
        <div className="relative w-full h-full rounded border border-slate-800/80 bg-slate-900/60">
          {/* Mini points */}
          {ALL_TALENTS.map((t) => {
            const mx = (t.x / 5400) * 100;
            const my = (t.y / 4400) * 100;
            const status = getNodeStatus(t.id);
            const color =
              status === 'acquired' ? '#38bdf8' : status === 'available' ? '#4ade80' : '#475569';
            return (
              <span
                key={t.id}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${mx}%`,
                  top: `${my}%`,
                  backgroundColor: color,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
