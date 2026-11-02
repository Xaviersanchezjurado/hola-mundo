import React, { useState, useMemo } from 'react';
import { ALL_TALENTS } from '../data/talents';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { NodeStatus } from '../types/talent';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTalent: (talentId: string) => void;
  getNodeStatus: (id: string) => NodeStatus;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTalent,
  getNodeStatus,
}) => {
  const [query, setQuery] = useState('');

  const filteredTalents = useMemo(() => {
    if (!query.trim()) return ALL_TALENTS.slice(0, 30);
    const q = query.toLowerCase();
    return ALL_TALENTS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.pathName.toLowerCase().includes(q) ||
        (t.specialty && t.specialty.toLowerCase().includes(q)) ||
        t.description.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar talento, efecto, potencia o metal (ej: Investiture, Plot die, Lurcher)..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredTalents.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No se encontraron talentos que coincidan con "{query}".
            </div>
          ) : (
            filteredTalents.map((talent) => {
              const status = getNodeStatus(talent.id);
              const statusStyles = {
                acquired: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
                available: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                locked: 'border-slate-800 bg-slate-950/40 text-slate-400',
              }[status];

              const badgeStyles = {
                acquired: 'bg-blue-600 text-white',
                available: 'bg-emerald-600 text-white',
                locked: 'bg-slate-800 text-slate-400',
              }[status];

              return (
                <div
                  key={talent.id}
                  onClick={() => {
                    onSelectTalent(talent.id);
                    onClose();
                  }}
                  className={`group rounded-xl border p-3 transition-all hover:border-sky-500/80 hover:bg-slate-800/60 cursor-pointer flex items-start justify-between gap-3 ${statusStyles}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        {talent.pathName}
                      </span>
                      {talent.specialty && (
                        <>
                          <span className="text-white/20">/</span>
                          <span className="text-[10px] text-slate-400">
                            {talent.specialty}
                          </span>
                        </>
                      )}
                      <span className={`ml-auto text-[9px] rounded-full px-2 py-0.5 font-medium ${badgeStyles}`}>
                        {status === 'acquired' ? 'Adquirido' : status === 'available' ? 'Disponible' : 'Bloqueado'}
                      </span>
                    </div>

                    <h4 className="mt-0.5 text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {talent.name}
                    </h4>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {talent.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all mt-2" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
