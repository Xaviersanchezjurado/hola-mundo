import { TalentNode, PathCategory, NodeStatus } from '../../types/talent';
import { HEROIC_TALENTS } from './heroicTalents';
import { RADIANT_TALENTS } from './radiantTalents';
import { METALLIC_TALENTS } from './metallicTalents';
import { AWAKENING_TALENTS } from './awakeningTalents';
import { SAND_TALENTS } from './sandTalents';
import { DOR_TALENTS } from './dorTalents';
import { RADIANT_ORDERS } from '../radiantOrders';

export const ALL_TALENTS: TalentNode[] = [
  ...HEROIC_TALENTS,
  ...RADIANT_TALENTS,
  ...METALLIC_TALENTS,
  ...AWAKENING_TALENTS,
  ...SAND_TALENTS,
  ...DOR_TALENTS,
];

export const TALENTS_BY_ID: Record<string, TalentNode> = ALL_TALENTS.reduce((acc, talent) => {
  acc[talent.id] = talent;
  return acc;
}, {} as Record<string, TalentNode>);

export const HEROIC_KEY_IDS = [
  'agent_key',
  'envoy_key',
  'hunter_key',
  'leader_key',
  'scholar_key',
  'warrior_key',
];

export const NON_HEROIC_KEY_IDS = [
  'radiant_first_ideal',
  'mistborn_key',
  'feru_key',
  'awakening_key',
  'sand_key',
  'dor_key',
];

export const ALLOMANCY_METAL_IDS = [
  'allo_lurcher', 'allo_coinshot', 'allo_tineye', 'allo_thug',
  'allo_rioter', 'allo_soother', 'allo_smoker', 'allo_seeker',
  'allo_augur', 'allo_oracle', 'allo_pulser', 'allo_slider',
  'allo_nicroburst', 'allo_leecher', 'allo_aluminum_gnat', 'allo_duralumin_gnat'
];

export const FERUCHEMY_METAL_IDS = [
  'feru_skimmer', 'feru_steelrunner', 'feru_windwhisperer', 'feru_brute',
  'feru_sparker', 'feru_firesoul', 'feru_archivist', 'feru_sentry',
  'feru_bloodmaker', 'feru_pinnacle', 'feru_gasper', 'feru_subsumer',
  'feru_soulbearer', 'feru_spinner', 'feru_trueself', 'feru_connector'
];

export const DOR_TIER1_IDS = [
  'dor_aon_1', 'dor_aon_a',
  'dor_dak_1', 'dor_dak_a',
  'dor_cha_1', 'dor_cha_a',
  'dor_for_1', 'dor_for_a',
  'dor_blo_1', 'dor_blo_a',
];

export interface ConnectionLink {
  fromId: string;
  toId: string;
}

// Build all connection lines across the tree
export function getTreeConnections(): ConnectionLink[] {
  const links: ConnectionLink[] = [];
  
  // Link each node to its explicit prerequisites
  for (const talent of ALL_TALENTS) {
    for (const prereqId of talent.prerequisites) {
      if (TALENTS_BY_ID[prereqId]) {
        links.push({ fromId: prereqId, toId: talent.id });
      }
    }
  }

  // Inter-path central links:
  // Connecting Heroic keys to form the central heroic ring
  for (let i = 0; i < HEROIC_KEY_IDS.length; i++) {
    const next = (i + 1) % HEROIC_KEY_IDS.length;
    links.push({ fromId: HEROIC_KEY_IDS[i], toId: HEROIC_KEY_IDS[next] });
  }

  // Connecting Heroic cluster to non-heroic path keys
  links.push({ fromId: 'warrior_key', toId: 'radiant_first_ideal' });
  links.push({ fromId: 'scholar_key', toId: 'radiant_first_ideal' });
  links.push({ fromId: 'warrior_key', toId: 'mistborn_key' });
  links.push({ fromId: 'leader_key', toId: 'feru_key' });
  links.push({ fromId: 'envoy_key', toId: 'awakening_key' });
  links.push({ fromId: 'agent_key', toId: 'sand_key' });
  links.push({ fromId: 'agent_key', toId: 'dor_key' });
  links.push({ fromId: 'hunter_key', toId: 'dor_key' });

  return links;
}

/**
 * Calculates current status for a given talent node
 */
export function getTalentStatus(
  talentId: string,
  selectedTalents: string[],
  firstIdealOrders: string[],
  freeSurgesChosen: string[],
  availablePoints: number,
  freeAllomancyChosen?: string,
  freeFeruchemyChosen?: string,
  freeDorTalentChosen?: string
): NodeStatus {
  if (selectedTalents.includes(talentId)) {
    return 'acquired';
  }

  const talent = TALENTS_BY_ID[talentId];
  if (!talent) return 'locked';

  const hasHeroicKey = HEROIC_KEY_IDS.some(id => selectedTalents.includes(id));

  // RULE 1: First point MUST be spent in one of the Heroic Key Talents
  if (!hasHeroicKey) {
    if (HEROIC_KEY_IDS.includes(talentId)) {
      return availablePoints >= 1 ? 'available' : 'locked';
    }
    return 'locked';
  }

  // HEROIC KEYS: Once at least one heroic key is unlocked, any other heroic key can be bought
  if (HEROIC_KEY_IDS.includes(talentId)) {
    return availablePoints >= 1 ? 'available' : 'locked';
  }

  // NON-HEROIC KEYS: Can be unlocked once at least 1 heroic key is chosen
  if (NON_HEROIC_KEY_IDS.includes(talentId)) {
    return availablePoints >= 1 ? 'available' : 'locked';
  }

  // SECOND ORDER UPGRADE
  if (talentId === 'radiant_second_order') {
    if (selectedTalents.includes('radiant_first_ideal') && firstIdealOrders.length >= 1 && firstIdealOrders.length < RADIANT_ORDERS.length) {
      return availablePoints >= 1 ? 'available' : 'locked';
    }
    return 'locked';
  }

  // RADIANT SURGE FREE TALENTS
  if (talent.code === 'free' && talent.category === 'radiant') {
    // Only available if an order grants it or through order selection
    if (freeSurgesChosen.includes(talentId)) {
      return 'available';
    }
    return 'locked';
  }

  // RADIANT ORDER BOND TALENTS (&)
  if (talent.orderSpecific) {
    const hasOrder = firstIdealOrders.some(
      orderId => RADIANT_ORDERS.find(o => o.id === orderId)?.name === talent.orderSpecific
    );
    if (!hasOrder) return 'locked';
    return availablePoints >= 1 ? 'available' : 'locked';
  }

  // METALLIC ARTS: ALLOMANCY (No order! Choose any!)
  if (talent.specialty === 'Allomancy') {
    if (!selectedTalents.includes('mistborn_key')) return 'locked';
    // If player hasn't claimed free allomancy yet, it is free! Otherwise cost 1 point
    const hasFreeSlot = !freeAllomancyChosen;
    if (hasFreeSlot || availablePoints >= 1) return 'available';
    return 'locked';
  }

  // METALLIC ARTS: FERUCHEMY (No order! Choose any!)
  if (talent.specialty === 'Feruchemy') {
    if (!selectedTalents.includes('feru_key')) return 'locked';
    const hasFreeSlot = !freeFeruchemyChosen;
    if (hasFreeSlot || availablePoints >= 1) return 'available';
    return 'locked';
  }

  // THE DOR: Tier-1 free talent exception
  if (DOR_TIER1_IDS.includes(talentId)) {
    if (!selectedTalents.includes('dor_key')) return 'locked';
    const hasFreeSlot = !freeDorTalentChosen;
    if (hasFreeSlot || availablePoints >= 1) return 'available';
    return 'locked';
  }

  // Standard prerequisite check
  if (talent.prerequisites.length === 0) {
    return availablePoints >= talent.cost ? 'available' : 'locked';
  }

  const prereqsMet = talent.prereqLogic === 'ANY'
    ? talent.prerequisites.some(p => selectedTalents.includes(p))
    : talent.prerequisites.every(p => selectedTalents.includes(p));

  if (!prereqsMet) return 'locked';

  return availablePoints >= talent.cost ? 'available' : 'locked';
}

/**
 * Check if a talent can be safely refunded (no other active talents depend on it)
 */
export function canRefundTalent(
  talentId: string,
  selectedTalents: string[],
  firstIdealOrders: string[]
): { canRefund: boolean; blockingTalents: string[] } {
  const blockingTalents: string[] = [];

  // If this is the last heroic key talent and user has any non-heroic talents
  if (HEROIC_KEY_IDS.includes(talentId)) {
    const remainingHeroicKeys = HEROIC_KEY_IDS.filter(
      id => id !== talentId && selectedTalents.includes(id)
    );
    if (remainingHeroicKeys.length === 0) {
      const nonHeroicSelected = selectedTalents.filter(
        id => !HEROIC_TALENTS.some(h => h.id === id)
      );
      if (nonHeroicSelected.length > 0) {
        return {
          canRefund: false,
          blockingTalents: nonHeroicSelected.slice(0, 3).map(id => TALENTS_BY_ID[id]?.name || id),
        };
      }
    }
  }

  // Check any selected talent that lists talentId as prerequisite
  for (const selectedId of selectedTalents) {
    if (selectedId === talentId) continue;
    const node = TALENTS_BY_ID[selectedId];
    if (node && node.prerequisites.includes(talentId)) {
      blockingTalents.push(node.name);
    }
  }

  // Check Radiant First Ideal dependencies
  if (talentId === 'radiant_first_ideal') {
    const radiantSelected = selectedTalents.filter(
      id => id !== 'radiant_first_ideal' && RADIANT_TALENTS.some(r => r.id === id)
    );
    if (radiantSelected.length > 0) {
      return {
        canRefund: false,
        blockingTalents: radiantSelected.slice(0, 3).map(id => TALENTS_BY_ID[id]?.name || id),
      };
    }
  }

  // Check Mistborn Snapping dependencies
  if (talentId === 'mistborn_key') {
    const mistbornSelected = selectedTalents.filter(
      id => id !== 'mistborn_key' && METALLIC_TALENTS.some(m => m.pathName === 'Mistborn' && m.id === id)
    );
    if (mistbornSelected.length > 0) {
      return {
        canRefund: false,
        blockingTalents: mistbornSelected.slice(0, 3).map(id => TALENTS_BY_ID[id]?.name || id),
      };
    }
  }

  // Check Feruchemist Gift of Terris dependencies
  if (talentId === 'feru_key') {
    const feruSelected = selectedTalents.filter(
      id => id !== 'feru_key' && METALLIC_TALENTS.some(m => m.pathName === 'Feruchemist' && m.id === id)
    );
    if (feruSelected.length > 0) {
      return {
        canRefund: false,
        blockingTalents: feruSelected.slice(0, 3).map(id => TALENTS_BY_ID[id]?.name || id),
      };
    }
  }

  // Check Dor Key dependencies
  if (talentId === 'dor_key') {
    const dorSelected = selectedTalents.filter(
      id => id !== 'dor_key' && DOR_TALENTS.some(d => d.id === id)
    );
    if (dorSelected.length > 0) {
      return {
        canRefund: false,
        blockingTalents: dorSelected.slice(0, 3).map(id => TALENTS_BY_ID[id]?.name || id),
      };
    }
  }

  return {
    canRefund: blockingTalents.length === 0,
    blockingTalents,
  };
}
