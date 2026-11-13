import type { CalculatorDef, CalculatorResult } from './types';

/**
 * 生存计算器集合。
 * 每个计算器都带公式说明、单位、输入范围与计算依据（basis）。
 * 所有公式基于公开通用标准（WHO/红十字会/军用手册通行做法）。
 */

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const CALCULATORS: CalculatorDef[] = [
  {
    id: 'water-reserve',
    slug: 'water-reserve',
    name: '饮水储备计算',
    description: '按人数与天数计算最低饮用水储备量',
    formula: '总水量(L) = 人数 × 每人每日最低3L × 天数 × (1 + 冗余系数)',
    basis:
      'WHO 应急最低供水标准为每人每日 3 升（含饮用与基本卫生），考虑高温与体力消耗，建议预留 20% 冗余。',
    params: [
      {
        key: 'people',
        label: '人数',
        unit: '人',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 4,
        help: '需要供水的人数',
      },
      {
        key: 'days',
        label: '储备天数',
        unit: '天',
        min: 1,
        max: 180,
        step: 1,
        defaultValue: 3,
        help: '计划自持天数',
      },
      {
        key: 'redundancy',
        label: '冗余系数',
        unit: '',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.2,
        help: '高温/体力劳动时建议 0.2-0.5',
      },
    ],
    compute: (i) => {
      const total = i.people * 3 * i.days * (1 + i.redundancy);
      const drinking = i.people * 3 * i.days;
      const res: CalculatorResult[] = [
        { key: 'total', label: '最低总储水量', value: r2(total), unit: 'L' },
        { key: 'drinking', label: '其中纯饮用（3L/人/天）', value: r2(drinking), unit: 'L' },
        { key: 'bottles', label: '约合 550ml 瓶装水', value: Math.ceil(total / 0.55), unit: '瓶' },
      ];
      return res;
    },
  },
  {
    id: 'food-reserve',
    slug: 'food-reserve',
    name: '食物储备估算',
    description: '按人数与天数估算最低食物热量与重量',
    formula: '总热量(kcal) = 人数 × 每人每日2000kcal × 天数；总重量(kg) = 总热量 ÷ 3500(kcal/kg)',
    basis:
      '成年人维持生存的最低热量参考约 2000 kcal/日（轻体力）；应急食品热量密度按 3500 kcal/kg 估算（米面类干重）。',
    params: [
      {
        key: 'people',
        label: '人数',
        unit: '人',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 4,
        help: '',
      },
      {
        key: 'days',
        label: '储备天数',
        unit: '天',
        min: 1,
        max: 365,
        step: 1,
        defaultValue: 7,
        help: '',
      },
      {
        key: 'kcalPerDay',
        label: '每人每日热量',
        unit: 'kcal',
        min: 1200,
        max: 4000,
        step: 100,
        defaultValue: 2000,
        help: '避难/低活动量取 1500-2000',
      },
    ],
    compute: (i) => {
      const totalKcal = i.people * i.kcalPerDay * i.days;
      const dryKg = totalKcal / 3500;
      const riceKg = totalKcal / 3600; // 大米约 3600 kcal/kg
      return [
        { key: 'kcal', label: '总热量需求', value: Math.round(totalKcal), unit: 'kcal' },
        { key: 'dryWeight', label: '干粮类总重（按3500kcal/kg）', value: r2(dryKg), unit: 'kg' },
        { key: 'rice', label: '若全部以大米计', value: r2(riceKg), unit: 'kg' },
        { key: 'perDay', label: '每日每人大米', value: r2(i.kcalPerDay / 3600), unit: 'kg' },
      ];
    },
  },
  {
    id: 'people-supplies',
    slug: 'people-supplies',
    name: '人员物资需求',
    description: '估算基础生存物资（净水片、电池、急救包等）需求量',
    formula: '各类物资 = 人数 × 每人每日用量 × 天数（向上取整）',
    basis:
      '用量参考：净水片 1 片/人/天（1L）、厕纸与卫生用品按 2 单位/人/天、基础电池按 2 节/人/3天（照明）。',
    params: [
      {
        key: 'people',
        label: '人数',
        unit: '人',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 4,
        help: '',
      },
      {
        key: 'days',
        label: '天数',
        unit: '天',
        min: 1,
        max: 180,
        step: 1,
        defaultValue: 7,
        help: '',
      },
    ],
    compute: (i) => {
      const days = i.days,
        p = i.people;
      return [
        {
          key: 'purification',
          label: '净水片',
          value: Math.ceil(p * days),
          unit: '片',
          note: '1片/人/天 净化约1L',
        },
        {
          key: 'batteries',
          label: 'AA/AAA 电池',
          value: Math.ceil((p * days * 2) / 3),
          unit: '节',
          note: '2节/人/3天（照明估算）',
        },
        {
          key: 'toilet',
          label: '卫生纸',
          value: Math.ceil((p * days * 2) / 10),
          unit: '卷',
          note: '2单位/人/天，每卷约10单位',
        },
        {
          key: 'gauze',
          label: '医用纱布',
          value: Math.ceil(p * days * 0.5),
          unit: '片',
          note: '按每2天1片的处理余量',
        },
        {
          key: 'mask',
          label: '口罩',
          value: Math.ceil(p * days),
          unit: '个',
          note: '1个/人/天（粉尘/污染环境）',
        },
      ];
    },
  },
  {
    id: 'battery-life',
    slug: 'battery-life',
    name: '电池续航计算',
    description: '估算设备电池使用时长',
    formula: '续航(h) = 电池容量(mAh) × 0.85 ÷ 设备功耗(mA)',
    basis: '按 85% 有效放电率（考虑自放电与低温衰减）；低温环境续航会进一步下降 20-40%。',
    params: [
      {
        key: 'capacity',
        label: '电池容量',
        unit: 'mAh',
        min: 100,
        max: 100000,
        step: 100,
        defaultValue: 10000,
        help: '如充电宝 10000mAh',
      },
      {
        key: 'draw',
        label: '设备功耗',
        unit: 'mA',
        min: 1,
        max: 5000,
        step: 1,
        defaultValue: 500,
        help: '手机约 300-600mA，手电约 500-2000mA',
      },
      {
        key: 'tempFactor',
        label: '低温系数',
        unit: '',
        min: 0.4,
        max: 1,
        step: 0.05,
        defaultValue: 1,
        help: '0℃以下取 0.7-0.8，-10℃ 取 0.6',
      },
    ],
    compute: (i) => {
      const h = (i.capacity * 0.85 * i.tempFactor) / i.draw;
      return [
        { key: 'hours', label: '预计续航', value: r2(h), unit: 'h' },
        {
          key: 'charges',
          label: '可为 4000mAh 手机充电次数',
          value: r2((i.capacity * 0.85 * i.tempFactor) / 4000),
          unit: '次',
        },
      ];
    },
  },
  {
    id: 'energy-store',
    slug: 'energy-store',
    name: '能源储备计算',
    description: '估算太阳能板与蓄电池组合的储能需求',
    formula:
      '日发电量(Wh) = 板功率(W) × 峰值日照(h) × 0.7；所需电池(Wh) = 日耗电(Wh) × 自持天数 × 1.2',
    basis: '光伏系统综合效率按 70% 估算（温度、线损、MPPT 损耗）；电池留 20% 余量避免深度放电。',
    params: [
      {
        key: 'load',
        label: '日耗电',
        unit: 'Wh',
        min: 10,
        max: 5000,
        step: 10,
        defaultValue: 200,
        help: '如 LED 灯 20W×5h + 手机 15Wh',
      },
      {
        key: 'panel',
        label: '太阳能板功率',
        unit: 'W',
        min: 5,
        max: 1000,
        step: 5,
        defaultValue: 100,
        help: '',
      },
      {
        key: 'sun',
        label: '峰值日照',
        unit: 'h',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 4,
        help: '中国大部分地区 3-5h',
      },
      {
        key: 'autonomy',
        label: '自持天数',
        unit: '天',
        min: 1,
        max: 30,
        step: 1,
        defaultValue: 3,
        help: '连续阴雨天数',
      },
    ],
    compute: (i) => {
      const dailyGen = i.panel * i.sun * 0.7;
      const batteryNeeded = i.load * i.autonomy * 1.2;
      return [
        { key: 'gen', label: '日发电量', value: r2(dailyGen), unit: 'Wh' },
        { key: 'battery', label: '建议电池容量', value: r2(batteryNeeded), unit: 'Wh' },
        { key: 'batteryAh12', label: '12V 系统折合', value: r2(batteryNeeded / 12), unit: 'Ah' },
        {
          key: 'balance',
          label: dailyGen >= i.load ? '发电量覆盖日耗电' : '发电不足，需减少负载或增加板功率',
          value: r2(dailyGen - i.load),
          unit: 'Wh/日',
        },
      ];
    },
  },
  {
    id: 'expiry-manage',
    slug: 'expiry-manage',
    name: '食品有效期管理',
    description: '计算剩余保质期与过期风险',
    formula: '剩余天数 = 到期日 − 今天；风险 = 剩余天数 ÷ 总保质天数',
    basis: '剩余比例低于 20% 视为高消耗优先级（先进先出）；已过期立即标记不可食用。',
    params: [
      {
        key: 'total',
        label: '总保质期',
        unit: '天',
        min: 1,
        max: 3650,
        step: 1,
        defaultValue: 365,
        help: '',
      },
      {
        key: 'elapsed',
        label: '已存放',
        unit: '天',
        min: 0,
        max: 3650,
        step: 1,
        defaultValue: 300,
        help: '',
      },
    ],
    compute: (i) => {
      const remain = i.total - i.elapsed;
      const ratio = remain / i.total;
      return [
        {
          key: 'remain',
          label: '剩余天数',
          value: remain,
          unit: '天',
          note: remain <= 0 ? '已过期，禁止食用' : undefined,
        },
        {
          key: 'ratio',
          label: '剩余比例',
          value: r2(ratio * 100),
          unit: '%',
          note: ratio <= 0.2 ? '优先消耗（FIFO）' : ratio <= 0.5 ? '中期消耗' : '充足',
        },
        {
          key: 'weeklyUse',
          label: '若要求30天内消耗完，每日需消耗',
          value: r2(Math.max(0, remain) / 30),
          unit: '份/天',
        },
      ];
    },
  },
  {
    id: 'stock-consume',
    slug: 'stock-consume',
    name: '库存消耗计算',
    description: '估算现有库存可支撑天数',
    formula: '可支撑天数 = 当前库存 ÷ 每日消耗量；预计耗尽日 = 今天 + 可支撑天数',
    basis: '按当前平均消耗速率线性外推；紧急情况应优先计算饮用水与药品。',
    params: [
      {
        key: 'stock',
        label: '当前库存',
        unit: '单位',
        min: 0,
        max: 100000,
        step: 1,
        defaultValue: 30,
        help: '',
      },
      {
        key: 'daily',
        label: '每日消耗',
        unit: '单位/天',
        min: 0.1,
        max: 1000,
        step: 0.1,
        defaultValue: 1,
        help: '',
      },
      {
        key: 'people',
        label: '消耗人数',
        unit: '人',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 4,
        help: '若每日消耗为全家合计可填 1',
      },
    ],
    compute: (i) => {
      const days = i.daily > 0 ? i.stock / i.daily : Infinity;
      const perPerson = i.daily > 0 ? i.stock / (i.daily * i.people) : Infinity;
      return [
        {
          key: 'days',
          label: '可支撑天数',
          value: Number.isFinite(days) ? r2(days) : -1,
          unit: '天',
          note: Number.isFinite(days) ? undefined : '每日消耗为 0',
        },
        {
          key: 'perPerson',
          label: '折合每人天数',
          value: Number.isFinite(perPerson) ? r2(perPerson) : -1,
          unit: '天',
        },
        {
          key: 'refill',
          label: '达到 7 天安全线需补货',
          value: Math.max(0, r2(i.daily * 7 - i.stock)),
          unit: '单位',
        },
      ];
    },
  },
  {
    id: 'priority-calc',
    slug: 'priority-calc',
    name: '物资优先级计算',
    description: '根据生存需求打分，生成采购/携带优先级',
    formula: '优先级分 = 生命维持权重×4 + 缺货风险×3 + 无法替代性×2 − 重量惩罚',
    basis:
      '权重来自生存需求层次（水>食物>保暖>医疗>工具）；分值 ≥8 为 P1 必备，5-7 为 P2 重要，<5 为 P3 可选。',
    params: [
      {
        key: 'vital',
        label: '生命维持相关性',
        unit: '1-5',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 4,
        help: '水/食物/药品取 5',
      },
      {
        key: 'shortage',
        label: '缺货风险',
        unit: '1-5',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3,
        help: '灾后越难买到分越高',
      },
      {
        key: 'replaceability',
        label: '无法替代性',
        unit: '1-5',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3,
        help: '没有替代方案取 5',
      },
      {
        key: 'weight',
        label: '重量惩罚',
        unit: 'kg',
        min: 0,
        max: 50,
        step: 0.5,
        defaultValue: 2,
        help: '单件重量，越重惩罚越大',
      },
    ],
    compute: (i) => {
      const score = i.vital * 4 + i.shortage * 3 + i.replaceability * 2 - i.weight * 0.3;
      const s = r2(Math.max(0, Math.min(20, score)));
      return [
        { key: 'score', label: '优先级得分', value: s, unit: '分' },
        {
          key: 'grade',
          label: '优先级',
          value: s >= 8 ? 1 : s >= 5 ? 2 : 3,
          unit: 'P',
          note:
            s >= 8 ? 'P1 必备：立即准备' : s >= 5 ? 'P2 重要：尽快准备' : 'P3 可选：有条件再准备',
        },
      ];
    },
  },
];

export function getCalculator(slug: string): CalculatorDef | undefined {
  return CALCULATORS.find((c) => c.slug === slug || c.id === slug);
}
