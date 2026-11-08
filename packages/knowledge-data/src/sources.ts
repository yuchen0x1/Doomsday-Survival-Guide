import type { SourceReference } from '@apocalypse/core';
import { src } from './helpers';

/**
 * 共享权威资料来源库。
 * 内容条目通过 source id 引用，保证来源可追溯、不重复造来源。
 */
export const SOURCES = {
  // —— 国际组织 / 政府机构 ——
  who_water: src('who_water', 'WHO《饮用水水质准则》应急供水章节', 'government', 'A', {
    url: 'https://www.who.int/publications/i/item/9789241549950',
    publisher: '世界卫生组织（WHO）',
  }),
  who_heat: src('who_heat', 'WHO 极端高温与健康指南', 'government', 'A', {
    url: 'https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health',
    publisher: '世界卫生组织（WHO）',
  }),
  who_firstaid: src('who_firstaid', 'WHO 急救培训教材', 'medical', 'A', {
    url: 'https://www.who.int/emergencies/emergency-response/first-aid',
    publisher: '世界卫生组织（WHO）',
  }),
  ifrc_firstaid: src('ifrc_firstaid', 'IFRC/红十字国际委员会急救参考', 'ngo', 'A', {
    url: 'https://www.ifrc.org/first-aid',
    publisher: '国际红十字与红新月运动',
  }),
  rc_firstaid: src('rc_firstaid', '中国红十字会应急救护培训教材', 'ngo', 'A', {
    url: 'https://www.redcross.org.cn/',
    publisher: '中国红十字会总会',
  }),
  aha_cpr: src('aha_cpr', 'AHA 心肺复苏与心血管急救指南（CPR & ECC Guidelines）', 'medical', 'A', {
    url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines',
    publisher: '美国心脏协会（AHA）',
    publishedAt: '2020',
  }),
  cdc: src('cdc', '美国疾病控制与预防中心（CDC）公共卫生资料', 'government', 'A', {
    url: 'https://www.cdc.gov/',
    publisher: 'CDC',
  }),
  usda_food: src('usda_food', 'USDA 食品安全与保质期资料（FoodSafety.gov）', 'government', 'A', {
    url: 'https://www.foodsafety.gov/',
    publisher: '美国农业部（USDA）',
  }),
  fda_meds: src('fda_meds', 'FDA 药品安全用药信息', 'government', 'A', {
    url: 'https://www.fda.gov/drugs',
    publisher: '美国食品药品监督管理局（FDA）',
  }),
  nws_weather: src('nws_weather', '美国国家气象局（NWS）恶劣天气指南', 'government', 'A', {
    url: 'https://www.weather.gov/',
    publisher: 'NWS',
  }),
  usgs_quake: src('usgs_quake', 'USGS 地震安全资料', 'government', 'A', {
    url: 'https://www.usgs.gov/programs/earthquake-hazards',
    publisher: '美国地质调查局（USGS）',
  }),
  fema: src('fema', 'FEMA 应急准备与灾害应对指南', 'government', 'A', {
    url: 'https://www.ready.gov/',
    publisher: '美国联邦紧急事务管理署（FEMA）',
  }),
  cma_weather: src('cma_weather', '中国气象局防灾减灾科普资料', 'government', 'A', {
    url: 'https://www.cma.gov.cn/',
    publisher: '中国气象局',
  }),
  mem_gov_cn: src('mem_gov_cn', '中华人民共和国应急管理部科普与避险指南', 'government', 'A', {
    url: 'https://www.mem.gov.cn/',
    publisher: '应急管理部',
  }),
  nhc: src('nhc', '国家卫生健康委急救与健康科普资料', 'government', 'A', {
    url: 'http://www.nhc.gov.cn/',
    publisher: '国家卫生健康委员会',
  }),
  china_meteorology_typhoon: src('cma_typhoon', '中国气象局台风与暴雨预警指南', 'government', 'A', {
    url: 'https://www.cma.gov.cn/',
    publisher: '中国气象局',
  }),

  // —— 学术 / 专业出版物 ——
  flora_china: src('flora_china', '《中国植物志》（Flora of China）', 'academic', 'A', {
    url: 'http://www.iplant.cn/',
    publisher: '中国科学院植物研究所',
  }),
  iucn: src('iucn', 'IUCN 红色名录物种资料', 'academic', 'A', {
    url: 'https://www.iucnredlist.org/',
    publisher: '世界自然保护联盟（IUCN）',
  }),
  field_guide_cn: src('field_guide_cn', '中国野生动物野外识别手册（专业图鉴）', 'academic', 'B', {
    publisher: '科学出版社等专业出版物',
  }),
  insect_fao: src('insect_fao', 'FAO 昆虫资源与风险资料', 'academic', 'B', {
    url: 'https://www.fao.org/',
    publisher: '联合国粮农组织（FAO）',
  }),
  wilderness_society: src('wilderness_society', '野外医学与求生专业文献（Wilderness Medical Society）', 'academic', 'A', {
    url: 'https://www.wildernessmedicalmedicine.org/',
    publisher: 'Wilderness Medical Society',
  }),
  survival_manual_military: src('survival_manual_military', '美军野外生存手册 FM 3-05.70（公开版）', 'manual', 'B', {
    url: 'https://www.fas.org/irp/dod/dir101/fm3_05-70.pdf',
    publisher: 'U.S. Department of Defense',
    publishedAt: '2006',
  }),
  who_traditional: src('who_traditional', 'WHO 传统药用植物评估资料', 'medical', 'B', {
    url: 'https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine',
    publisher: 'WHO',
  }),

  // —— 社区 / 待核实 ——
  community: src('community', '社区经验汇总（待进一步核实）', 'community', 'C', {
    verifiedAt: undefined,
    verifiedBy: undefined,
  }),
  pending_verification: src('pending_verification', '证据不足，待研究（仅作线索）', 'community', 'D', {
    verifiedAt: undefined,
    verifiedBy: undefined,
  }),
  ai_draft: src('ai_draft', 'AI 起草草稿（须人工审核）', 'ai_generated', 'D', {
    verifiedAt: undefined,
    verifiedBy: undefined,
  }),
} as const satisfies Record<string, SourceReference>;

export type SourceKey = keyof typeof SOURCES;

/** 按 key 取来源（可一次取多个） */
export function pick(...keys: SourceKey[]): SourceReference[] {
  return keys.map((k) => SOURCES[k]);
}
