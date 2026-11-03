import React, { useState, useMemo, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { NodeStatus, TreeSection } from './types/talent';
import {
  ALL_TALENTS,
  TALENTS_BY_ID,
  HEROIC_KEY_IDS,
  NON_HEROIC_KEY_IDS,
  DOR_TIER1_IDS,
  ALLOMANCY_METAL_IDS,
  FERUCHEMY_METAL_IDS,
  getTalentStatus,
  canRefundTalent,
} from './data/talents';
import { RADIANT_ORDERS } from './data/radiantOrders';
import { PoEStyleTreeCanvas } from './components/PoEStyleTreeCanvas';
import { CharacterHeader } from './components/CharacterHeader';
import { TalentTooltip } from './components/TalentTooltip';
import { OrderSelectionModal } from './components/OrderSelectionModal';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { HeroicPathCarousel } from './components/HeroicPathCarousel';
import { Sparkles, Info, AlertCircle, Award } from 'lucide-react';

const STORAGE_KEY = 'cosmere_rpg_character_state_v1';

export default function App() {
  // Character Basic Info
  const [characterName, setCharacterName] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.characterName || 'Kaladin';
      } catch (e) {}
    }
    return 'Kaladin';
  });

  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.level === 'number' ? parsed.level : 2;
      } catch (e) {}
    }
    return 2;
  });

  // Selected Talents
  const [selectedTalents, setSelectedTalents] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.selectedTalents) ? parsed.selectedTalents : [];
      } catch (e) {}
    }
    return [];
  });

  // Radiant Orders chosen (for First Ideal)
  const [firstIdealOrders, setFirstIdealOrders] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.firstIdealOrders) ? parsed.firstIdealOrders : [];
      } catch (e) {}
    }
    return [];
  });

  // Active Category Filter
  const [activeSection, setActiveSection] = useState<TreeSection>('heroic');
  const [selectedHeroicPath, setSelectedHeroicPath] = useState<string | null>(null);

  // UI Interactive States
  const [hoveredTalentId, setHoveredTalentId] = useState<string | null>(null);
  const [inspectTalentId, setInspectTalentId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [refundWarning, setRefundWarning] = useState<string | null>(null);

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [searchHighlightId, setSearchHighlightId] = useState<string | null>(null);

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        characterName,
        level,
        selectedTalents,
        firstIdealOrders,
      })
    );
  }, [characterName, level, selectedTalents, firstIdealOrders]);

  // Points calculation: Level n grants n + 1 points
  const totalPoints = level + 1;

  // Free talents calculation
  const freeSurgesChosen = useMemo(() => {
    const surges: string[] = [];
    for (const orderId of firstIdealOrders) {
      const order = RADIANT_ORDERS.find((o) => o.id === orderId);
      if (order) {
        for (const surgeName of order.surges) {
          const surgeTalent = ALL_TALENTS.find(
            (t) => t.specialty === surgeName && t.code === 'free'
          );
          if (surgeTalent && !surges.includes(surgeTalent.id)) {
            surges.push(surgeTalent.id);
          }
        }
      }
    }
    return surges;
  }, [firstIdealOrders]);

  // Determine free picks consumed
  const freeAllomancyChosen = useMemo(() => {
    if (!selectedTalents.includes('mistborn_key')) return undefined;
    return selectedTalents.find((id) => ALLOMANCY_METAL_IDS.includes(id));
  }, [selectedTalents]);

  const freeFeruchemyChosen = useMemo(() => {
    if (!selectedTalents.includes('feru_key')) return undefined;
    return selectedTalents.find((id) => FERUCHEMY_METAL_IDS.includes(id));
  }, [selectedTalents]);

  const freeDorTalentChosen = useMemo(() => {
    if (!selectedTalents.includes('dor_key')) return undefined;
    return selectedTalents.find((id) => DOR_TIER1_IDS.includes(id));
  }, [selectedTalents]);

  // Total spent points
  const spentPoints = useMemo(() => {
    let spent = 0;
    for (const id of selectedTalents) {
      const talent = TALENTS_BY_ID[id];
      if (!talent) continue;

      // Free surge talents cost 0
      if (talent.code === 'free' && talent.category === 'radiant') {
        continue;
      }

      // First allomancy talent is free
      if (id === freeAllomancyChosen) {
        continue;
      }

      // First feruchemy talent is free
      if (id === freeFeruchemyChosen) {
        continue;
      }

      // First Dor tier-1 talent is free
      if (id === freeDorTalentChosen) {
        continue;
      }

      spent += talent.cost;
    }
    return spent;
  }, [selectedTalents, freeAllomancyChosen, freeFeruchemyChosen, freeDorTalentChosen]);

  const remainingPoints = Math.max(0, totalPoints - spentPoints);

  // Confetti when all points are spent
  useEffect(() => {
    if (remainingPoints === 0 && totalPoints > 0 && spentPoints === totalPoints) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.15 },
        colors: ['#38bdf8', '#60a5fa', '#34d399', '#fbbf24'],
      });
    }
  }, [remainingPoints, totalPoints, spentPoints]);

  // Status resolver helper
  const getNodeStatus = useCallback(
    (talentId: string): NodeStatus => {
      return getTalentStatus(
        talentId,
        selectedTalents,
        firstIdealOrders,
        freeSurgesChosen,
        remainingPoints,
        freeAllomancyChosen,
        freeFeruchemyChosen,
        freeDorTalentChosen
      );
    },
    [
      selectedTalents,
      firstIdealOrders,
      freeSurgesChosen,
      remainingPoints,
      freeAllomancyChosen,
      freeFeruchemyChosen,
      freeDorTalentChosen,
    ]
  );

  // Check if a talent is a free grant
  const isFreeGrant = useCallback(
    (talentId: string): boolean => {
      const talent = TALENTS_BY_ID[talentId];
      if (!talent) return false;
      if (talent.code === 'free' && talent.category === 'radiant') return true;
      if (talent.specialty === 'Allomancy' && !freeAllomancyChosen) return true;
      if (talent.specialty === 'Feruchemy' && !freeFeruchemyChosen) return true;
      if (DOR_TIER1_IDS.includes(talentId) && !freeDorTalentChosen && selectedTalents.includes('dor_key')) return true;
      return false;
    },
    [freeAllomancyChosen, freeFeruchemyChosen, freeDorTalentChosen, selectedTalents]
  );

  // Handle learning / selecting a talent
  const handleSelectTalent = (talentId: string) => {
    setRefundWarning(null);
    const talent = TALENTS_BY_ID[talentId];
    if (!talent) return;

    const currentStatus = getNodeStatus(talentId);

    // If already acquired, open inspect view with option to refund
    if (currentStatus === 'acquired') {
      setInspectTalentId(talentId);
      return;
    }

    if (currentStatus !== 'available') {
      setInspectTalentId(talentId);
      return;
    }

    // Special flow: First Ideal needs order selection
    if (talentId === 'radiant_first_ideal') {
      setIsOrderModalOpen(true);
      return;
    }

    // Special flow: Second Order upgrade
    if (talentId === 'radiant_second_order') {
      setIsOrderModalOpen(true);
      return;
    }

    // Standard talent acquisition
    setSelectedTalents((prev) => [...prev, talentId]);
    setInspectTalentId(talentId);
  };

  // Order modal confirmation handler
  const handleSelectOrder = (orderId: string) => {
    const order = RADIANT_ORDERS.find((o) => o.id === orderId);
    if (!order) return;

    setFirstIdealOrders((prev) => [...prev, orderId]);

    // Gather the 2 free surge talents of that order
    const surgesToUnlock: string[] = [];
    for (const surgeName of order.surges) {
      const surgeTalent = ALL_TALENTS.find(
        (t) => t.specialty === surgeName && t.code === 'free'
      );
      if (surgeTalent && !selectedTalents.includes(surgeTalent.id)) {
        surgesToUnlock.push(surgeTalent.id);
      }
    }

    // If First Ideal is not yet selected, add it along with the free surges
    const toAdd = [...surgesToUnlock];
    if (!selectedTalents.includes('radiant_first_ideal')) {
      toAdd.push('radiant_first_ideal');
    } else if (!selectedTalents.includes('radiant_second_order')) {
      toAdd.push('radiant_second_order');
    }

    setSelectedTalents((prev) => Array.from(new Set([...prev, ...toAdd])));
    setIsOrderModalOpen(false);
  };

  // Handle refunding a talent
  const handleRefundTalent = (talentId: string) => {
    const { canRefund, blockingTalents } = canRefundTalent(
      talentId,
      selectedTalents,
      firstIdealOrders
    );

    if (!canRefund) {
      setRefundWarning(
        `No puedes devolver este talento porque otros talentos dependen de él: ${blockingTalents.join(
          ', '
        )}. Devuelve primero esos talentos.`
      );
      return;
    }

    // If refunding First Ideal, also clear radiant orders and free surges
    if (talentId === 'radiant_first_ideal') {
      setFirstIdealOrders([]);
      setSelectedTalents((prev) =>
        prev.filter((id) => id !== 'radiant_first_ideal' && id !== 'radiant_second_order' && !freeSurgesChosen.includes(id))
      );
      setInspectTalentId(null);
      setRefundWarning(null);
      return;
    }

    // If refunding Second Order
    if (talentId === 'radiant_second_order') {
      if (firstIdealOrders.length > 1) {
        const lastOrder = firstIdealOrders[firstIdealOrders.length - 1];
        const order = RADIANT_ORDERS.find((o) => o.id === lastOrder);
        const orderSurgeIds = order
          ? ALL_TALENTS.filter((t) => order.surges.includes(t.specialty || '') && t.code === 'free').map((t) => t.id)
          : [];
        setFirstIdealOrders((prev) => prev.slice(0, 1));
        setSelectedTalents((prev) =>
          prev.filter((id) => id !== 'radiant_second_order' && !orderSurgeIds.includes(id))
        );
      } else {
        setSelectedTalents((prev) => prev.filter((id) => id !== talentId));
      }
      setInspectTalentId(null);
      setRefundWarning(null);
      return;
    }

    setSelectedTalents((prev) => prev.filter((id) => id !== talentId));
    setRefundWarning(null);
  };

  // Reset all talents
  const handleReset = () => {
    setSelectedTalents([]);
    setFirstIdealOrders([]);
    setInspectTalentId(null);
    setRefundWarning(null);
    setIsResetConfirmOpen(false);
  };

  // Import JSON build
  const handleImportBuild = (data: any) => {
    if (data && Array.isArray(data.selectedTalents)) {
      if (typeof data.name === 'string') setCharacterName(data.name);
      if (typeof data.level === 'number') setLevel(data.level);
      setSelectedTalents(data.selectedTalents);
      if (Array.isArray(data.firstIdealOrders)) {
        setFirstIdealOrders(data.firstIdealOrders);
      }
      setIsSheetModalOpen(false);
    }
  };

  const activeInspectTalent = inspectTalentId
    ? TALENTS_BY_ID[inspectTalentId]
    : hoveredTalentId
    ? TALENTS_BY_ID[hoveredTalentId]
    : null;

  const handleSectionChange = (section: TreeSection) => {
    setActiveSection(section);
    setSelectedHeroicPath(null);
    setInspectTalentId(null);
    setHoveredTalentId(null);
    setSearchHighlightId(null);
  };

  const handleHeroicPathSelect = (pathName: string) => {
    setSelectedHeroicPath(pathName);
    setInspectTalentId(null);
    setHoveredTalentId(null);
    setSearchHighlightId(null);
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Header HUD */}
      <CharacterHeader
        name={characterName}
        onNameChange={setCharacterName}
        level={level}
        onLevelChange={setLevel}
        totalPoints={totalPoints}
        spentPoints={spentPoints}
        remainingPoints={remainingPoints}
        freeSurgesChosen={freeSurgesChosen}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onOpenSheet={() => setIsSheetModalOpen(true)}
        onReset={() => setIsResetConfirmOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onCenterView={() => handleSectionChange('heroic')}
      />

      {/* Main Interactive Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <PoEStyleTreeCanvas
          selectedTalents={selectedTalents}
          activeSection={activeSection}
          selectedHeroicPath={selectedHeroicPath}
          getNodeStatus={getNodeStatus}
          hoveredTalentId={hoveredTalentId}
          onHoverTalent={(id, pos) => {
            setHoveredTalentId(id);
            if (pos) setTooltipPos(pos);
          }}
          onSelectTalent={handleSelectTalent}
          searchHighlightId={searchHighlightId}
        />

        {activeSection === 'heroic' && !selectedHeroicPath && (
          <HeroicPathCarousel onSelectPath={handleHeroicPathSelect} />
        )}

        {/* Free Gifts Floating Reminder Banners */}
        {selectedTalents.includes('dor_key') && !freeDorTalentChosen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border border-amber-500/50 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md animate-bounce">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>¡Selish Connection te regala 1 talento de nivel 1 (1 o a) de The Dor! Haz clic en uno para reclamarlo gratis.</span>
          </div>
        )}

        {selectedTalents.includes('mistborn_key') && !freeAllomancyChosen && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border border-sky-500/50 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-sky-300 shadow-xl backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span>¡Snapping te otorga 1 habilidad de Alomancia gratuita! Elige cualquier metal alomántico sin gastar puntos.</span>
          </div>
        )}

        {selectedTalents.includes('feru_key') && !freeFeruchemyChosen && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>¡Gift of Terris te otorga 1 habilidad de Feruquimia gratuita! Elige cualquier metal feruquímico sin coste.</span>
          </div>
        )}

        {/* First Heroic Key Notice if no talents chosen */}
        {selectedTalents.length === 0 && (
          <div className="absolute top-4 left-4 z-20 max-w-sm rounded-xl border border-sky-500/40 bg-slate-900/90 p-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Info className="h-4 w-4" />
              <span>Primer Punto de Talento</span>
            </div>
            <p className="mt-1 text-slate-300 leading-relaxed">
              El primer punto de talento debe ser asignado obligatoriamente a uno de los <strong className="text-white">Key Talents</strong> de los Heroic Paths (resaltados en verde).
            </p>
          </div>
        )}

        {/* Hover / Inspector Tooltip Floating Panel */}
        {activeInspectTalent && (
          <div
            className="absolute top-4 right-4 z-30 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <TalentTooltip
              talent={activeInspectTalent}
              status={getNodeStatus(activeInspectTalent.id)}
              canAfford={remainingPoints >= activeInspectTalent.cost}
              isFreeGrant={isFreeGrant(activeInspectTalent.id)}
              refundWarning={refundWarning}
              onSelect={handleSelectTalent}
              onRefund={handleRefundTalent}
              onClose={() => setInspectTalentId(null)}
            />
          </div>
        )}
      </div>

      {/* Radiant Order Selection Modal */}
      <OrderSelectionModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSelectOrder={handleSelectOrder}
        alreadyChosenOrders={firstIdealOrders}
      />

      {/* Character Sheet & Download Modal */}
      <CharacterSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        characterName={characterName}
        level={level}
        totalPoints={totalPoints}
        spentPoints={spentPoints}
        remainingPoints={remainingPoints}
        selectedTalents={selectedTalents}
        firstIdealOrders={firstIdealOrders}
        onImportBuild={handleImportBuild}
      />

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTalent={(id) => {
          const talent = TALENTS_BY_ID[id];
          if (talent) {
            setActiveSection(talent.category === 'heroic' ? 'heroic' : 'investiture');
            setSelectedHeroicPath(talent.category === 'heroic' ? talent.pathName : null);
          }
          setSearchHighlightId(id);
          setInspectTalentId(id);
        }}
        getNodeStatus={getNodeStatus}
      />

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/80 border border-red-800 text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Reiniciar todos los talentos?</h3>
                <p className="text-xs text-slate-400">
                  Se devolverán todos tus puntos de talento gastados ({spentPoints} puntos).
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
