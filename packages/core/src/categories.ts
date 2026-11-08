import type { KnowledgeCategory } from './types';

/** 19 个一级知识分类（Web/移动/桌面/API 共用） */
export const CATEGORIES: KnowledgeCategory[] = [
  { slug: 'basics', name: '基础生存', description: '生存优先级、基本原则与通用常识', icon: 'compass', parent: null, order: 1 },
  { slug: 'wilderness', name: '野外求生', description: '迷失、避险、方向判断与求生策略', icon: 'mountain', parent: null, order: 2 },
  { slug: 'plants', name: '植物图鉴', description: '可食用、药用、有毒与实用植物识别', icon: 'leaf', parent: null, order: 3 },
  { slug: 'animals', name: '动物图鉴', description: '野生动物识别、痕迹辨识与安全应对', icon: 'paw', parent: null, order: 4 },
  { slug: 'insects', name: '昆虫图鉴', description: '昆虫与节肢动物识别及风险', icon: 'bug', parent: null, order: 5 },
  { slug: 'medicines', name: '药物图鉴', description: '常见药物知识与安全使用要点', icon: 'pill', parent: null, order: 6 },
  { slug: 'first-aid', name: '急救知识', description: '创伤、烧伤、骨折、心肺复苏等急救指南', icon: 'firstaid', parent: null, order: 7 },
  { slug: 'tools', name: '生存工具', description: '刀具、绳索、导航与求生装备', icon: 'tool', parent: null, order: 8 },
  { slug: 'crafts', name: '制作工艺', description: '容器、绳索、庇护所等手工制作', icon: 'hammer', parent: null, order: 9 },
  { slug: 'food-preservation', name: '食物保存', description: '干燥、腌制、发酵与储存技术', icon: 'jar', parent: null, order: 10 },
  { slug: 'water', name: '水源处理', description: '找水、净化、消毒与储水', icon: 'droplet', parent: null, order: 11 },
  { slug: 'weather', name: '天气知识', description: '天气预判、恶劣天气应对', icon: 'cloud', parent: null, order: 12 },
  { slug: 'geology', name: '地质环境', description: '地形、地质灾害与地貌识别', icon: 'earth', parent: null, order: 13 },
  { slug: 'hazards', name: '危险识别', description: '动植物危险、环境危险与风险预判', icon: 'warning', parent: null, order: 14 },
  { slug: 'agriculture', name: '农业种植', description: '应急种植、育苗与收成保存', icon: 'sprout', parent: null, order: 15 },
  { slug: 'energy', name: '能源技术', description: '生火、发电、电池与能源管理', icon: 'bolt', parent: null, order: 16 },
  { slug: 'mechanics', name: '机械维修', description: '基础维修、故障排查与临时修复', icon: 'wrench', parent: null, order: 17 },
  { slug: 'psychology', name: '心理生存', description: '压力管理、决策与团队心理', icon: 'brain', parent: null, order: 18 },
  { slug: 'disasters', name: '灾害应对', description: '地震、洪水、台风等灾害避险', icon: 'shield', parent: null, order: 19 },
];

/** 技能教程二级分类 */
export const SKILL_CATEGORIES: KnowledgeCategory[] = [
  { slug: 'shelter', name: '临时住所', description: '庇护所搭建与选址', icon: 'tent', parent: 'crafts', order: 1 },
  { slug: 'warmth', name: '防雨与保暖', description: '防雨、保温与失温预防', icon: 'fire', parent: 'crafts', order: 2 },
  { slug: 'water-collect', name: '水源收集', description: '各类取水方法', icon: 'droplet', parent: 'crafts', order: 3 },
  { slug: 'water-treat', name: '水处理', description: '过滤、煮沸与消毒', icon: 'filter', parent: 'crafts', order: 4 },
  { slug: 'food-keep', name: '食物保存', description: '保存与加工技术', icon: 'jar', parent: 'crafts', order: 5 },
  { slug: 'knots', name: '绳索与结绳', description: '实用绳结打法', icon: 'knot', parent: 'crafts', order: 6 },
  { slug: 'basic-tools', name: '基础工具', description: '工具制作与使用', icon: 'tool', parent: 'crafts', order: 7 },
  { slug: 'containers', name: '简易容器', description: '容器制作与取水器具', icon: 'cup', parent: 'crafts', order: 8 },
  { slug: 'farming', name: '农业种植', description: '应急种植技术', icon: 'sprout', parent: 'crafts', order: 9 },
  { slug: 'power', name: '能源利用', description: '生火与简易发电', icon: 'bolt', parent: 'crafts', order: 10 },
  { slug: 'repair', name: '设备维修', description: '维修与临时修复', icon: 'wrench', parent: 'crafts', order: 11 },
  { slug: 'navigation', name: '野外方向判断', description: '导航与定位方法', icon: 'compass', parent: 'crafts', order: 12 },
];

export function getCategory(slug: string): KnowledgeCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug) ?? SKILL_CATEGORIES.find((c) => c.slug === slug);
}

export function getChildCategories(parent: string): KnowledgeCategory[] {
  return [...CATEGORIES, ...SKILL_CATEGORIES].filter((c) => c.parent === parent);
}

export const SUPPLY_CATEGORY_LABELS: Record<string, string> = {
  food: '食品',
  water: '饮用水',
  medical: '医疗用品',
  camping: '露营用品',
  lighting: '照明设备',
  communication: '通讯设备',
  tools: '工具',
  protection: '防护装备',
  energy: '能源设备',
  hygiene: '卫生用品',
  repair: '维修材料',
  agriculture: '农业用品',
};

export const PLANT_CATEGORY_LABELS: Record<string, string> = {
  edible: '可食用植物',
  medicinal: '药用植物',
  toxic: '有毒植物',
  irritant: '有刺激性植物',
  fiber: '可利用纤维植物',
  material: '可制作材料的植物',
  utility: '其他实用植物',
};

export const ANIMAL_CLASS_LABELS: Record<string, string> = {
  mammal: '哺乳动物',
  bird: '鸟类',
  reptile: '爬行动物',
  amphibian: '两栖动物',
  fish: '鱼类',
  insect: '昆虫',
  arthropod: '蜘蛛及节肢动物',
  dangerous: '危险动物',
};
