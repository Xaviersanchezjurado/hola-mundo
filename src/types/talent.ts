export type PathCategory = 
  | 'heroic' 
  | 'radiant' 
  | 'metallic' 
  | 'awakening' 
  | 'sand' 
  | 'dor';

export type NodeStatus = 'acquired' | 'available' | 'locked';

export interface TalentNode {
  id: string;
  name: string;        // Exact display name with code (e.g. "1 Sure Outcome")
  shortName: string;   // Rect title label (e.g. "Sure Outcome")
  code?: string;       // "key", "1", "2", "3", "4", "a", "b", "c", "d", "&", "free"
  description: string; // Exact verbatim text from the PDF
  category: PathCategory;
  pathName: string;    // e.g. "Agent", "Knight Radiant", "Mistborn", "Feruchemist", "Awakener", "Sandmaster", "The Dor"
  specialty?: string;  // e.g. "Spy", "Thief", "Adhesion", "Allomancy", "Keeper", etc.
  isKeyTalent?: boolean;
  isFree?: boolean;    // Granted freely by game rules
  cost: number;        // 1 by default, 0 if free
  prerequisites: string[]; // List of talent IDs required
  prereqLogic?: 'ALL' | 'ANY'; // Default 'ALL'
  x: number;           // PoE tree coordinate X
  y: number;           // PoE tree coordinate Y
  orderSpecific?: string; // For radiant special bond talents (e.g. "Windrunner")
}

export interface RadiantOrder {
  id: string;
  name: string;
  description: string;
  surges: [string, string]; // e.g. ["Adhesion", "Gravitation"]
  bondTalentId: string;     // e.g. "bond_windrunner"
}

export interface CharacterState {
  name: string;
  level: number;
  selectedTalents: string[]; // Set of acquired talent IDs
  freeSurgesChosen: string[]; // Surge IDs unlocked freely via First Ideal orders
  firstIdealOrders: string[]; // Orders chosen for First Ideal
  freeAllomancyChosen?: string; // 1 free allomancy talent ID
  freeFeruchemyChosen?: string; // 1 free feruchemy talent ID
  freeDorTalentChosen?: string; // 1 free Dor level-1 talent ID
}
