import React from 'react';
import { TreeSection } from '../types/talent';
import { Sparkles, Download, RotateCcw, Search, User, Shield } from 'lucide-react';

interface CharacterHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  level: number;
  onLevelChange: (level: number) => void;
  totalPoints: number;
  spentPoints: number;
  remainingPoints: number;
  freeSurgesChosen: string[];
  activeSection: TreeSection;
  onSectionChange: (section: TreeSection) => void;
  onOpenSheet: () => void;
  onReset: () => void;
  onOpenSearch: () => void;
  onCenterView: () => void;
}

export const CharacterHeader: React.FC<CharacterHeaderProps> = ({
  name,
  onNameChange,
  level,
  onLevelChange,
  totalPoints,
  spentPoints,
  remainingPoints,
  freeSurgesChosen,
  activeSection,
  onSectionChange,
  onOpenSheet,
  onReset,
  onOpenSearch,
  onCenterView,
}) => {
  const isAllPointsSpent = remainingPoints === 0 && totalPoints > 0;

  return (
    <header className="relative z-30 flex flex-col border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5">
      {/* Top row: Brand & Character info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCenterView}
            className="flex items-center gap-2 text-left group cursor-pointer"
            title="Centrar árbol de habilidades"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                Cosmere RPG
              </span>
              <span className="block text-[11px] text-slate-400 font-mono">
                Árbol de Habilidades
              </span>
            </div>
          </button>
        </div>

        {/* Character Name & Level Inputs */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-sky-400 shrink-0" />
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Nombre del personaje..."
              className="bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none w-36 md:w-44 border-b border-transparent focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Level Stepper */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nivel:
            </span>
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 px-1">
              <button
                type="button"
                onClick={() => onLevelChange(Math.max(0, level - 1))}
                className="px-1.5 py-0.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Bajar nivel"
              >
                -
              </button>
              <span className="w-7 text-center font-mono text-xs font-bold text-sky-400">
                {level}
              </span>
              <button
                type="button"
                onClick={() => onLevelChange(level + 1)}
                className="px-1.5 py-0.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Subir nivel"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Points Counter Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                Puntos de Talento
              </span>
              <div className="flex items-center gap-1 font-mono text-xs">
                <span className="text-slate-300">{spentPoints} gastados</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{totalPoints} total (n+1)</span>
              </div>
            </div>

            <div
              className={`flex items-center justify-center rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                remainingPoints > 0
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
              title={`${remainingPoints} puntos disponibles para gastar`}
            >
              {remainingPoints} disponibles
            </div>
          </div>

          {/* Quick Actions: Search, Sheet, Reset */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
            title="Buscar habilidad o palabra clave"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSheet}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-md transition-all cursor-pointer ${
              isAllPointsSpent
                ? 'bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-blue-500/25 ring-2 ring-sky-400/50 hover:brightness-110'
                : 'border border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-500/60 hover:text-white'
            }`}
            title="Ver y descargar ficha de personaje con talentos"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isAllPointsSpent ? 'Descargar Ficha (Completa)' : 'Ficha de Personaje'}
            </span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:border-red-900 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
            title="Reiniciar árbol y devolver puntos"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Category Filter & Legend Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {[
            { id: 'heroic', label: 'HEROIC PATHS' },
            { id: 'investiture', label: 'INVESTITURE PATHS' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSectionChange(tab.id as TreeSection)}
              className={`rounded-lg border px-4 py-1.5 text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-sky-600/30 border-sky-500/50 text-sky-200'
                  : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PoE Node Status Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span className="text-blue-300">Adquirido (Azul)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            <span className="text-emerald-300">Disponible (Verde)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-slate-700" />
            <span className="text-slate-500">Bloqueado (Gris)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
