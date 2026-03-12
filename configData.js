// ============================================================
// configData.js — All fence/gate configuration options
// Extracted from legacy ultra_dsg_minbak.js
// ============================================================

export const COLORS = [
  { id: 0, name: 'Textured Khaki',   hex: '#cdbeaf', threeHex: 0xcdbeaf, metalness: 0.2, roughness: 0.4 },
  { id: 1, name: 'Gloss Bronze',     hex: '#42382c', threeHex: 0x42382c, metalness: 0.3, roughness: 0.1 },
  { id: 2, name: 'Textured Bronze',  hex: '#42382c', threeHex: 0x42382c, metalness: 0.3, roughness: 0.4 },
  { id: 3, name: 'Gloss White',      hex: '#f4f4f4', threeHex: 0xF8F5F6, metalness: 0.2, roughness: 0.2 },
  { id: 4, name: 'Textured White',   hex: '#f2f2f2', threeHex: 0xF8F5F6, metalness: 0.1, roughness: 0.2 },
  { id: 5, name: 'Gloss Black',      hex: '#090909', threeHex: 0x080808, metalness: 0.2, roughness: 0.2 },
  { id: 6, name: 'Textured Black',   hex: '#0c0c0c', threeHex: 0x0c0c0c, metalness: 0.2, roughness: 0.4 },
  { id: 7, name: 'Silver',           hex: '#c8c8c8', threeHex: 0xc8c8c8, metalness: 0.8, roughness: 0.2 },
];

export const HEIGHTS = [
  { id: '36', label: '36"' },
  { id: '48', label: '48"' },
  { id: '54', label: '54"' },
  { id: '60', label: '60"' },
  { id: '72', label: '72"' },
];

export const FENCE_STYLES = [
  {
    id: 'uaf_200', code: 'UAF-200', name: 'Horizon', subtitle: 'Flat Top',
    category: 'flat', series: '200', hasFinials: false,
    options: ['pcf','pcb','res','ufr','mdr','xlr','pup'],
    accessories: ['tcr','tbu','scr','bcr','bbu'],
    archStyle: 'f2', leafDefault: '2', postDefault: 'po14',
  },
  {
    id: 'uaf_201', code: 'UAF-201', name: 'Horizon Pro', subtitle: 'Flat Top · 1½" Spacing',
    category: 'flat', series: '201', hasFinials: false,
    options: ['pcf','pcb','res','ufr','mdr','xlr'],
    accessories: ['tcr','tbu','bcr','bbu'],
    archStyle: 'f2', leafDefault: '2', postDefault: 'po14',
  },
  {
    id: 'uaf_250', code: 'UAF-250', name: 'Vanguard', subtitle: 'Flat Top w/ Spears',
    category: 'flat', series: '250', hasFinials: true,
    options: ['pcf','pcb','fs','ft','fq','fp','res','ufr','mdr','xlr','pup'],
    accessories: ['scr','bcr','bbu'],
    archStyle: 'f2', leafDefault: '2', postDefault: 'po14',
  },
  {
    id: 'uab_200', code: 'UAB-200', name: 'Haven', subtitle: 'Flat Top Flush',
    category: 'flush', series: '200', hasFinials: false,
    options: ['pcf','pcb','res','ufr','mdr','xlr','pup'],
    accessories: ['scr','bcr','bbu'],
    archStyle: 'b2', leafDefault: '2', postDefault: 'po14',
  },
  {
    id: 'uas_100', code: 'UAS-100', name: 'Charleston', subtitle: 'Spear Top',
    category: 'spear', series: '100', hasFinials: true,
    options: ['pcf','pcb','fs','ft','fq','fp','res','ufr','mdr','xlr','pup'],
    accessories: ['tcr','tbu','scr','bcr','bbu'],
    archStyle: 's1', leafDefault: '1', postDefault: 'po14',
  },
  {
    id: 'uas_101', code: 'UAS-101', name: 'Charleston Pro', subtitle: 'Spear Top · 1½" Spacing',
    category: 'spear', series: '100', hasFinials: true,
    options: ['pcf','pcb','fs','ft','fq','fp','res','ufr','mdr','xlr'],
    accessories: ['tcr','tbu','bcr','bbu'],
    archStyle: 's1', leafDefault: '1', postDefault: 'po14',
  },
  {
    id: 'uas_150', code: 'UAS-150', name: 'Savannah', subtitle: 'Staggered Spear',
    category: 'spear', series: '100', hasFinials: true,
    options: ['pcf','pcb','fs','ft','fq','fp','res','ufr','mdr','xlr','pup'],
    accessories: ['tcr','tbu','scr','bcr','bbu'],
    archStyle: 's1', leafDefault: '1', postDefault: 'po14',
  },
];

export const POST_CAPS = [
  { id: 'pcf', name: 'Flat Cap', model: 'pcf' },
  { id: 'pcb', name: 'Ball Cap', model: 'pcb' },
];

export const FINIALS = [
  { id: 'fs', name: 'Spear',   model: 'fs' },
  { id: 'ft', name: 'Triangle', model: 'ft' },
  { id: 'fq', name: 'Quad',    model: 'fq' },
  { id: 'fp', name: 'Pyramid', model: 'fp' },
];

export const POSTS = [
  { id: 'po12', name: '1.25" Post' },
  { id: 'po14', name: '1.5" Post' },
  { id: 'po23', name: '2.5" Post' },
  { id: 'po40s', name: '4" Single Post' },
  { id: 'po40d', name: '4" Double Post' },
];

export const ARCH_STYLES = [
  { id: 'e', name: 'Estate' },
  { id: 'a', name: 'Arena' },
  { id: 'r', name: 'Royal' },
  { id: 's', name: 'Spanish' },
];

export const ACCESSORIES = {
  tcr: { name: 'Top Scroll', model: 'acs' },
  tbu: { name: 'Top Butterfly', model: 'acb' },
  scr: { name: 'Center Scroll', model: 'acc' },
  bcr: { name: 'Bottom Scroll', model: 'acs' },
  bbu: { name: 'Bottom Butterfly', model: 'acb' },
  pup: { name: 'Puppy Panel' },
  mdr: { name: 'Mid Rail' },
  ufr: { name: 'Upper Finial Rail' },
  xlr: { name: 'Extra Rail' },
  res: { name: 'Residential Spacing' },
};

// Option labels for the UI
export const OPTION_LABELS = {
  pcf: 'Flat Post Cap',
  pcb: 'Ball Post Cap',
  fs:  'Spear Finial',
  ft:  'Triangle Finial',
  fq:  'Quad Finial',
  fp:  'Pyramid Finial',
  res: 'Residential Spacing',
  ufr: 'Upper Finial Rail',
  mdr: 'Mid Rail',
  xlr: 'Extra Rail',
  pup: 'Puppy Panel',
};
