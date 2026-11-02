import React from 'react';
import { RADIANT_ORDERS } from '../data/radiantOrders';
import { Sparkles, Shield, X } from 'lucide-react';

interface OrderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
  alreadyChosenOrders: string[];
}

export const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  alreadyChosenOrders,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-sky-500/30 bg-slate-900/95 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-sky-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Knights Radiant
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">
              Elige tu Orden de los Caballeros Radiantes
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Al jurar el Primer Ideal desbloqueas 2 talentos gratuitos que corresponden a las dos Potencias (Surges) de tu Orden.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Orders Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1">
          {RADIANT_ORDERS.map((order) => {
            const isAlreadyChosen = alreadyChosenOrders.includes(order.id);
            return (
              <div
                key={order.id}
                className={`relative rounded-xl border p-4 transition-all flex flex-col justify-between ${
                  isAlreadyChosen
                    ? 'border-blue-600/50 bg-blue-950/30 opacity-70'
                    : 'border-slate-800 bg-slate-950/60 hover:border-sky-500/60 hover:bg-slate-800/50 cursor-pointer group'
                }`}
                onClick={() => {
                  if (!isAlreadyChosen) {
                    onSelectOrder(order.id);
                  }
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors">
                      {order.name}
                    </h3>
                    {isAlreadyChosen && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-medium">
                        Ya elegida
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {order.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Potencias: {order.surges.join(' & ')}</span>
                  </div>
                  {!isAlreadyChosen && (
                    <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      Elegir →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
