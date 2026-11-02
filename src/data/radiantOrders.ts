import { RadiantOrder } from '../types/talent';

export const RADIANT_ORDERS: RadiantOrder[] = [
  {
    id: 'windrunner',
    name: 'Windrunner',
    description: 'Windrunners are the scouts and special forces of the Knights Radiant. They wield the surges of Adhesion and Gravitation.',
    surges: ['Adhesion', 'Gravitation'],
    bondTalentId: 'bond_windrunner',
  },
  {
    id: 'skybreaker',
    name: 'Skybreaker',
    description: 'Skybreakers are justice incarnate, ensuring that power is never abused and that order never devolves into chaos. They wield the surges of Gravitation and Division.',
    surges: ['Gravitation', 'Division'],
    bondTalentId: 'bond_skybreaker',
  },
  {
    id: 'dustbringer',
    name: 'Dustbringer',
    description: 'Dustbringers enjoy engineering and taking things apart to learn how they work. They wield the surges of Division and Abrasion.',
    surges: ['Division', 'Abrasion'],
    bondTalentId: 'bond_dustbringer',
  },
  {
    id: 'edgedancer',
    name: 'Edgedancer',
    description: 'An Edgedancer’s core duty is to provide service and assistance to the common people. They wield the surges of Abrasion and Progression.',
    surges: ['Abrasion', 'Progression'],
    bondTalentId: 'bond_edgedancer',
  },
  {
    id: 'truthwatcher',
    name: 'Truthwatcher',
    description: 'The cosmere contains countless secrets and mysteries. Truthwatchers live to uncover and solve as many as possible, acting as the researchers and investigative reporters of the Knights Radiant. They wield the surges of Progression and Illumination.',
    surges: ['Progression', 'Illumination'],
    bondTalentId: 'bond_truthwatcher',
  },
  {
    id: 'lightweaver',
    name: 'Lightweaver',
    description: 'The Order of Lightweavers includes many painters, musicians, sculptors, thespians, and practitioners of similar arts. They wield the surges of Illumination and Transformation.',
    surges: ['Illumination', 'Transformation'],
    bondTalentId: 'bond_lightweaver',
  },
  {
    id: 'elsecaller',
    name: 'Elsecaller',
    description: 'Elsecallers have the strongest connection to the Cognitive Realm of all the Radiant Orders. They wield the surges of Transformation and Transportation.',
    surges: ['Transformation', 'Transportation'],
    bondTalentId: 'bond_elsecaller',
  },
  {
    id: 'willshaper',
    name: 'Willshaper',
    description: 'Willshapers embody freedom. This can be the freedom of liberating the captive, but also the freedom of choice and self-expression. They wield the surges of Transportation and Cohesion.',
    surges: ['Transportation', 'Cohesion'],
    bondTalentId: 'bond_willshaper',
  },
  {
    id: 'stoneward',
    name: 'Stoneward',
    description: 'The Order of Stonewards are the heavy infantry of the Knights Radiant, standing side by side with their allies as an unflinching vanguard. They wield the surges of Cohesion and Tension.',
    surges: ['Cohesion', 'Tension'],
    bondTalentId: 'bond_stoneward',
  },
  {
    id: 'bondsmith',
    name: 'Bondsmith',
    description: 'Bondsmiths are generally the heart and soul of the Radiants. They tend to attract the peacemakers of the world, those who want to bring people together rather than divide them. They wield the surges of Tension and Adhesion.',
    surges: ['Tension', 'Adhesion'],
    bondTalentId: 'bond_windrunner', // Bondsmiths wield Adhesion & Tension
  },
];
