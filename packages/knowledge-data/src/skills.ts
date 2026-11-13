import type { SurvivalSkill } from '@apocalypse/core';
import { meta } from './helpers';
import { pick } from './sources';

/** 生存技能与制作工坊教程 */
export const skills: SurvivalSkill[] = [
  /* ============ 临时住所 shelter ============ */
  {
    id: 'skill-shelter-ridge-tarp',
    categorySlug: 'shelter',
    title: '天幕脊线 A 型庇护所搭建',
    summary:
      '用一块防水布或塑料布沿绷紧的脊绳搭成 A 字形斜面，快速挡雨防风，是应急过夜最常用的临时住所。',
    coverImage: undefined,
    purpose: '在野外或受灾后快速建立可挡雨、可防风的过夜遮蔽空间。',
    scenarios: ['暴雨来临前需要临时过夜点', '灾害后房屋损毁需临时安置', '徒步途中突遇恶劣天气'],
    materials: ['防水布 / 天幕或大张厚塑料布', '约 6-8 米主绳（脊绳）', '地钉或削尖的短木桩'],
    tools: ['刀或剪刀（截绳、削桩）', '手套'],
    difficulty: 2,
    estimatedMinutes: 40,
    steps: [
      {
        index: 1,
        instruction:
          '选址：选择高于周边地面、无落石与枯枝悬挂的平坦处，避开河床、沟谷与低洼积水线。',
      },
      {
        index: 2,
        instruction:
          '拉脊绳：在两棵树或两根立柱之间绑一条绷紧的主绳，离地约 1.2-1.5 米，两端用双套结固定在树干或地钉上。',
      },
      {
        index: 3,
        instruction:
          '披覆防水布：将防水布搭在脊绳上，两侧均匀下垂，迎风侧坡面略短、背风侧略长，便于排水。',
      },
      {
        index: 4,
        instruction:
          '固定四角：四角用地钉或木桩以约 45 度角斜向拉紧钉入地面，绳结用张紧结，方便随时调整松紧。',
      },
      { index: 5, instruction: '开排水沟：在迎水面外侧挖一条浅沟，把雨水引向庇护所两侧流走。' },
      {
        index: 6,
        instruction: '检查加固：逐个拉扯固定点补打地钉，夜间下雨时再检查一次脊绳是否松动。',
        warning: '雷雨天气不要把庇护所扎在孤立高树下，也要避开树挂（枯死断枝）正下方。',
      },
    ],
    cautions: [
      '迎风面避开主导风向与雨水冲刷方向',
      '湿滑细绳不能承重做脊绳',
      '雷电天气远离孤立高树与空旷高地',
    ],
    failureReasons: [
      '脊绳未绷紧导致中间下垂积水',
      '地钉垂直打入，受力后被拔出',
      '排水沟方向挖反导致积水倒灌',
    ],
    safetyChecklist: [
      '确认头顶无枯枝、断枝悬挂',
      '确认扎营点不在河道、滑坡与落石路径上',
      '出口朝向便于快速撤离的一侧',
    ],
    alternatives: [
      '没有防水布时用大片树皮、厚塑料袋或车辆遮阳挡替代',
      '无立柱时用三角支架或倒伏树干撑起脊绳',
    ],
    tags: ['庇护所', '天幕', '防雨', '扎营'],
    relatedIds: ['skill-shelter-site-select', 'skill-knots-tautline', 'skill-warmth-rain-barrier'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'fema') }),
  },
  {
    id: 'skill-shelter-debris-hut',
    categorySlug: 'shelter',
    title: '碎屑保暖庇护所（Debris Hut）搭建',
    summary: '以木杆搭骨架、厚层树叶碎屑做保温层，依靠空气层保暖，适合寒冷环境单人过夜。',
    coverImage: undefined,
    purpose: '在缺少睡袋与帐篷的低温环境中，用自然材料建造可保暖过夜的单人庇护所。',
    scenarios: ['气温骤降、装备不足的野外过夜', '迷路后需要就地过夜等待救援', '冬季应急避险'],
    materials: [
      '长约 2-3 米的坚韧主杆 1 根',
      '大量干燥树叶、枯草、苔藓（体积约为庇护所体积的数倍）',
      '树枝与树皮若干',
    ],
    tools: ['刀（削木、截枝）', '手套（防划伤）'],
    difficulty: 3,
    estimatedMinutes: 90,
    steps: [
      {
        index: 1,
        instruction: '选址：挑干燥、避风、远离枯枝悬挂与落石的位置，地面先铺一层厚干树叶隔潮。',
      },
      {
        index: 2,
        instruction:
          '搭骨架：主杆一端架在矮树桩或横木上，另一端插入地面，形成脊梁，两侧斜靠短枝成肋骨状。',
      },
      {
        index: 3,
        instruction: '封外壳：从下往上层层叠放树枝，像铺瓦片一样让雨水顺流而下，不留裸露缝隙。',
      },
      {
        index: 4,
        instruction:
          '堆保温层：在骨架外堆积至少半米厚的干燥树叶与枯草，并用手压实外层，防止被风吹散。',
      },
      {
        index: 5,
        instruction:
          '做门与内衬：用捆扎的树叶堵住入口，只留一人爬入的洞口，内部再铺一层厚干树叶当褥子。',
      },
      {
        index: 6,
        instruction: '入睡检查：入睡前确认口鼻不被树叶堵住，入口方向背风，出口可快速推开。',
        warning: '不要用湿树叶做保温层，潮湿保温层会加速体温流失。',
      },
    ],
    cautions: [
      '结构承重有限，不要在顶部堆人或压重物',
      '入口保持通畅，防止夜间被落叶掩埋',
      '材料堆靠近火源是严禁的，庇护所内禁止明火',
    ],
    failureReasons: [
      '保温层厚度不足导致夜间失温',
      '骨架过矮压迫身体影响血液循环',
      '外壳未按瓦片式叠放导致漏雨',
    ],
    safetyChecklist: [
      '确认搭建点无倒伏树（风倒木）正对',
      '确认内部空气流通，不完全密闭',
      '确认可随时从入口撤离',
    ],
    alternatives: [
      '有睡袋时改搭更小的 A 型庇护所以减少散热',
      '可用防水布替代树枝外壳，大幅缩短工时',
    ],
    tags: ['庇护所', '保暖', '野外过夜', '失温预防'],
    relatedIds: [
      'skill-warmth-hypothermia',
      'skill-shelter-site-select',
      'skill-shelter-ridge-tarp',
    ],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({
      dangerLevel: 'L1',
      sources: pick('survival_manual_military', 'wilderness_society'),
    }),
  },
  {
    id: 'skill-shelter-site-select',
    categorySlug: 'shelter',
    title: '庇护所选址与风险排查',
    summary: '搭建前先排除洪水、落石、雷击、风倒木与动物路径等致命风险，选址错误比结构不牢更危险。',
    coverImage: undefined,
    purpose: '用一套固定检查流程挑出安全的扎营点，避免次生灾害造成伤亡。',
    scenarios: [
      '任何庇护所搭建前的必做步骤',
      '地震、洪水后的临时安置选点',
      '山地、河谷、林地过夜选址',
    ],
    materials: ['地图或手机离线地图（可选）', '手电或头灯（夜间选址）'],
    tools: ['无硬性要求', '登山杖或木棍（探路、打草惊蛇）'],
    difficulty: 2,
    estimatedMinutes: 20,
    steps: [
      {
        index: 1,
        instruction:
          '看水位：观察河床痕迹、漂浮物堆积线与新鲜冲刷痕，营地至少高出最近水体数米且不在行洪道上。',
      },
      {
        index: 2,
        instruction: '看头顶：抬头排查枯死断枝（树挂）、悬崖落石带与陡坡下方堆积区，一律避开。',
      },
      {
        index: 3,
        instruction: '看地形：不在孤立高处、山脊暴露点与枯树下扎营，防雷击与雷击引起的树木倒伏。',
      },
      {
        index: 4,
        instruction: '看地面：选择干燥、平坦、土质紧实处，避开蚁穴、兽径、粪便与低洼积水点。',
      },
      {
        index: 5,
        instruction: '看撤离：确认撤离路线畅通，夜间能见度低时仍可快速离开。',
        warning: '河谷、峡谷与峡谷底部在上游降雨时可能突发山洪，即使天气晴朗也要离开河道。',
      },
    ],
    cautions: [
      '不要紧贴陡壁与松散岩坡',
      '不要在变压器、电线杆、危墙与玻璃幕墙下方过夜',
      '雨季优先选择高处、硬质地面',
    ],
    failureReasons: [
      '只看风景不看水位痕迹导致半夜被淹',
      '忽略树挂导致断枝砸落',
      '扎在兽径上导致夜间动物侵扰',
    ],
    safetyChecklist: [
      '头顶无枯枝与落石风险',
      '脚下不在行洪道与滑坡体上',
      '远离电线杆、危墙等倒塌物',
    ],
    alternatives: [
      '无理想场地时优先选择既有建筑物的坚固内侧房间',
      '城市灾害场景改用应急避难场所指引牌',
    ],
    tags: ['选址', '风险排查', '扎营', '灾害避险'],
    relatedIds: ['skill-shelter-ridge-tarp', 'skill-shelter-debris-hut', 'skill-warmth-co-safety'],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({
      dangerLevel: 'L2',
      sources: pick('fema', 'mem_gov_cn', 'survival_manual_military'),
    }),
  },

  /* ============ 防雨与保暖 warmth ============ */
  {
    id: 'skill-warmth-hypothermia',
    categorySlug: 'warmth',
    title: '失温预防与现场复温处理',
    summary:
      '失温是户外与灾害环境中最常见的致命风险之一；核心是提前隔湿挡风、发现后温和复温并尽快求医。',
    coverImage: undefined,
    purpose: '识别失温征兆并采取安全的现场处置，防止轻度失温发展为重度危及生命。',
    scenarios: ['雨雪、大风中长时间暴露', '落水、出汗后衣物湿透', '受灾群众在无供暖环境中滞留'],
    materials: [
      '干燥衣物与保暖层',
      '急救毯（铝箔毯）',
      '热水（包装完好、可饮用）',
      '帽子、袜子等末梢保暖物品',
    ],
    tools: ['温度计（可选，用于监测）', '手表（记录观察时间）'],
    difficulty: 3,
    estimatedMinutes: 30,
    steps: [
      {
        index: 1,
        instruction:
          '识别：出现不受控制的寒战、手脚不灵活、说话含糊、反应变慢、步态不稳，即按失温处理。',
        warning:
          '不再寒战、意识混乱或昏迷提示重度失温，属医疗急症，立即呼叫 120 并持续保暖等待专业救援。',
      },
      { index: 2, instruction: '脱离环境：转移到背风、避雨处，脱掉湿冷衣物，换上干燥衣物。' },
      {
        index: 3,
        instruction: '隔绝散热：用急救毯包裹身体，再加盖衣物或睡袋，重点保暖头部、颈部与躯干。',
      },
      {
        index: 4,
        instruction:
          '温和复温：意识清醒者可饮用温热（不烫）的甜饮料，用躯干接触热源（如他人体温、暖水袋隔布）。',
        warning: '禁止用力搓揉四肢、禁止高温烘烤或直接贴热水袋，以免血压骤降或烫伤。',
      },
      {
        index: 5,
        instruction: '持续监测：每 10 分钟观察意识、呼吸与寒战变化，记录时间并交接给急救人员。',
      },
    ],
    cautions: [
      '意识不清者不得喂水喂食，防止误吸',
      '复温过程动作要轻柔，避免突然改变体位',
      '落水者打捞上岸后仍需按失温处置，不能只换衣服',
    ],
    failureReasons: [
      '只换外衣不换贴身湿衣',
      '用酒精搓身或热水浸泡导致意外',
      '症状缓解后立即继续活动导致复发',
    ],
    safetyChecklist: [
      '现场无二次风险（如仍在水中、风口）',
      '已呼叫专业救援并保留保温材料',
      '伤员无意识时气道通畅',
    ],
    alternatives: [
      '无急救毯时用塑料袋、雨衣或铝箔餐垫替代',
      '无热水时用体温复温（隔衣拥抱）并持续观察',
    ],
    tags: ['失温', '保暖', '急救', '雨天'],
    relatedIds: ['skill-shelter-debris-hut', 'skill-warmth-rain-barrier', 'skill-warmth-co-safety'],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({
      dangerLevel: 'L2',
      sources: pick('wilderness_society', 'who_firstaid', 'rc_firstaid'),
    }),
  },
  {
    id: 'skill-warmth-rain-barrier',
    categorySlug: 'warmth',
    title: '防雨与隔潮层制作',
    summary:
      '用雨披、塑料布与地布把雨水和地面湿气隔绝在外，是低成本保命的保暖措施，比增加衣物更关键。',
    coverImage: undefined,
    purpose: '在无干燥衣物补充的条件下，建立外层防雨、底层隔潮的双层防护。',
    scenarios: ['持续降雨中行进或停留', '宿营时地面潮湿、无法找到干柴', '灾后安置点地面渗水'],
    materials: [
      '雨披或大张塑料布',
      '防潮垫、泡沫垫或厚塑料布（地布）',
      '备用塑料袋 2-3 个（装湿衣、套脚）',
    ],
    tools: ['绳索或扎带（固定）', '刀（裁剪）'],
    difficulty: 2,
    estimatedMinutes: 45,
    steps: [
      { index: 1, instruction: '先铺地布：地布面积比身体投影大一圈，四角压牢，隔绝地面传导散热。' },
      {
        index: 2,
        instruction: '再穿外层：雨披外层完全遮住肩与大腿，袖口、下摆用绳收紧，避免雨水灌入内层。',
      },
      {
        index: 3,
        instruction: '分层穿衣：内层排汗、中层保暖、外层防雨，湿透的内层及时脱下装入塑料袋。',
      },
      { index: 4, instruction: '保护末梢：手脚套塑料袋再穿鞋袜，头部戴帽，减少头部与四肢散热。' },
      {
        index: 5,
        instruction: '搭建干燥角：庇护所内单独留一块干燥区存放干衣物与睡袋，湿物只放入口处。',
        warning: '塑料布不可完全包裹口鼻，保持面部露出，防止闷汗与窒息。',
      },
    ],
    cautions: [
      '湿衣物绝不放在睡袋内侧',
      '地布边缘要低于身体，避免形成集水凹槽',
      '雨披内避免剧烈运动产生的汗汽积聚',
    ],
    failureReasons: [
      '只穿雨衣不隔地面潮气',
      '内层棉质衣物湿透未更换导致持续散热',
      '地布铺在低洼处形成水袋',
    ],
    safetyChecklist: [
      '面部始终露出，可正常呼吸',
      '行动时视野不受雨披遮挡',
      '不使用不透气材料完全密封身体',
    ],
    alternatives: ['无雨披时用大号垃圾袋开洞套头', '无地布时用干燥树叶、纸板、泡沫箱隔潮'],
    tags: ['防雨', '隔潮', '保暖', '装备制作'],
    relatedIds: [
      'skill-warmth-hypothermia',
      'skill-shelter-ridge-tarp',
      'skill-containers-store-water',
    ],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'fema') }),
  },
  {
    id: 'skill-warmth-co-safety',
    categorySlug: 'warmth',
    title: '取暖防火与一氧化碳中毒预防',
    summary:
      '密闭空间使用明火取暖是冬季灾害中最常见的伤亡原因之一。本教程只讲安全识别与应急处置，不涉及任何自行改装燃烧设备的操作。',
    coverImage: undefined,
    purpose: '识别一氧化碳与火灾风险，掌握报警、通风、撤离与求助的正确顺序。',
    scenarios: [
      '停电后使用炭火、燃气、发电机取暖',
      '帐篷、板房、地下室等密闭空间滞留',
      '冬季灾后临时安置点',
    ],
    materials: ['一氧化碳报警器（若已有）', '湿毛巾（捂住口鼻撤离时用，不作为防护设备）'],
    tools: ['无（本教程不涉及设备拆装）'],
    difficulty: 2,
    estimatedMinutes: 15,
    steps: [
      {
        index: 1,
        instruction: '事前预防：使用任何燃烧设备取暖前，确认室内有持续通风口，门窗不被完全封死。',
      },
      {
        index: 2,
        instruction: '安装报警：在睡眠区域附近安装一氧化碳报警器并测试按键，电池不足立即更换。',
      },
      {
        index: 3,
        instruction:
          '识别中毒信号：同处多人同时出现头痛、头晕、恶心、乏力、意识模糊，应立即怀疑一氧化碳中毒。',
        warning: '一氧化碳无色无味，出现症状时往往已经中毒，不要等到闻到气味。',
      },
      {
        index: 4,
        instruction:
          '应急处置：立即开窗开门通风，关闭燃烧设备（能安全关闭时），所有人迅速撤离到空气新鲜处。',
      },
      {
        index: 5,
        instruction:
          '求助：撤离后拨打 119 / 120 说明可能的一氧化碳中毒，出现昏迷者由专业人员施救，禁止返回现场。',
      },
      {
        index: 6,
        instruction:
          '事后处理：设备必须由专业人员检查合格后才能重新使用，禁止自行拆修或改装燃烧设备。',
      },
    ],
    cautions: [
      '不在密闭空间使用炭火、燃气炉、汽油发电机取暖',
      '不自行改装、维修燃烧设备与烟囱',
      '火源周围清除可燃物，离开前彻底灭火并确认无复燃',
    ],
    failureReasons: [
      '为保暖封闭门窗导致氧气不足与一氧化碳积聚',
      '把"没有气味"当作安全',
      '中毒者被救出后未送医，出现迟发脑病',
    ],
    safetyChecklist: ['通风口未被遮挡', '报警器工作正常', '撤离路线畅通、钥匙在手'],
    alternatives: [
      '优先使用电力取暖并注意负荷，断电时使用官方指定的应急取暖方式',
      '无报警器时出现群体头痛应立即按中毒处置撤离',
    ],
    tags: ['一氧化碳', '取暖安全', '火灾预防', '中毒'],
    relatedIds: ['skill-power-fire-safety', 'skill-shelter-site-select', 'skill-repair-electrical'],
    verification: 'verified',
    dangerLevel: 'L3',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L3', sources: pick('cdc', 'fema', 'mem_gov_cn') }),
  },

  /* ============ 水源收集 water-collect ============ */
  {
    id: 'skill-water-collect-rain',
    categorySlug: 'water-collect',
    title: '雨水收集与导流',
    summary:
      '用防水布、容器与导流槽收集雨水，是灾后与野外最可靠的取水方式，需注意初期雨水的表面冲洗。',
    coverImage: undefined,
    purpose: '在无自来水与洁净水源时，依靠降水获得可后续处理的原水。',
    scenarios: ['地震、洪灾后供水中断', '野外长期停留缺少水源', '屋顶与帐篷积水排空'],
    materials: ['大张防水布或塑料布', '干净容器（水桶、锅、塑料袋）', '绳索或扎带'],
    tools: ['刀（裁剪、开导流口）', '支架或石块（撑出集水坡面）'],
    difficulty: 1,
    estimatedMinutes: 30,
    steps: [
      { index: 1, instruction: '撑布集水：把防水布绷成中间低、四周高的漏斗形，最低点对准容器口。' },
      {
        index: 2,
        instruction:
          '冲洗表面：降雨开始的前几分钟先让水流走，冲掉布面与屋顶的灰尘杂物后再接入容器。',
        warning: '来自屋顶的雨水可能含石棉、涂料与鸟粪污染物，收集后必须经过消毒处理才能饮用。',
      },
      {
        index: 3,
        instruction: '加固防风：四角拉绳固定，风大时在布面上压软物配重，防止布面翻覆污染水源。',
      },
      { index: 4, instruction: '覆盖容器：收集过程中容器口保持半遮盖，减少灰尘、蚊虫与落叶落入。' },
      {
        index: 5,
        instruction: '转存密封：接满后立刻倒入带盖容器密封，标注收集时间，交给后续水处理流程。',
      },
    ],
    cautions: [
      '集水布使用前先擦拭干净',
      '不要用曾装过化学品、油漆的容器',
      '容器远离垃圾、粪便与污水',
    ],
    failureReasons: ['布面下凹形成积水袋滋生蚊虫', '接取初期雨水未冲洗', '容器敞口落入杂物与虫卵'],
    safetyChecklist: ['集水点上方无电线与危墙', '容器稳固不会倾倒', '收集的水一律按待处理水对待'],
    alternatives: [
      '无防水布时用雨衣、车顶篷布或塑料袋',
      '无降水时改用凝结取水法（见凝结取水教程）',
    ],
    tags: ['取水', '雨水', '应急供水'],
    relatedIds: [
      'skill-water-treat-boil',
      'skill-water-collect-dew',
      'skill-containers-store-water',
    ],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('who_water', 'fema') }),
  },
  {
    id: 'skill-water-collect-dew',
    categorySlug: 'water-collect',
    title: '晨露与凝结取水',
    summary: '在没有降水时，利用清晨露水与塑料袋套枝的蒸腾凝结收集少量饮用水，属于辅助性取水手段。',
    coverImage: undefined,
    purpose: '在缺水环境中补充少量水分，维持等待救援期间的基本需求。',
    scenarios: ['干旱、无地表水的林地与草地', '迷路后等待救援的夜间与清晨', '容器与燃料都有限时'],
    materials: ['吸水布条或干净棉布', '透明大塑料袋', '广口容器或竹筒'],
    tools: ['绳（用于绑袋口）', '刀（割取导流草茎）'],
    difficulty: 2,
    estimatedMinutes: 40,
    steps: [
      { index: 1, instruction: '收集露水：日出前用吸水布在长草、灌丛上拖抹吸附露水，再拧入容器。' },
      {
        index: 2,
        instruction:
          '植物套袋：把透明塑料袋套在向阳枝叶茂密的枝条上，袋口扎紧，靠日晒蒸腾在袋内凝结水珠。',
      },
      { index: 3, instruction: '集水导流：把袋角或草茎尖端作为最低点，让凝结水沿壁流入容器。' },
      { index: 4, instruction: '转移保存：收集到的水立即倒入带盖容器，避免蒸发与污染。' },
      {
        index: 5,
        instruction: '评估产量：单次收集量通常很少，只作为补充，仍需优先寻找与处理常规水源。',
        warning: '所收集的水未经消毒处理，仍需煮沸或消毒后才能饮用；有毒植物附近的凝结水不得收集。',
      },
    ],
    cautions: [
      '避开有毒、喷洒过农药的植物',
      '塑料袋要干净，避免装过化学品',
      '清晨低温作业注意保暖，防止失温',
    ],
    failureReasons: [
      '在干燥晴朗白天套袋，产水量极低',
      '袋口未扎紧导致水汽逸出',
      '水源点选在污染源下风向',
    ],
    safetyChecklist: ['植物可识别且无毒', '作业点不在悬崖边与陡坡', '结伴作业并告知他人位置'],
    alternatives: [
      '有容器与阳光时用黑色塑料袋造水（被动太阳能蒸馏）',
      '优先向专业救援队报告缺水情况',
    ],
    tags: ['取水', '露水', '凝结', '野外求生'],
    relatedIds: [
      'skill-water-collect-rain',
      'skill-water-treat-boil',
      'skill-water-treat-diy-filter',
    ],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L2', sources: pick('survival_manual_military', 'who_water') }),
  },

  /* ============ 水处理 water-treat ============ */
  {
    id: 'skill-water-treat-boil',
    categorySlug: 'water-treat',
    title: '煮沸消毒饮用水',
    summary:
      '持续煮沸是最可靠的应急灭菌方法，可杀灭绝大多数细菌、病毒与原生动物包囊，只需火源与容器。',
    coverImage: undefined,
    purpose: '把收集到的原水转化为可安全饮用的水。',
    scenarios: ['获得河水、雨水、井水等原水', '灾后供水污染', '婴幼儿与免疫力低下者的饮水保障'],
    materials: ['待处理原水', '干净有盖的锅或金属容器', '燃料（柴、气罐、酒精炉等）'],
    tools: ['点火工具', '隔热手套或布（防烫）'],
    difficulty: 1,
    estimatedMinutes: 20,
    steps: [
      {
        index: 1,
        instruction: '预处理：先用纱布或干净布过滤掉可见的泥沙与悬浮物，缩短煮沸时间并改善口感。',
      },
      { index: 2, instruction: '加热至沸腾：加盖加热，减少热量散失与再次污染。' },
      {
        index: 3,
        instruction: '保持沸腾：水沸腾后继续保持 1 分钟以上；海拔超过 2000 米时煮沸约 3 分钟。',
      },
      {
        index: 4,
        instruction: '自然冷却：在清洁环境下自然冷却，冷却过程保持加盖，避免手伸入水中。',
        warning: '不要用嘴吹、不要用未消毒的器具搅拌；冷却后仍需密闭存放。',
      },
      { index: 5, instruction: '储存：倒入带盖的清洁容器，标注处理时间，取用时用干净器具舀取。' },
    ],
    cautions: [
      '金属容器手柄可能很烫，务必隔热操作',
      '煮沸无法去除化学污染物与重金属，水源有化学品污染时应另寻水源',
      '不要长时间敞口存放导致二次污染',
    ],
    failureReasons: [
      '只加热到冒热气未真正沸腾',
      '海拔较高仍按平原时间煮沸',
      '处理后倒入未消毒的容器造成二次污染',
    ],
    safetyChecklist: [
      '火源周围无可燃物，操作点通风',
      '容器放置稳固不会被打翻',
      '儿童与无关人员远离热源',
    ],
    alternatives: ['无燃料时使用商业消毒片或便携滤水器', '有电力时用电热壶煮沸同样有效'],
    tags: ['水处理', '煮沸', '消毒', '饮水安全'],
    relatedIds: [
      'skill-water-treat-diy-filter',
      'skill-water-collect-rain',
      'skill-power-fire-safety',
    ],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L2', sources: pick('who_water', 'cdc', 'nhc') }),
  },
  {
    id: 'skill-water-treat-diy-filter',
    categorySlug: 'water-treat',
    title: '简易多层过滤与后续消毒',
    summary:
      '用沙、木炭、碎石做成分层滤柱可去除大部分浑浊与颗粒，但过滤本身不能保证生物安全，必须再消毒。',
    coverImage: undefined,
    purpose: '在没有商用滤水器时降低原水浊度，并为后续消毒创造条件。',
    scenarios: ['河水、池塘水浑浊多泥沙', '缺少滤芯与净水片', '需要处理较大量原水'],
    materials: ['塑料瓶或竹筒（作滤筒）', '干净细沙、小卵石、木炭（烧透后敲碎）', '棉布或干净布片'],
    tools: ['刀（给瓶底开孔）', '容器（接滤后水）'],
    difficulty: 3,
    estimatedMinutes: 60,
    steps: [
      { index: 1, instruction: '制作滤筒：去掉塑料瓶底，瓶口朝下，垫一层棉布防止滤料漏出。' },
      {
        index: 2,
        instruction: '分层装填：自下而上依次铺木炭层、细沙层、小卵石层，每层压实且厚度均匀。',
      },
      {
        index: 3,
        instruction: '初次冲洗：先倒入少量清水冲掉炭粉与细沙，倒掉冲洗液，直到滤出水明显变清。',
      },
      {
        index: 4,
        instruction: '过滤：缓慢倒入原水，接住滤出水；水流过快会降低效果，必要时重复过滤一次。',
        warning: '过滤只改善清澈度，滤后水仍可能含致病菌与病毒，禁止直接饮用。',
      },
      { index: 5, instruction: '消毒：滤后水必须再经煮沸或按说明使用消毒片处理，然后密闭储存。' },
      { index: 6, instruction: '维护：每次使用后倒空滤筒、晾干滤料，木炭与沙受污染后应更换。' },
    ],
    cautions: [
      '木炭必须来自完全燃烧后的洁净木炭，不可用含油漆、塑料燃烧残留物',
      '滤筒与接水容器保持清洁，避免手触内壁',
      '水源受化学品污染时过滤无效，应弃用该水源',
    ],
    failureReasons: [
      '滤层顺序装反或压得太实导致不透水',
      '流速过快未起过滤作用',
      '滤后未消毒直接饮用',
    ],
    safetyChecklist: ['操作后洗手，容器清洁', '接水容器专用且带盖', '处理过的水与原水分开存放'],
    alternatives: ['使用商用便携滤水器或净水吸管', '浊度很低的水可直接进入煮沸流程'],
    tags: ['水处理', '过滤', '净水', '自制装备'],
    relatedIds: [
      'skill-water-treat-boil',
      'skill-water-collect-rain',
      'skill-containers-store-water',
    ],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L2', sources: pick('who_water', 'cdc') }),
  },

  /* ============ 食物保存 food-keep ============ */
  {
    id: 'skill-food-keep-sun-dry',
    categorySlug: 'food-keep',
    title: '日晒风干食物制作',
    summary:
      '通过降低水分活度抑制微生物生长，是最古老可靠的食物保存法之一，适合蔬果、肉类与主食的长期存放。',
    coverImage: undefined,
    purpose: '把易腐食材加工成可常温存放数周至数月的干制食品。',
    scenarios: ['丰收后短期内无法吃完', '停电冰箱失效需转移食材', '长途行进需要轻便口粮'],
    materials: ['待处理食材', '竹席、纱网或干净托盘', '盐（用于肉类预处理，可选）'],
    tools: ['刀（切片）', '绳（悬挂）', '食品级纱网（防蝇）'],
    difficulty: 2,
    estimatedMinutes: 360,
    steps: [
      { index: 1, instruction: '预处理：食材洗净，切成厚度均匀的薄片或细条，表面积越大越易干燥。' },
      { index: 2, instruction: '防蝇防尘：整个干燥过程用纱网完全罩住，绝不裸露摆放。' },
      {
        index: 3,
        instruction: '摊晒：置于通风、阳光充足且离地的架子上，避免地面虫爬与扬尘，每隔几小时翻面。',
      },
      {
        index: 4,
        instruction: '判断干燥：肉干按压无湿润感、掰断干脆；果干柔软但不粘手、捏不出水分。',
        warning: '出现拉丝、发黏、酸败味或霉点的成品一律丢弃，不要切除霉变部分后继续食用。',
      },
      { index: 5, instruction: '回潮检查：完全冷却后再装袋，密封前确认容器与食材都已彻底干燥。' },
      { index: 6, instruction: '存放：装入密封袋或玻璃罐，置于阴凉干燥处，定期检查受潮与虫害。' },
    ],
    cautions: [
      '肉类干燥不充分易滋生肉毒杆菌，宁可延长干燥时间或改为冷藏',
      '阴雨天不要强行摊晒，可改用通风阴干或烟熏',
      '干燥场地远离车辆尾气与扬尘',
    ],
    failureReasons: [
      '切片厚薄不均导致外干内湿',
      '未防蝇导致虫卵污染',
      '未冷却就密封产生冷凝水回潮',
    ],
    safetyChecklist: ['食材新鲜、无腐败异味', '晒场防蝇防尘', '成品密封前完全干燥'],
    alternatives: ['有电时用食品烘干机或烤箱低温烘干', '大批量处理可结合盐腌或烟熏'],
    tags: ['食物保存', '风干', '脱水', '储备'],
    relatedIds: [
      'skill-food-keep-salt-cure',
      'skill-food-keep-smoke',
      'skill-containers-store-water',
    ],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('usda_food', 'fema') }),
  },
  {
    id: 'skill-food-keep-salt-cure',
    categorySlug: 'food-keep',
    title: '盐腌保存食物',
    summary: '用高浓度盐析出水分、抑制腐败菌生长，可保存肉类与蔬菜；需严格控制盐量与卫生条件。',
    coverImage: undefined,
    purpose: '在缺少冷藏条件时延长肉类与蔬菜的可食用期。',
    scenarios: ['停电导致冷藏失效', '渔获、肉类短期内无法消耗', '需要储备可长期存放的应急食品'],
    materials: ['食用盐（粗盐或细盐）', '待腌食材', '清洁的非金属容器（陶瓷、玻璃、食品级塑料）'],
    tools: ['刀（分割）', '称或比例参考（按重量估算）', '干净压重石或密封盖'],
    difficulty: 3,
    estimatedMinutes: 120,
    steps: [
      {
        index: 1,
        instruction: '分切与清洁：食材洗净并擦干水分，切成大小均匀的块，操作前彻底洗手与器具。',
      },
      {
        index: 2,
        instruction:
          '干腌或湿腌：干腌将盐均匀涂抹食材表面并层层叠放；湿腌用煮沸冷却后的盐水完全浸没食材。',
        warning: '容器、手与器具不洁是盐腌失败与食物中毒的主要原因，全程保持清洁。',
      },
      {
        index: 3,
        instruction: '压实与密封：食材完全浸没在盐水下，用干净重物压住，容器加盖置于阴凉处。',
      },
      {
        index: 4,
        instruction: '定期检查：前几天观察液面与气味，出现发黏、长膜、腐臭异味立即整批丢弃。',
      },
      { index: 5, instruction: '食用前处理：腌制品普遍含盐量高，食用前按需浸泡脱盐并充分加热。' },
    ],
    cautions: [
      '腌制无法替代冷藏，环境温度过高时应缩短腌制时间或转为煮熟后存放',
      '亚硝酸盐风险：腌制初期（尤其前 1-2 周）的腌菜不建议大量食用',
      '出现胀袋、产气、霉变立即停止食用',
    ],
    failureReasons: ['盐浓度不足导致腐败', '食材露出液面接触空气长霉', '容器被油或生水污染'],
    safetyChecklist: ['容器与双手清洁', '食材完全浸没并密封', '变质征兆（异味、黏滑）即弃'],
    alternatives: ['有电时优先冷藏或冷冻', '无盐时可用糖渍或醋渍替代部分保存需求'],
    tags: ['食物保存', '盐腌', '储备', '无冷藏'],
    relatedIds: [
      'skill-food-keep-sun-dry',
      'skill-food-keep-smoke',
      'skill-containers-store-water',
    ],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L2', sources: pick('usda_food', 'community') }),
  },
  {
    id: 'skill-food-keep-smoke',
    categorySlug: 'food-keep',
    title: '简易烟熏保存食物',
    summary: '利用低温烟气干燥并附着抗菌物质，可延长肉类保存期；涉及明火与烟雾，须全程有人看守。',
    coverImage: undefined,
    purpose: '在没有盐与冰箱的条件下，用烟熏对肉类进行脱水与防腐处理。',
    scenarios: ['渔猎获得大量肉类需保存', '长期野外驻留缺少冷藏手段', '灾后备粮加工'],
    materials: [
      '硬木（果木、栎木等，勿用含树脂针叶木）',
      '新鲜食材与挂钩/竹签',
      '熏制容器或挖坑式熏坑',
    ],
    tools: ['刀', '点火工具', '隔热手套'],
    difficulty: 4,
    estimatedMinutes: 240,
    steps: [
      {
        index: 1,
        instruction: '准备熏料：选用干燥硬木刨花或木块，避免松、柏等含树脂木材产生过多有害烟气。',
      },
      {
        index: 2,
        instruction:
          '搭建熏制装置：在容器底部或坑内生起小火，上方设架悬挂食材，保证烟可流通但火苗接触不到食材。',
        warning: '熏制必须全程有人看守，禁止过夜无人值守，火源周围清除一切可燃物。',
      },
      {
        index: 3,
        instruction: '控制火势：保持低温冒烟、不出现明显火苗，温度过高会使外层焦化而内部仍未干透。',
      },
      { index: 4, instruction: '持续熏制：连续数小时至肉条明显变干、颜色加深、掰开断面无湿润感。' },
      {
        index: 5,
        instruction: '彻底冷却与检查：移离火源后完全冷却，检查是否干燥均匀，内部发软的继续处理。',
      },
      {
        index: 6,
        instruction:
          '灭火与存放：彻底浇灭并确认无复燃后方可离开，成品密封后置于阴凉干燥处并定期检查。',
      },
    ],
    cautions: [
      '烟熏不能替代冷藏的安全底线，成品仍需定期检查',
      '在通风处操作，避免一氧化碳与烟雾积聚',
      '出现酸败、霉变、异味立即丢弃',
    ],
    failureReasons: [
      '火势过大烤焦外表而内部未干',
      '使用含树脂木材引入苦味与有害物质',
      '成品未彻底冷却密封导致回潮霉变',
    ],
    safetyChecklist: [
      '火源旁无可燃物且有人看守',
      '操作点通风，不在帐篷内熏制',
      '结束时确认余火完全熄灭',
    ],
    alternatives: ['有盐时优先选择盐腌', '有电时使用食品烘干机更安全可控'],
    tags: ['食物保存', '烟熏', '明火作业', '储备'],
    relatedIds: ['skill-food-keep-sun-dry', 'skill-food-keep-salt-cure', 'skill-power-fire-safety'],
    verification: 'pending_review',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({
      reviewStatus: 'pending_review',
      dangerLevel: 'L2',
      sources: pick('community', 'survival_manual_military'),
    }),
  },

  /* ============ 绳索与结绳 knots ============ */
  {
    id: 'skill-knots-bowline',
    categorySlug: 'knots',
    title: '称人结（Bowline）打法与用途',
    summary: '在绳端打出一个不滑脱、受力后仍易解开的固定绳环，是户外与救援中最常用的基础绳结之一。',
    coverImage: undefined,
    purpose: '快速制作可靠的固定绳环，用于系固定点、临时固定人员（配合安全带使用时需专业评估）。',
    scenarios: ['搭建庇护所固定脊绳', '捆绑漂浮物或货物', '需要一个不会收紧勒住物体的绳环'],
    materials: ['直径 6-12 毫米的绳索一段'],
    tools: ['无（徒手完成）', '刀（截绳，可选）'],
    difficulty: 2,
    estimatedMinutes: 15,
    steps: [
      { index: 1, instruction: '留出约 30 厘米绳头，形成一个小绳环（主绳与绳头平行）。' },
      { index: 2, instruction: '口诀化操作：绳头从下往上穿过小环（"兔子从洞里出来"）。' },
      { index: 3, instruction: '绳头绕过主绳后侧（"绕过大树"）。' },
      { index: 4, instruction: '绳头再穿回小环（"兔子回到洞里"）。' },
      {
        index: 5,
        instruction: '双手分别拉主绳与绳头收紧，整理绳环使其平整不扭曲。',
        warning: '未完全收紧的称人结在受力时可能松脱，使用前必须逐个检查。',
      },
      { index: 6, instruction: '验证：受力后绳环大小应保持不变，且解开时只需推倒绳环一侧即可。' },
    ],
    cautions: [
      '不同材质、粗细的绳摩擦特性不同，首次使用先小力试拉',
      '湿绳与尼龙绳受力后更难解开',
      '涉及人身安全的承重必须使用经认证的装备与专业结绳',
    ],
    failureReasons: [
      '绳头穿错方向导致受力后自动松脱',
      '绳环扭曲造成局部磨损',
      '绳头留得过短，受力后被抽出',
    ],
    safetyChecklist: ['绳索无明显磨损、断股', '受力方向与结的设计一致', '承重前完成试拉检查'],
    alternatives: ['需要快速解脱时用活称人结', '连接两根等粗绳时改用接绳结'],
    tags: ['绳结', '称人结', '固定', '户外基础'],
    relatedIds: ['skill-knots-tautline', 'skill-knots-sheetbend', 'skill-shelter-ridge-tarp'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'community') }),
  },
  {
    id: 'skill-knots-tautline',
    categorySlug: 'knots',
    title: '张紧结（Taut-line Hitch）打法与用途',
    summary:
      '一种可在主绳上滑动、受力后又能锁紧的调节结，专门用于需要反复松紧的绳索，如庇护所拉绳。',
    coverImage: undefined,
    purpose: '让拉绳在不重新打结的情况下调节松紧并保持张力。',
    scenarios: ['天幕、帐篷风绳的松紧调节', '货物捆扎后需要二次收紧', '晾衣绳、临时围栏'],
    materials: ['绳索一段（最好 6 毫米以下，粗绳可改用其他调节结）'],
    tools: ['无（徒手完成）'],
    difficulty: 2,
    estimatedMinutes: 15,
    steps: [
      { index: 1, instruction: '把绳头绕过固定点（树、地钉），回到主绳一侧。' },
      {
        index: 2,
        instruction: '绳头在主绳上绕两圈，绕圈方向朝向固定点，圈与圈之间保持整齐不重叠。',
      },
      { index: 3, instruction: '绳头跨过主绳，在外侧再绕主绳一圈。' },
      { index: 4, instruction: '把绳头穿入刚形成的两个内圈之间，拉紧形成半结收尾。' },
      {
        index: 5,
        instruction: '测试：握住结沿主绳滑动应能移动，松手受力后应咬紧不滑动。',
        warning: '绳索过粗或表面过于光滑时张紧结容易打滑，承重场景需改用其他锁紧方式。',
      },
    ],
    cautions: [
      '尼龙绳在强振动下可能缓慢滑移，需定期复查',
      '不要用它做人体承重的唯一固定',
      '调节时缓慢施力，防止绳结错位',
    ],
    failureReasons: ['绕圈方向装反导致完全打滑', '圈数太少咬合力不足', '收尾半结穿错位置'],
    safetyChecklist: ['绳索无磨损', '结打好后做过滑移测试', '承重方向正确'],
    alternatives: ['粗绳可用营钉结或双套结加调节扣替代', '有金属调节扣时直接使用更可靠'],
    tags: ['绳结', '张紧结', '调节', '庇护所'],
    relatedIds: ['skill-knots-bowline', 'skill-shelter-ridge-tarp', 'skill-warmth-rain-barrier'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'community') }),
  },
  {
    id: 'skill-knots-sheetbend',
    categorySlug: 'knots',
    title: '接绳结与平结：连接与捆绑',
    summary:
      '接绳结用于连接两根粗细或材质不同的绳子，平结用于捆扎绳端对齐的物件，两者互补构成基础绳结组合。',
    coverImage: undefined,
    purpose: '在绳子不够长或需要捆绑包裹时，快速连接与收束绳索。',
    scenarios: ['需要更长的绳索', '捆绑柴火、包裹与行囊', '固定两根不同粗细的绳子'],
    materials: ['两根绳索（接绳结）或一根绳（平结）'],
    tools: ['无（徒手完成）'],
    difficulty: 1,
    estimatedMinutes: 10,
    steps: [
      { index: 1, instruction: '接绳结：把粗绳末端弯成 U 形，细绳从下向上穿过 U 形环。' },
      { index: 2, instruction: '细绳绕过粗绳两端的下方，再从自身下方穿出，拉紧。' },
      {
        index: 3,
        instruction: '检查：两根绳的受力方向应相反，细绳绳头与 U 形环之间应互相压住。',
        warning: '两根绳粗细、材质差异越大，接绳结越容易滑脱，受力后必须复检。',
      },
      {
        index: 4,
        instruction:
          '平结：两绳端相向交叉，右压左打一个单结，再左压右打第二个单结（"左压右、右压左"）。',
      },
      { index: 5, instruction: '拉紧后观察形状应平整对称；不对称说明打错，需重打。' },
    ],
    cautions: [
      '平结不适合承受强烈拉扯与反复受力',
      '绳端磨损处不要作为结的受力点',
      '重要用途打完结后做试拉验证',
    ],
    failureReasons: ['平结打成"祖母结"导致受力即滑脱', '接绳结细绳绕向错误', '绳头留得太短'],
    safetyChecklist: ['绳索无断股', '结形对称、受力方向正确', '承重前试拉'],
    alternatives: ['连接等粗绳可用双套结或渔人结', '捆扎包裹可用活结便于快速解开'],
    tags: ['绳结', '接绳结', '平结', '捆绑'],
    relatedIds: ['skill-knots-bowline', 'skill-knots-tautline', 'skill-tools-lever'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'community') }),
  },

  /* ============ 基础工具 basic-tools ============ */
  {
    id: 'skill-tools-knife-safety',
    categorySlug: 'basic-tools',
    title: '刀具安全使用与保养',
    summary:
      '刀是最常用的生存工具，也是野外外伤的主要来源。本教程只讲安全操作原则与保养，强调固定、方向与防护。',
    coverImage: undefined,
    purpose: '在切割、削制材料时最大限度降低割伤风险，并保持刀具处于可控状态。',
    scenarios: ['制作工具、处理食材、截断绳索', '搭建庇护所时削木桩', '刀具变钝后的安全打磨'],
    materials: ['直刃生存刀或折叠刀', '磨刀石或便携磨刀器', '刀鞘'],
    tools: ['手套', '工作垫或平整木块'],
    difficulty: 3,
    estimatedMinutes: 30,
    steps: [
      {
        index: 1,
        instruction:
          '工作区清理：清理周边人员与障碍物，确保挥动与跌落范围内无人，地面不易让刀滑脱。',
      },
      {
        index: 2,
        instruction:
          '固定工件：把被切割物放在稳固平面或用夹具、脚踩固定，禁止悬空手持薄小物件切割。',
        warning: '刀刃始终朝向远离身体的方向，禁止把刀尖对着自己或他人，禁止抛接刀具。',
      },
      {
        index: 3,
        instruction:
          '控制力度：用可控的小幅度动作切削，感觉阻力突变立即停下检查，避免用力过猛打滑。',
      },
      {
        index: 4,
        instruction:
          '传递与放置：递刀时递刀柄，刀刃朝下放置在稳固台面或入鞘，不放在毯子、包边等易滑落处。',
      },
      {
        index: 5,
        instruction:
          '保养：使用后擦净水分与污物，定期在磨刀石上按固定角度打磨，保持刀刃锋利（钝刀比快刀更易打滑伤人）。',
      },
      {
        index: 6,
        instruction:
          '受伤处置：发生割伤立即直接加压止血；出现深部伤口、肌腱活动异常或持续出血不止，立即就医。',
      },
    ],
    cautions: [
      '疲劳、饮酒、光线不足时停止使用刀具',
      '刀具入鞘后再放回背包，禁止与刃口朝外裸放',
      '儿童使用刀具须成人全程在旁',
    ],
    failureReasons: [
      '悬空手持工件导致刀滑向持物手',
      '刀刃变钝后加大力量造成失控',
      '随手把刀放在毯子上被压到或滑落',
    ],
    safetyChecklist: ['工作区无人且稳固', '刀具锋利、无松动刀柄', '急救止血物品在手边'],
    alternatives: ['可用锯、剪刀完成大部分截断工作', '处理食材时优先使用固定台面与防滑垫'],
    tags: ['刀具', '安全操作', '工具保养', '防割伤'],
    relatedIds: ['skill-tools-firesteel', 'skill-tools-lever', 'skill-repair-fabric'],
    verification: 'verified',
    dangerLevel: 'L3',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L3', sources: pick('survival_manual_military', 'rc_firstaid') }),
  },
  {
    id: 'skill-tools-firesteel',
    categorySlug: 'basic-tools',
    title: '打火棒取火与引火物准备',
    summary: '打火棒不怕水、寿命长，是可靠的应急点火工具；成败关键在引火物的准备，而不是火花本身。',
    coverImage: undefined,
    purpose: '在潮湿环境中可靠地生起一堆可控的火，用于煮水、取暖与信号。',
    scenarios: ['火柴受潮或用尽', '雨雪环境需要生火', '需要快速获得热源煮沸消毒'],
    materials: ['打火棒与刮片', '火绒：干燥细草、木屑、棉花、卫生纸芯', '细枝与手腕粗的柴'],
    tools: ['刀（刮镁粉、削木花）', '防风挡板'],
    difficulty: 2,
    estimatedMinutes: 25,
    steps: [
      {
        index: 1,
        instruction: '准备三层燃料：先备好火绒（最细）、细枝、主柴，全部提前备足再点火。',
      },
      { index: 2, instruction: '削木花：用刀在干木条上削出卷曲的薄木花，增加受热点。' },
      { index: 3, instruction: '布置火堆：底层铺火绒，上架细枝呈锥形，留出空气流通的空隙。' },
      {
        index: 4,
        instruction:
          '打火：刮片与打火棒呈约 45 度，刮下少量镁粉落在火绒上，快速刮擦使火花直接落在火绒中心。',
        warning: '点火点必须远离帐篷、干草与枯枝，先挖好火塘或用石头围出隔离带。',
      },
      {
        index: 5,
        instruction: '引燃：火绒起阴燃后轻轻吹气供氧，逐步添加细枝，切勿一次压塌通风结构。',
      },
      { index: 6, instruction: '灭火：用水浇透、搅拌灰烬再浇水，确认完全冷却无复燃后方可离开。' },
    ],
    cautions: [
      '刮下的火花可能引燃衣物，操作时保持安全距离',
      '不在帐篷内或风口正对处生火',
      '离开前必须彻底灭火并复查',
    ],
    failureReasons: ['引火物不够干燥或太粗', '火花落在火绒外', '燃料一次堆太多压灭初期火苗'],
    safetyChecklist: ['火塘周围清除可燃物', '备有灭火用水或沙土', '有人看守，不离火'],
    alternatives: ['有打火机时优先使用，注意防潮保存', '干燥环境下可用放大镜聚焦取火'],
    tags: ['生火', '打火棒', '引火', '应急热源'],
    relatedIds: ['skill-power-fire-safety', 'skill-water-treat-boil', 'skill-tools-knife-safety'],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L2', sources: pick('survival_manual_military', 'fema') }),
  },
  {
    id: 'skill-tools-lever',
    categorySlug: 'basic-tools',
    title: '简易杠杆与省力装置',
    summary: '利用杠杆、斜面与滚动原理，用有限工具搬运重物、开启变形结构，是灾后自救的低技术手段。',
    coverImage: undefined,
    purpose: '在没有机械的情况下，用木棍、砖石实现撬动、抬升与移动重物。',
    scenarios: ['灾后清理通道、移开轻型倒塌物', '搬运石块、木材等重物', '开启被卡住的门窗'],
    materials: ['结实的木棍或钢筋（作撬棒）', '砖块、石块（作支点）', '圆木或管材（作滚杠）'],
    tools: ['手套', '绳（牵引，可选）'],
    difficulty: 2,
    estimatedMinutes: 30,
    steps: [
      {
        index: 1,
        instruction: '评估重量与风险：确认重物不会在撬动时滚落伤人，先观察重心与可能的滚动方向。',
      },
      {
        index: 2,
        instruction: '选支点：把支点放在靠近重物处，支点下方垫稳，不在松软地面直接施力。',
      },
      {
        index: 3,
        instruction: '施力：双手握撬棒末端缓慢下压或上抬，动作平稳，禁止突然猛压或用身体重量猛砸。',
        warning: '重物下方严禁把手、脚伸入；多人协作时统一听口令动作。',
      },
      { index: 4, instruction: '垫升：抬起后立即用木块、砖石垫入，再换更短撬距继续，逐级抬升。' },
      {
        index: 5,
        instruction: '滚动搬运：重物抬起后塞入圆木滚杠，推动时人员站在侧后方，防止滚杠弹出。',
      },
      { index: 6, instruction: '结束：重物就位后撤出工具并清点，确认无遗留空隙造成后续绊倒。' },
    ],
    cautions: [
      '撬棒受力时可能断裂飞出碎片，保持面部与身体避开延长线',
      '支点不稳会突然塌陷，先试压确认',
      '不确定结构稳定性时放弃自行移动，等待专业救援',
    ],
    failureReasons: ['支点太远导致费力且撬棒易断', '重物下方未垫稳导致回落', '多人施力不同步'],
    safetyChecklist: ['撤离路线畅通', '重物下方无人', '工具无裂纹与毛刺'],
    alternatives: ['有千斤顶时优先使用专用顶升工具', '大型倒塌物请专业救援队处置'],
    tags: ['杠杆', '省力', '搬运', '自救清理'],
    relatedIds: ['skill-knots-sheetbend', 'skill-tools-knife-safety', 'skill-repair-fabric'],
    verification: 'pending_review',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({
      reviewStatus: 'pending_review',
      dangerLevel: 'L2',
      sources: pick('community', 'mem_gov_cn'),
    }),
  },

  /* ============ 简易容器 containers ============ */
  {
    id: 'skill-containers-bark',
    categorySlug: 'containers',
    title: '树皮与柔性材料容器制作',
    summary:
      '用完整树皮、大片树叶或柔性材料卷制成临时容器，用于取水、煮食与盛放物品，属于就地取材的应急制作。',
    coverImage: undefined,
    purpose: '在没有锅、桶、袋子时制作一次性或短期使用的盛物器具。',
    scenarios: ['缺少容器需临时取水', '采集与储存食物、小件物资', '手工制作练习与教学'],
    materials: [
      '大片完整树皮（桦树、杉木等易剥离树皮）',
      '大叶片或芭蕉叶',
      '细藤、绳或植物纤维（捆扎）',
    ],
    tools: ['刀（剥离与裁切）', '木钉（固定形状，可选）'],
    difficulty: 3,
    estimatedMinutes: 60,
    steps: [
      {
        index: 1,
        instruction: '取材：优先使用倒伏枯木或自然脱落的树皮，禁止为做容器剥活树皮破坏植被。',
      },
      {
        index: 2,
        instruction: '裁切：把树皮裁成合适大小的矩形或梯形，湿润状态下柔韧性更好、不易开裂。',
      },
      {
        index: 3,
        instruction: '卷制成型：卷成圆筒或锥形，接缝处重叠一指宽，用藤条或纤维每隔几厘米穿扎固定。',
      },
      {
        index: 4,
        instruction: '封底：底部用叶片折叠包裹并穿扎，或把多余树皮向内折起压实形成底部。',
      },
      {
        index: 5,
        instruction: '试漏与处理：装水检查是否渗漏，渗漏处用细纤维与软泥填补；用前以沸水冲洗内壁。',
        warning:
          '树皮容器不能直接放在明火上烧煮，煮水请使用金属容器；不明植物树皮可能有刺激性汁液。',
      },
    ],
    cautions: [
      '禁止剥取活树树皮',
      '避免使用有毒、有刺激性汁液的植物',
      '仅作短期容器，长期盛水易滋生细菌',
    ],
    failureReasons: [
      '树皮过干导致卷制时开裂',
      '扎线间距过大导致接缝张开',
      '封底折角处理不当导致漏水',
    ],
    safetyChecklist: ['取材时注意刀具安全', '确认植物无可识别毒性', '容器使用前后清洗'],
    alternatives: ['可用竹筒（保留节隔）作容器', '塑料袋、饭盒等现代容器优先'],
    tags: ['容器', '手工制作', '树皮', '就地取材'],
    relatedIds: [
      'skill-containers-store-water',
      'skill-tools-knife-safety',
      'skill-water-collect-rain',
    ],
    verification: 'pending_review',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({
      reviewStatus: 'pending_review',
      dangerLevel: 'L1',
      sources: pick('community', 'survival_manual_military'),
    }),
  },
  {
    id: 'skill-containers-store-water',
    categorySlug: 'containers',
    title: '临时储水与防二次污染',
    summary:
      '储水的关键是容器清洁、全程加盖与取用卫生；处理合格的水若储存不当会在数小时内被再次污染。',
    coverImage: undefined,
    purpose: '建立安全的临时储水流程，保证已处理水在存放期间保持洁净。',
    scenarios: ['灾后集中供水或自采水储存', '外出携带饮用水', '为家庭储备多日用水'],
    materials: [
      '食品级带盖容器（水桶、水壶、矿泉水瓶）',
      '漂白剂或开水（容器消毒用，可选）',
      '标签与笔（标注处理时间）',
    ],
    tools: ['漏斗', '干净的舀水勺或杯子'],
    difficulty: 2,
    estimatedMinutes: 25,
    steps: [
      {
        index: 1,
        instruction:
          '清洁容器：用洗涤剂刷洗内壁后，以开水烫洗或按说明用稀释漂白液消毒，再用处理过的水冲洗。',
      },
      {
        index: 2,
        instruction: '分装：把已消毒的水通过漏斗倒入容器，装至距瓶口 2-3 厘米处立即拧紧盖子。',
      },
      { index: 3, instruction: '标注：写明"处理日期/来源"，遵循先存先用原则轮换使用。' },
      {
        index: 4,
        instruction: '存放环境：置于阴凉避光处，远离化学品、燃料与垃圾，不要直接放在地面上。',
      },
      {
        index: 5,
        instruction:
          '取用卫生：倒出饮用而非用手伸入舀取，倒出的水不回倒；敞口放置超过规定时间的水重新消毒后再用。',
        warning: '取水勺、杯子不洁是储水被污染的最常见原因，专用器具不得挪作他用。',
      },
    ],
    cautions: [
      '不使用曾装过清洁剂、油类的容器',
      '储水容器不与食品、化学品混放',
      '发现水体浑浊、有异味立即弃用并重新处理',
    ],
    failureReasons: [
      '容器未彻底清洗残留洗涤剂',
      '盖子未拧紧进入灰尘与昆虫',
      '取用时手或不洁器具接触水体',
    ],
    safetyChecklist: ['容器密封完好、无破损', '存放点阴凉且远离污染源', '标注清晰可追溯'],
    alternatives: ['无带盖容器时用多层塑料袋套装并扎口', '可用开水烫洗代替化学消毒'],
    tags: ['储水', '饮水安全', '防污染', '储备'],
    relatedIds: ['skill-water-treat-boil', 'skill-water-collect-rain', 'skill-containers-bark'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('who_water', 'fema') }),
  },

  /* ============ 农业种植 farming ============ */
  {
    id: 'skill-farming-sprout',
    categorySlug: 'farming',
    title: '芽苗菜无土培育',
    summary:
      '用种子与清水在室内快速培育芽苗，7-10 天即可收获，是停电断供期间补充维生素的高效方式。',
    coverImage: undefined,
    purpose: '在缺少土壤与光照的条件下生产新鲜蔬菜。',
    scenarios: ['灾害后长期室内避险', '冬季或阳台缺少种植条件', '应急储备种子的快速利用'],
    materials: ['芽苗专用种子（如绿豆、苜蓿、萝卜苗）', '清水', '带孔的育苗盘或塑料筐', '喷壶'],
    tools: ['量杯', '干净纱布'],
    difficulty: 1,
    estimatedMinutes: 20,
    steps: [
      { index: 1, instruction: '选种：使用当年、未霉变的可食用种子，霉变、虫蛀的种子一律弃用。' },
      {
        index: 2,
        instruction: '浸泡：种子用 3-5 倍清水浸泡数小时（按种子说明），至明显吸水膨胀。',
      },
      { index: 3, instruction: '播种：沥水后均匀铺在育苗盘中，厚度约 1-2 层种子，避免堆积过厚。' },
      {
        index: 4,
        instruction: '避光催芽：初期置于阴暗处，每天用清水冲洗 2-3 次并彻底沥干，防止积水烂根。',
        warning: '冲洗用水必须是清洁水；出现发黏、腐臭、长毛的批次立即整批丢弃，不要食用。',
      },
      { index: 5, instruction: '见光转绿：芽长约 2-3 厘米后移到散射光处，让子叶转绿。' },
      {
        index: 6,
        instruction: '采收：高约 5-8 厘米时采收，清洗后食用，未吃完的部分沥干冷藏或当日吃完。',
      },
    ],
    cautions: [
      '芽苗环境温暖潮湿，易滋生细菌，全程保持器具清洁',
      '不要用霉变种子催芽',
      '生食芽苗对肠胃敏感者与免疫力低下人群存在风险，建议焯水后食用',
    ],
    failureReasons: ['冲洗后积水导致烂根发臭', '种子堆积过厚通风不良', '器具不洁引起霉变'],
    safetyChecklist: ['种子来源可靠、无霉变', '器具每次使用前清洗', '异常气味与黏液即弃'],
    alternatives: ['有土壤与光照时改用容器种植叶菜', '无专用盘可用底部扎孔的塑料盒替代'],
    tags: ['种植', '芽苗菜', '无土栽培', '应急蔬菜'],
    relatedIds: [
      'skill-farming-container',
      'skill-food-keep-sun-dry',
      'skill-containers-store-water',
    ],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('usda_food', 'cdc') }),
  },
  {
    id: 'skill-farming-container',
    categorySlug: 'farming',
    title: '容器应急种植（泡沫箱与塑料瓶）',
    summary:
      '用泡沫箱、塑料袋、塑料瓶等废弃物做种植容器，在阳台或室内生产叶菜与葱蒜，改善长期避险期间的饮食结构。',
    coverImage: undefined,
    purpose: '利用有限空间与废弃物建立可持续的小型蔬菜供应。',
    scenarios: ['城市灾后长期居家避险', '阳台、屋顶、窗台种植', '土壤污染地区需要隔离种植'],
    materials: [
      '泡沫箱或大号塑料瓶（底部打孔）',
      '清洁栽培土或园艺基质',
      '蔬菜种子（小白菜、生菜、葱等速生品种）',
    ],
    tools: ['剪刀或锥子（开孔）', '喷壶或水杯', '垫板（接水）'],
    difficulty: 2,
    estimatedMinutes: 45,
    steps: [
      {
        index: 1,
        instruction: '制作容器：在底部与侧下方开排水孔，泡沫箱深约 15-20 厘米即可，太大易积水。',
      },
      { index: 2, instruction: '装土：装入清洁基质至八分满，轻轻压实，不要使用来历不明的污染土。' },
      { index: 3, instruction: '播种：按种子说明浅播，覆薄土，播后浇透水至盆底排水孔出水。' },
      {
        index: 4,
        instruction: '放置：放在有散射光或每日直射数小时的位置，容器下垫接水盘防止渗漏。',
      },
      { index: 5, instruction: '日常管理：表土发白即浇小水，保持湿润不积水；出苗后间苗避免过密。' },
      {
        index: 6,
        instruction: '采收：外叶长成后由外向内陆续采摘，延长收获期。',
        warning: '城市来源的土壤与雨水可能受污染，临近道路的尘土不宜直接做栽培土。',
      },
    ],
    cautions: [
      '容器过重，高层摆放做好防坠落',
      '积水容器及时倒空，防止滋生蚊虫',
      '不要用装过化学品的容器种植',
    ],
    failureReasons: ['排水孔不足导致烂根', '光照不足导致徒长细弱', '浇水过多引发根腐'],
    safetyChecklist: ['容器稳固不坠落', '水源清洁', '废弃容器确认无化学残留'],
    alternatives: ['有菜地时直接露地种植', '无种子时优先使用储备蔬菜与维生素补充'],
    tags: ['种植', '容器栽培', '阳台农业', '应急蔬菜'],
    relatedIds: ['skill-farming-sprout', 'skill-containers-store-water', 'skill-food-keep-sun-dry'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('fema', 'community') }),
  },

  /* ============ 能源利用 power ============ */
  {
    id: 'skill-power-fire-safety',
    categorySlug: 'power',
    title: '安全用火与火塘管理',
    summary:
      '本教程只提供用火的安全管理要点：隔离、看守、通风与彻底灭火，不包含任何可能引发失控的危险操作。',
    coverImage: undefined,
    purpose: '把用火风险控制在可管理范围内，防止火势蔓延与一氧化碳积聚。',
    scenarios: ['野外生火取暖、烧水', '灾后停电用火照明与做饭', '露营与临时安置点用火'],
    materials: ['灭火用水、沙土或灭火毯', '防火隔离带材料（石块）', '手电（减少照明用火需求）'],
    tools: ['无（本教程不涉及设备改装）'],
    difficulty: 2,
    estimatedMinutes: 30,
    steps: [
      {
        index: 1,
        instruction: '选址：选择远离帐篷、干草、枯枝与建筑物的空旷硬质地面，上方无低垂树枝。',
      },
      {
        index: 2,
        instruction: '建立隔离带：用石块围出火塘，清除半径内可燃物，挖出浅坑防止火星滚落。',
      },
      {
        index: 3,
        instruction: '控制规模：只生起与用途相称的小火，不使用汽油、酒精等易燃液体引火。',
        warning: '严禁用汽油、酒精等易燃液体助燃或引火，此类行为极易造成爆燃与严重烧伤。',
      },
      {
        index: 4,
        instruction: '全程看守：用火期间专人看守，不离开、不入睡，儿童与宠物保持安全距离。',
      },
      {
        index: 5,
        instruction:
          '通风与防中毒：室内或半封闭空间用火必须保持通风并有报警装置；出现头晕恶心立即撤离通风并求助。',
      },
      {
        index: 6,
        instruction:
          '彻底灭火：用水浇透、搅拌、再浇，用手背贴近测试无余温，确认无烟无热后方可离开。',
      },
    ],
    cautions: [
      '不在密闭空间、帐篷内生火',
      '风力较大时禁止用火或显著缩小火堆',
      '汽油、酒精等燃料与火源严格分开存放',
    ],
    failureReasons: ['离开时余火复燃', '火星被风卷起飞出隔离带', '封闭空间燃烧导致一氧化碳中毒'],
    safetyChecklist: ['灭火物资在手边', '隔离带内无可燃物', '通风良好且有人看守'],
    alternatives: ['优先使用气炉、电炉等可控热源并注意通风', '无照明用火需求时使用头灯、手电'],
    tags: ['用火安全', '火塘', '防火', '一氧化碳'],
    relatedIds: ['skill-warmth-co-safety', 'skill-tools-firesteel', 'skill-water-treat-boil'],
    verification: 'verified',
    dangerLevel: 'L3',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L3', sources: pick('fema', 'mem_gov_cn', 'cdc') }),
  },
  {
    id: 'skill-power-battery-solar',
    categorySlug: 'power',
    title: '太阳能与电池储能安全使用',
    summary:
      '应急供电依赖电池与太阳能板；本教程只讲安全使用与风险处置，涉及带电部分一律强调断电、绝缘与专业检修。',
    coverImage: undefined,
    purpose: '在应急供电场景下安全地使用、存放与检查储能设备，防止短路、起火与触电。',
    scenarios: [
      '停电后使用充电宝与太阳能板',
      '存放已久的应急电池重新启用',
      '为通讯、照明设备补充电量',
    ],
    materials: ['充电宝 / 储能电源', '太阳能充电板', '原装或合规充电线'],
    tools: ['绝缘手套（检查破损时）', '干燥的作业台面'],
    difficulty: 3,
    estimatedMinutes: 40,
    steps: [
      {
        index: 1,
        instruction:
          '外观检查：使用前检查电池外壳是否鼓包、漏液、焦糊或破损，异常设备一律停止使用并隔离。',
        warning: '鼓包、漏液或冒烟的电池禁止继续充电或挤压，应远离人群与可燃物并联系专业回收处理。',
      },
      {
        index: 2,
        instruction: '干燥操作：在干燥台面上连接与断开线缆，手湿时严禁触碰接口与裸露触点。',
      },
      {
        index: 3,
        instruction:
          '接线顺序：先连接太阳能板与控制器，再接入负载；断开时顺序相反，避免带载插拔产生火花。',
      },
      {
        index: 4,
        instruction:
          '充电环境：在通风、阴凉处充电，不覆盖、不靠近火源与易燃物，人离开前确认设备状态。',
      },
      {
        index: 5,
        instruction: '存放：长期存放保持约半电电量，置于儿童接触不到的阴凉干燥处，定期检查外观。',
      },
      {
        index: 6,
        instruction:
          '故障处置：闻到异味、异常发热、冒烟时立即断开连接（能安全断开时），撤离并拨打 119，不自行拆解电池。',
      },
    ],
    cautions: [
      '禁止拆解、刺穿或短接电池',
      '禁止使用破损、非合规充电器',
      '不把电池放在车内高温环境与阳光直射处',
    ],
    failureReasons: ['边充边用导致过热', '接口进水短路', '使用破损充电线引发打火'],
    safetyChecklist: [
      '设备外观完好无鼓包漏液',
      '操作面干燥、通风',
      '灭火器材（如灭火毯）在可及范围内',
    ],
    alternatives: ['有市电时优先使用合规充电器并避免过充', '设备异常时使用备用设备并联系售后'],
    tags: ['电池', '太阳能', '用电安全', '应急供电'],
    relatedIds: ['skill-repair-electrical', 'skill-power-hand-crank', 'skill-warmth-co-safety'],
    verification: 'verified',
    dangerLevel: 'L3',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L3', sources: pick('fema', 'cdc') }),
  },
  {
    id: 'skill-power-hand-crank',
    categorySlug: 'power',
    title: '手摇与人力发电装置使用',
    summary:
      '手摇收音机、手电与充电装置在断电断网时提供最可靠的能源自给，重点在于使用方式与接口安全。',
    coverImage: undefined,
    purpose: '通过人力为通讯与照明设备提供应急电量。',
    scenarios: ['长期停电无法充电', '野外无电力补给', '储备装备的定期启用'],
    materials: ['手摇发电装置或手摇收音机', '配套充电线'],
    tools: ['无'],
    difficulty: 2,
    estimatedMinutes: 20,
    steps: [
      { index: 1, instruction: '检查设备：确认摇柄、线缆与接口完好，无松动、破损与进水痕迹。' },
      {
        index: 2,
        instruction: '固定姿势：把设备放在稳固平面或夹在腰间，摇动时保持机身稳定，避免脱手。',
      },
      {
        index: 3,
        instruction: '匀速摇动：按说明以稳定中速摇动，出现明显阻力突变或异响立即停止检查。',
        warning: '不要在摇动时拉扯输出线缆，接口带电插拔可能产生火花。',
      },
      {
        index: 4,
        instruction:
          '接通负载：先摇动建立稳定输出，再按说明连接设备充电；充满或达到目标后先断开负载再停止摇动。',
      },
      { index: 5, instruction: '定期维护：每隔数月摇动测试一次，保持应急装备随时可用。' },
    ],
    cautions: [
      '输出接口避免进水与金属物短接',
      '不要拆解外壳自行维修内部电路',
      '儿童使用时注意摇柄回弹打手',
    ],
    failureReasons: [
      '摇动过快导致输出不稳或齿轮打滑',
      '接口受潮短路',
      '长期不使用导致内部受潮失效',
    ],
    safetyChecklist: ['外壳完好、线缆无破损', '操作时设备稳固', '异常发热或异味立即停用'],
    alternatives: ['有充电宝时优先使用储能电源', '无手摇装置时使用太阳能板配合晴天充电'],
    tags: ['人力发电', '手摇', '应急供电', '通讯保障'],
    relatedIds: ['skill-power-battery-solar', 'skill-repair-electrical', 'skill-nav-terrain'],
    verification: 'pending_review',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({
      reviewStatus: 'pending_review',
      dangerLevel: 'L2',
      sources: pick('community', 'fema'),
    }),
  },

  /* ============ 设备维修 repair ============ */
  {
    id: 'skill-repair-electrical',
    categorySlug: 'repair',
    title: '电器故障的安全处置（断电确认与专业求助）',
    summary:
      '面对跳闸、焦味、裸露线头等电气异常，正确做法是断电、隔离与求助，本教程不提供任何带电作业指导。',
    coverImage: undefined,
    purpose: '在电气故障面前先保命再修物，明确哪些情况必须撤离并交由专业人员处理。',
    scenarios: ['暴雨进水后室内配电异常', '电器冒烟、起焦味或外壳带电', '灾后临时线路架设与检查'],
    materials: ['干燥的绝缘鞋或干燥木板', '手电（断电后照明）'],
    tools: ['绝缘手套', '验电笔（会使用者）'],
    difficulty: 3,
    estimatedMinutes: 30,
    steps: [
      {
        index: 1,
        instruction: '远离与隔离：不触碰疑似带电设备与积水中的电器，把人员尤其是儿童隔离开。',
      },
      {
        index: 2,
        instruction:
          '断电确认：在确保自身干燥、站在绝缘物上的前提下，从总闸或上一级开关断开电源；无法确认安全时不操作。',
        warning: '不要用手触摸裸露线头、插座内部或积水来"试探"是否带电。',
      },
      {
        index: 3,
        instruction: '通风与撤离：闻到焦糊味、看到冒烟时开窗撤离到室外安全处，拨打 119 说明情况。',
      },
      {
        index: 4,
        instruction:
          '信息记录：记录故障现象、发生时间、涉及电器与是否进水，便于向专业电工或救援人员说明。',
      },
      {
        index: 5,
        instruction:
          '专业处置：恢复供电前由专业人员检查线路与电器；任何自行接线、焊接、更换部件的尝试都应停止。',
      },
    ],
    cautions: [
      '潮湿环境、积水场所严禁自行操作电气设备',
      '不要使用破损插座与私拉乱接的线路',
      '跳闸反复推闸可能掩盖故障，应请专业人员排查',
    ],
    failureReasons: [
      '湿手操作导致触电',
      '只断开支路未断总闸造成误判',
      '未确认故障排除即恢复供电引发复燃',
    ],
    safetyChecklist: [
      '人员已撤离到安全区域',
      '已断开电源（确认安全前提下）',
      '已联系专业人员或消防',
    ],
    alternatives: ['使用电池供电的照明与通讯设备', '临时用电请由持证电工架设'],
    tags: ['用电安全', '电气故障', '断电', '触电预防'],
    relatedIds: ['skill-power-battery-solar', 'skill-warmth-co-safety', 'skill-power-fire-safety'],
    verification: 'verified',
    dangerLevel: 'L3',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L3', sources: pick('fema', 'cdc', 'mem_gov_cn') }),
  },
  {
    id: 'skill-repair-fabric',
    categorySlug: 'repair',
    title: '织物与防水层临时修补',
    summary:
      '用针线、防水胶带与热熔胶对帐篷、雨衣、背包、衣物的破损做快速修补，恢复遮蔽与防水功能。',
    coverImage: undefined,
    purpose: '延长关键装备的使用寿命，避免小破损演变为庇护所失效。',
    scenarios: ['帐篷、天幕被划破漏雨', '雨衣、背包开线', '衣物撕裂需要快速缝合'],
    materials: ['针与结实的线（尼龙线更耐磨）', '防水补丁片或防水胶带', '蜡（封线防潮，可选）'],
    tools: ['剪刀或刀', '顶针（可选）'],
    difficulty: 1,
    estimatedMinutes: 35,
    steps: [
      {
        index: 1,
        instruction: '清理破损：擦净破损边缘的泥沙，剪掉毛边与松散线头，避免缝合后继续撕裂。',
      },
      {
        index: 2,
        instruction:
          '评估：裂口小且受力不大用缝合；受力部位（背包带、帐篷杆套）用补丁加缝双重处理。',
      },
      {
        index: 3,
        instruction: '缝合：从背面入针，采用回针缝或加密平针，针距均匀，两端各多缝 1-2 厘米加固。',
      },
      {
        index: 4,
        instruction: '贴补丁：防水胶带从内侧覆盖破口，边缘超出破口至少 1-2 厘米，压实排除气泡。',
      },
      {
        index: 5,
        instruction: '防水测试：朝修补处泼水检查是否渗漏，必要时再补一层。',
        warning: '热熔胶枪与烙铁属高温工具，使用时远离可燃物并防止烫伤，用后放回儿童接触不到处。',
      },
      { index: 6, instruction: '收尾：剪去多余线头并打结固定，涂少量蜡封线提高耐磨与防水性。' },
    ],
    cautions: [
      '受力缝合部位不要只用胶带临时对付',
      '防水胶带贴合面必须干燥洁净',
      '修补后首次使用时先在小应力下测试',
    ],
    failureReasons: [
      '破口未清理导致缝合处继续撕开',
      '针距过大受力即豁开',
      '胶带贴在潮湿表面导致脱落',
    ],
    safetyChecklist: [
      '针线使用后妥善收纳防止刺伤',
      '高温工具操作区无易燃物',
      '修补处无遗留尖锐线头',
    ],
    alternatives: ['无针线时用安全别针、扎带临时固定', '紧急情况下用防水胶带做单面贴补'],
    tags: ['修补', '缝纫', '防水', '装备维护'],
    relatedIds: [
      'skill-repair-electrical',
      'skill-tools-knife-safety',
      'skill-warmth-rain-barrier',
    ],
    verification: 'pending_review',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ reviewStatus: 'pending_review', dangerLevel: 'L1', sources: pick('community') }),
  },

  /* ============ 野外方向判断 navigation ============ */
  {
    id: 'skill-nav-sun-compass',
    categorySlug: 'navigation',
    title: '太阳与影子定向',
    summary: '利用太阳东升西落与影子移动规律判断大致方位，是最基础、不依赖任何设备的定向方法。',
    coverImage: undefined,
    purpose: '在没有指南针与地图时快速确定东西南北，校正行进方向。',
    scenarios: ['指南针丢失或电量耗尽', '白天开阔地带确定方向', '校对地图与行进方向'],
    materials: ['一根直立的木棍或石柱（约 1 米）', '两块小石子（标记影子端点）'],
    tools: ['手表（可选，用于交叉验证）'],
    difficulty: 1,
    estimatedMinutes: 15,
    steps: [
      { index: 1, instruction: '立杆：把木棍垂直插在平地上，确保不倾斜。' },
      { index: 2, instruction: '标影：在影子顶端放一块石子作为第一个标记点。' },
      {
        index: 3,
        instruction: '等待与再标：等待约 15-30 分钟，影子移动后再在新的影端放第二块石子。',
      },
      {
        index: 4,
        instruction:
          '定向：连接两块石子，第一点到第二点的方向大致为由西向东，垂直于此线即为南北方向。',
      },
      {
        index: 5,
        instruction:
          '交叉验证：北半球正午影子最短时指向正北（北回归线以北地区），用此结果校核上一步。',
        warning: '该方法精度有限（偏差可达数度），只用于大致定向，不替代精密导航。',
      },
    ],
    cautions: [
      '正午前后影子变化慢，定向误差较大',
      '木棍必须垂直，否则标记点连线失真',
      '阴天无法使用，改用手表或地形判读',
    ],
    failureReasons: [
      '木棍倾斜导致连线方向错误',
      '两次标记间隔太短、测量误差过大',
      '在北回归线以南地区误用正午影子判北',
    ],
    safetyChecklist: [
      '观测点远离悬崖与交通线',
      '定向后再次确认行进路线安全',
      '保留原地图与已知参照物',
    ],
    alternatives: ['用手表指针法交叉验证', '夜间可用北极星定向'],
    tags: ['定向', '太阳', '影子', '野外导航'],
    relatedIds: ['skill-nav-watch', 'skill-nav-terrain', 'skill-knots-sheetbend'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'community') }),
  },
  {
    id: 'skill-nav-watch',
    categorySlug: 'navigation',
    title: '手表指针定向法',
    summary: '将时针指向太阳，时针与 12 点刻度的角平分线即指向南北，是白天快速定向的常用方法。',
    coverImage: undefined,
    purpose: '用手表在几秒内估出南北方向，配合地图使用。',
    scenarios: ['白天行进中快速校正方向', '指南针缺失时的替代方案', '教学与训练'],
    materials: ['指针式手表（或可模拟表盘的手机应用）'],
    tools: ['无'],
    difficulty: 1,
    estimatedMinutes: 10,
    steps: [
      { index: 1, instruction: '水平持表：把手表放平，表盘朝向自己。' },
      { index: 2, instruction: '时针对日：转动身体与时针，使时针精确指向太阳方向。' },
      {
        index: 3,
        instruction: '找角平分线：在北半球，时针与表盘 12 点刻度之间夹角的平分线指向正南。',
      },
      {
        index: 4,
        instruction:
          '确认南北：记住这条线指向南，反方向即为北；北半球南温带地区同样适用，方向相反需注意半球差异。',
        warning: '该方法为近似定向，误差可达 10 度以上，重要导航请结合地图与指南针。',
      },
      { index: 5, instruction: '交叉验证：与太阳影子法或地形水流方向互相印证后再决定行进方向。' },
    ],
    cautions: [
      '使用 24 小时制表盘时需按 1 点对应 13 点换算',
      '不要直视太阳太久，可用余光对准',
      '电子表无指针时改用其他方法',
    ],
    failureReasons: [
      '时针对向偏移导致方向错误',
      '南北半球方法混淆',
      '在高纬度或遮挡环境下对日不准',
    ],
    safetyChecklist: ['确认所在半球与大致纬度', '与已知参照物交叉验证', '不在悬崖边、马路上做观测'],
    alternatives: ['用影子法验证', '有指南针时以指南针为准'],
    tags: ['定向', '手表', '方向判断', '野外导航'],
    relatedIds: ['skill-nav-sun-compass', 'skill-nav-terrain', 'skill-power-hand-crank'],
    verification: 'verified',
    dangerLevel: 'L1',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L1', sources: pick('survival_manual_military', 'community') }),
  },
  {
    id: 'skill-nav-terrain',
    categorySlug: 'navigation',
    title: '地形、水流与人工参照判读',
    summary:
      '山脊、沟谷、河流与道路是天然的方向线索：水往低处流，道路通向聚落，据此可在无设备时规划路线。',
    coverImage: undefined,
    purpose: '利用地形与地物特征判断方位、寻找水源与出路。',
    scenarios: ['迷失方向后重新定位', '寻找下游与聚落', '无地图环境下的路线规划'],
    materials: ['离线地图（可选）', '地形模型或记忆中的区域地图（可选）'],
    tools: ['指南针（可选，用于校核）', '手表'],
    difficulty: 2,
    estimatedMinutes: 25,
    steps: [
      {
        index: 1,
        instruction:
          '登高观察：选择安全的高处（避开悬崖边缘）观察整体地貌，找出山脊、沟谷、水体与道路。',
      },
      {
        index: 2,
        instruction:
          '读水流：河流总向低处流，沿河下行通常通向更大的水系与聚落，逆流上行常通向源头与山地。',
        warning: '沿河行进要时刻注意山洪征兆，一旦水位快速上涨、水变浑浊立即离开河道向高处转移。',
      },
      {
        index: 3,
        instruction: '读山脊与鞍部：山脊是分水岭，鞍部（两峰之间的低口）常是翻越与通行的捷径。',
      },
      {
        index: 4,
        instruction:
          '读人工地物：道路、输电线、围墙通常通向居民点；电线杆走向可作为长距离方向参考。',
      },
      {
        index: 5,
        instruction:
          '标记与回溯：在地图或笔记上标注已确认的参照点与行进方向，走一段回头校核，避免绕圈。',
      },
      {
        index: 6,
        instruction: '决策：综合地形与目标选择路线，优先走成熟路径，避免无谓地穿越密林与陡坡。',
      },
    ],
    cautions: [
      '不为观察地形接近悬崖、陡壁边缘',
      '不单独穿越不熟悉的密林与溪谷',
      '天黑前应确定宿营点与水源',
    ],
    failureReasons: [
      '在密林中只看脚下不看整体地貌导致绕圈',
      '忽略河流流向误判上下山方向',
      '沿河行进未防山洪',
    ],
    safetyChecklist: ['观察点安全、立足稳固', '行进路线避开已知危险区', '已规划备用路线与宿营点'],
    alternatives: ['有指南针时用方位角行进', '有手机信号时用地图应用校核位置'],
    tags: ['地形判读', '定向', '寻路', '野外导航'],
    relatedIds: ['skill-nav-sun-compass', 'skill-nav-watch', 'skill-shelter-site-select'],
    verification: 'verified',
    dangerLevel: 'L2',
    offlineReady: true,
    meta: meta({ dangerLevel: 'L2', sources: pick('survival_manual_military', 'mem_gov_cn') }),
  },
];
