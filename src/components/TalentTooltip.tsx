import React from 'react';
import { TalentNode, NodeStatus } from '../types/talent';
import { Sparkles, CheckCircle2, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface TalentTooltipProps {
  talent: TalentNode | null;
  status: NodeStatus;
  canAfford: boolean;
  isFreeGrant: boolean;
  refundWarning?: string | null;
  onSelect: (talentId: string) => void;
  onRefund: (talentId: string) => void;
  onClose?: () => void;
}

export const TalentTooltip: React.FC<TalentTooltipProps> = ({
  talent,
  status,
  canAfford,
  isFreeGrant,
  refundWarning,
  onSelect,
  onRefund,
  onClose,
}) => {
  if (!talent) return null;

  const statusConfig = {
    acquired: {
      color: 'border-blue-500/80 bg-blue-950/90 text-blue-200 shadow-blue-500/20',
      badge: 'bg-blue-600 text-white',
      label: 'Adquirido',
      icon: CheckCircle2,
    },
    available: {
      color: 'border-emerald-500/80 bg-emerald-950/90 text-emerald-200 shadow-emerald-500/20',
      badge: 'bg-emerald-600 text-white',
      label: isFreeGrant ? 'Disponible Gratis' : 'Disponible',
      icon: Sparkles,
    },
    locked: {
      color: 'border-slate-700 bg-slate-900/95 text-slate-400 shadow-black/40',
      badge: 'bg-slate-700 text-slate-300',
      label: 'Bloqueado',
      icon: Lock,
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`w-96 rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all ${statusConfig.color}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              {talent.pathName}
            </span>
            {talent.specialty && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-[11px] font-medium text-slate-300">
                  {talent.specialty}
                </span>
              </>
            )}
          </div>
          <h3 className="mt-1 text-base font-bold text-white leading-snug">
            {talent.name}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.badge}`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
          <span className="text-[10px] text-slate-400">
            {talent.isKeyTalent ? 'Key Talent' : isFreeGrant || talent.cost === 0 ? 'Coste: 0 pts' : 'Coste: 1 pt'}
          </span>
        </div>
      </div>

      {/* Verbatim Description from PDF (Never modified) */}
      <div className="my-3 max-h-60 overflow-y-auto pr-1 text-xs leading-relaxed text-slate-200 whitespace-pre-line">
        {talent.description}
      </div>

      {/* Refund Warning */}
      {refundWarning && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-950/70 border border-amber-600/60 p-2 text-[11px] text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{refundWarning}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-[11px] text-slate-400">
          {status === 'acquired'
            ? 'Talento desbloqueado'
            : status === 'available'
            ? isFreeGrant
              ? 'Reclama este talento gratis'
              : 'Gasta 1 punto para desbloquear'
            : 'Cumple los requisitos previos'}
        </span>

        {status === 'available' && (
          <button
            type="button"
            onClick={() => onSelect(talent.id)}
            disabled={!canAfford && !isFreeGrant}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md transition-all ${
              canAfford || isFreeGrant
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isFreeGrant ? 'Reclamar Gratis' : 'Aprender (1 pt)'}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}

        {status === 'acquired' && (
          <button
            type="button"
            onClick={() => onRefund(talent.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-950/70 border border-red-700/60 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/80 active:scale-95 cursor-pointer transition-all"
          >
            Devolver talento
          </button>
        )}
      </div>
    </div>
  );
};
