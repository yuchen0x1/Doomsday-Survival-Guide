import type { AnimalSpecies, AnimalTrack } from '@apocalypse/core';
import { meta } from './helpers';
import { pick } from './sources';

/** 动物图鉴 */
export const animals: AnimalSpecies[] = [
  /* ============ 哺乳类 mammal ============ */
  {
    id: 'animal-black-bear',
    animalClass: 'mammal',
    name: '亚洲黑熊',
    scientificName: 'Ursus thibetanus',
    aliases: ['黑熊', '狗熊', '月熊'],
    image: undefined,
    appearance:
      '中型熊类，体长 1.2-1.8 米，体重 40-150 公斤；通体黑色，胸前有白色或黄白色"V"字形月牙斑，吻部较尖，耳圆而直立。',
    habitat: '山地阔叶林、混交林、林缘与河谷，善于爬树与游泳，常在陡坡与沟谷活动。',
    activityTime: '晨昏为主，夜间也可活动（晨昏性兼夜行性）。',
    behavior:
      '独居，除育幼期外回避人类；受惊或护幼时极具攻击性，能迅速上树，也会为食物接近居民区垃圾点。',
    diet: '杂食：坚果、浆果、嫩叶、根茎、昆虫、蜂蜜，也取食腐肉与动物性食物。',
    tracks: [
      '掌印似人手但趾端有长而钝的爪痕，前后掌宽约 7-12 厘米',
      '常前后掌交替，步幅 40-70 厘米，沿山脊或林道行进',
    ],
    feces: '圆柱状或成堆，随季节食性变化，含大量植物残渣、果核与昆虫残体，长约 8-15 厘米。',
    dangerLevel: 'L4',
    possibleInjury: '咬伤（可致骨折与大出血）、抓伤、掌击导致的钝器伤；近距离遭遇时可能持续追击。',
    safetyMeasures:
      '保持至少 50 米以上距离并缓慢后退，切勿奔跑（奔跑会触发追逐）；食物与有气味物品密封存放并吊高；营地不留食物残渣；带幼崽的母熊与护食个体风险最高，遇到时保持安静、绕行，不挡住其退路。',
    biteFirstAid:
      '立即远离并呼救，拨打 120；用干净敷料直接持续按压控制大出血，不拔出深嵌的异物；冲洗伤口、覆盖清洁敷料；不切开、不吸吮、不冰敷伤口；尽快就医评估深部感染与是否需预防性用药，并记住动物外形与出现地点。',
    distribution: '中国大部分山林地区（东北、华北、西南、华南、华中），也见于喜马拉雅至东南亚。',
    identificationConfidence: 'B',
    tags: ['大型兽类', '熊', '营地安全', '食物储存'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-wild-boar',
    animalClass: 'mammal',
    name: '野猪',
    scientificName: 'Sus scrofa',
    aliases: ['山猪', '野猪'],
    image: undefined,
    appearance:
      '体型粗壮，肩高 0.5-1 米，体重 40-150 公斤；深褐至黑色硬毛，吻部突出善于拱土，雄性獠牙外露上翘，颈部鬃毛长。',
    habitat: '森林、灌丛、草地与农田交错地带，喜近水源，白天多藏身于密林与芦苇丛。',
    activityTime: '晨昏与夜间活动为主，雨后与夜间觅食频繁。',
    behavior:
      '群居（母猪带仔群），成年公猪常独居；受惊、护幼或被逼入角落时会正面冲撞，直线冲刺速度快，能撞断灌木与围栏。',
    diet: '杂食：根茎、橡实、落果、农作物、蚯蚓、昆虫、小型动物与腐肉。',
    tracks: [
      '偶蹄印，两瓣蹄尖明显，蹄印长 6-9 厘米、宽 5-8 厘米，前蹄常大于后蹄',
      '常见拱土痕迹：成片被翻开的泥土与被啃食的根系',
    ],
    feces: '成堆的条状或颗粒状粪便，随季节含大量植物残渣，常见于林道与农田边缘。',
    dangerLevel: 'L4',
    possibleInjury: '獠牙造成的深度穿刺伤与撕裂伤、冲撞导致的骨折与内脏损伤，伤口极易感染。',
    safetyMeasures:
      '林中转弯、下坡与视线不良处减速慢行，制造人声让其提前避开；遇野猪横向绕开，绝不正面对峙或试图驱赶；不靠近、不投喂、不围堵；带仔母猪与被猎犬追逐的个体攻击性最强；农田与林缘行走时使用手电与棍棒示警。',
    biteFirstAid:
      '立即脱离接触并呼救，拨打 120；穿刺伤先用大量流动清水冲洗，再用干净敷料覆盖并适度加压止血；不切开、不吸吮、不冰敷；保持伤肢制动，记录受伤时间与动物情况，尽快就医清创并评估狂犬病与破伤风预防。',
    distribution: '除青藏高原部分高海拔区与个别岛屿外，广泛分布于中国各省区。',
    identificationConfidence: 'B',
    tags: ['大型兽类', '猪科', '农田边缘', '冲撞风险'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-wolf',
    animalClass: 'mammal',
    name: '狼',
    scientificName: 'Canis lupus',
    aliases: ['灰狼', '豺狼'],
    image: undefined,
    appearance:
      '大型犬科，体长 1-1.6 米，体重 30-50 公斤；灰黄至灰褐色，吻部长而尖，耳直立，尾粗大下垂，后肢略长于前肢。',
    habitat: '草原、荒漠、山地林区与雪原，活动范围广，通常以家族群为单位活动。',
    activityTime: '夜间与晨昏为主。',
    behavior:
      '高度社会化的集群狩猎者，会尾随、包抄与试探猎物；对人类通常回避，但在食物短缺、患病或被投喂习惯化时可能靠近营地。',
    diet: '以大型有蹄类为主，也捕食兔类、啮齿类与家畜，兼食腐肉。',
    tracks: [
      '犬科四趾印，趾端爪痕清晰（犬科不收爪），掌垫前缘呈三点弧形',
      '前后掌交替呈一直线，步幅 60-90 厘米，常沿同一路线反复行走',
    ],
    feces: '长条形，常含毛发与骨屑，多在路径交叉处与领地边缘标记性排泄。',
    dangerLevel: 'L4',
    possibleInjury: '多处咬伤与大面积撕裂伤、失血与继发感染，群体围攻时可致休克。',
    safetyMeasures:
      '结伴行走，保持队形不落单；夜间与晨昏点亮光源、制造声响；不接近、不投喂、不试图靠近观察；遇狼群时面向它们缓慢后退，不转身奔跑，可用火光、大声喊叫与投掷石块驱赶；食物全部密封，垃圾深埋或带走。',
    biteFirstAid:
      '尽快脱离并呼救，拨打 120；多处伤口先用大量流动清水与肥皂水冲洗，再以干净敷料覆盖、直接加压止血；不切开、不吸吮、不冰敷；骨折或大出血者制动固定后送医；记住狼的数量、体型与去向，尽快就医处理狂犬病与破伤风暴露预防。',
    distribution: '中国北方与西部（新疆、西藏、青海、内蒙古、三北林区）为主。',
    identificationConfidence: 'B',
    tags: ['犬科', '集群', '夜行', '营地安全'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-deer',
    animalClass: 'mammal',
    name: '梅花鹿',
    scientificName: 'Cervus nippon',
    aliases: ['花鹿', '鹿'],
    image: undefined,
    appearance:
      '中型鹿类，肩高约 1-1.1 米；夏季毛红棕色并有白色斑点，冬季转为灰褐色且斑点不明显；雄性有分叉角，颈粗耳大。',
    habitat: '针阔混交林、林缘草地与灌丛，晨昏在林间空地与水源附近活动。',
    activityTime: '晨昏为主，夜间亦活动。',
    behavior:
      '性机警，嗅听觉敏锐，遇险多静止观察后迅速奔逃；发情期雄鹿有领地与冲撞行为，受惊个体可能慌不择路冲向人或车辆。',
    diet: '草本、嫩枝、树叶、落果与地衣。',
    tracks: [
      '偶蹄双瓣蹄印，尖而细长，长约 5-7 厘米，两瓣呈倒"V"形，前后端尖锐',
      '成串排列、步幅 1-1.5 米的跳跃式足迹，常通向水源与林间草地',
    ],
    feces: '椭圆小颗粒成堆，深褐色，多见于林间小径与采食地。',
    dangerLevel: 'L1',
    possibleInjury: '受惊冲撞与踩踏造成的挫伤、撞伤；雄鹿角可能划伤；主要风险为林间道路碰撞事故。',
    safetyMeasures:
      '保持安静与距离，不追逐、不投喂；林道行驶减速并注意横穿动物；发情期（秋季）避免接近有角雄鹿；发现受惊个体应让开其逃跑路线。',
    biteFirstAid:
      '一般不主动攻击人。若被踩踏或撞伤，先判断意识与呼吸，控制出血、制动疑似骨折部位，拨打 120 尽快就医；被鹿抓咬少见，若发生按冲洗—覆盖—就医原则处理并评估狂犬病暴露。',
    distribution: '中国东北、华东、华南、西南等地的林区，亦有大量人工养殖种群。',
    identificationConfidence: 'B',
    tags: ['有蹄类', '林缘', '道路安全'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },
  {
    id: 'animal-hare',
    animalClass: 'mammal',
    name: '草兔',
    scientificName: 'Lepus capensis',
    aliases: ['野兔', '蒙古兔'],
    image: undefined,
    appearance:
      '体长 35-50 厘米，体重 1.5-4 公斤；耳长（超过头长）、耳端有黑斑，后肢强健，背毛黄褐色混杂黑色，腹毛白色。',
    habitat: '草原、荒漠边缘、农田、灌丛与林缘，喜在草丛与土坎下做浅窝。',
    activityTime: '晨昏与夜间为主，白天多潜伏。',
    behavior: '独居，警觉性极高，靠后肢长距离跳跃逃生，路线多变；受惊时直立张望后突然窜出。',
    diet: '草本植物、嫩枝、树皮与农作物幼苗。',
    tracks: [
      '前后足印成组：后足印长 9-12 厘米且位于前足印（长 4-6 厘米）前方，呈长条形排列',
      '常呈之字形或大跨度跳跃，间距可达 1-2 米',
    ],
    feces: '圆形小颗粒，成堆，干燥，多见于窝点与采食地边缘。',
    dangerLevel: 'L0',
    possibleInjury: '基本无直接攻击风险；主要为夜间活动时突然窜出造成骑行或驾驶受惊。',
    safetyMeasures:
      '与野兔保持距离，不抓捕、不接触活体或尸体；处理野兔尸体时戴手套（避免接触其体外寄生虫与病原）。',
    biteFirstAid:
      '一般无需处置。若被咬抓伤，用流动清水与肥皂水冲洗伤口，覆盖清洁敷料，就医评估是否需要预防性处理；不自行处理伤口深部。',
    distribution: '广泛分布于中国北方、西北、青藏高原边缘及南方多数地区。',
    identificationConfidence: 'B',
    tags: ['兔形目', '夜行', '农田'],
    meta: meta({ dangerLevel: 'L0', sources: pick('field_guide_cn', 'iucn') }),
  },
  {
    id: 'animal-rat',
    animalClass: 'mammal',
    name: '褐家鼠',
    scientificName: 'Rattus norvegicus',
    aliases: ['大家鼠', '沟鼠', '耗子'],
    image: undefined,
    appearance:
      '体长 15-25 厘米，尾长接近或略短于体长，体重 150-350 克；背毛灰褐色、腹毛灰白色，耳短而厚，吻部钝。',
    habitat: '居民区、仓储、下水道、农田与垃圾堆放处，跟随人类活动扩散。',
    activityTime: '夜间为主。',
    behavior:
      '攀爬、啃咬、游泳能力强，能沿管道与绳索攀行；新物回避（对陌生物件先试探），种群密度高时与人类活动重叠。',
    diet: '极杂：粮食、厨余、垃圾、饲料、昆虫与废弃物。',
    tracks: [
      '前后足印：前足 4 趾、后足 5 趾，常呈前后交错的链状排列，后足印长约 2-3 厘米',
      '常见油污蹭痕、啃咬痕迹（门齿不断生长，啃咬木箱电线留双行齿印）与鼠道（沿墙根的灰尘擦痕）',
    ],
    feces: '两端钝圆的颗粒或短条，长 1-2 厘米，沿鼠道与取食点散布，干后颜色发深。',
    dangerLevel: 'L2',
    possibleInjury:
      '直接咬伤（尤其处理鼠类或睡眠中）；更重要的风险是携带并传播鼠疫、流行性出血热、钩端螺旋体病、汉坦病毒及寄生虫。',
    safetyMeasures:
      '粮食密封于金属或硬质容器，垃圾日产日清；堵鼠洞并封堵管道缝隙（孔径大于 0.6 厘米需封）；不徒手捕捉、不玩耍活鼠；野外处理渔获、垃圾与旧物时戴手套，避免接触其尿液污染的粉尘。',
    biteFirstAid:
      '被咬后立即用流动清水与肥皂水冲洗伤口至少 15 分钟，再覆盖清洁敷料；不切开、不吸吮；尽快就医，说明被鼠咬伤与可能的汉坦病毒/钩端螺旋体暴露，遵医嘱进行预防与观察；出现发热、肌肉痛、眼眶后痛立即急诊。',
    distribution: '中国各地均常见，随人类聚落与运输广泛分布。',
    identificationConfidence: 'B',
    tags: ['啮齿类', '病媒生物', '仓储', '卫生'],
    meta: meta({ dangerLevel: 'L2', sources: pick('cdc', 'field_guide_cn', 'nhc', 'rc_firstaid') }),
  },
  {
    id: 'animal-squirrel',
    animalClass: 'mammal',
    name: '赤腹松鼠',
    scientificName: 'Callosciurus erythraeus',
    aliases: ['松鼠', '红腹松鼠'],
    image: undefined,
    appearance:
      '体长 18-25 厘米，尾长而蓬松；背毛橄榄灰至灰褐色，腹毛橙红或锈红色，眼周有白环，四肢灵活。',
    habitat: '低山常绿阔叶林、针叶林、公园与果园，营巢于树洞或枝杈。',
    activityTime: '白天为主（昼行性），晨昏最活跃。',
    behavior: '树栖，动作敏捷，遇险窜上树干并绕干躲避；有贮藏食物习惯；被逼急或喂食时可能抓咬。',
    diet: '坚果、种子、浆果、嫩叶、鸟蛋与昆虫。',
    tracks: [
      '前后足印细小，趾垫清晰呈放射状，前足印长约 2-3 厘米',
      '树干与地面上的爪痕呈细密划线，储食点常有啃开的坚果壳堆积',
    ],
    feces: '细小颗粒，长约 0.5-1 厘米，多见于巢下与取食点。',
    dangerLevel: 'L0',
    possibleInjury: '抓咬伤一般表浅，但伤口仍可能感染；不主动接近可基本避免。',
    safetyMeasures:
      '不徒手投喂、不追逐抓捕；把食物与垃圾密封，减少其靠近营地与住宅；发现巢穴时绕行。',
    biteFirstAid:
      '用流动清水与肥皂水冲洗伤口，涂消毒剂并覆盖清洁敷料；不吸吮伤口；若伤口较深、出血不止或出现红肿化脓应就医；不接触来源不明的野生个体。',
    distribution: '中国南方各省区及西南山地，公园与城郊常见。',
    identificationConfidence: 'B',
    tags: ['啮齿类', '树栖', '城市边缘'],
    meta: meta({ dangerLevel: 'L0', sources: pick('field_guide_cn', 'rc_firstaid') }),
  },
  {
    id: 'animal-macaque',
    animalClass: 'mammal',
    name: '猕猴',
    scientificName: 'Macaca mulatta',
    aliases: ['恒河猴', '广西猴', '猢狲'],
    image: undefined,
    appearance:
      '体长 40-60 厘米，体重 5-11 公斤；背毛黄褐色，腹毛灰黄，面部肉色无毛，尾长约为体长一半，臀部有胼胝。',
    habitat: '山地森林、岩壁、寺庙与景区，与人类活动区高度重叠，群体规模可达数十只。',
    activityTime: '白天活动。',
    behavior:
      '社会等级明显，群体协作抢食；对食物、塑料袋与亮色物品极感兴趣，被抢食不成时可能抓咬；雄性与护幼个体攻击性强。',
    diet: '杂食：果实、嫩叶、种子、昆虫、鸟蛋，也取食游客与居民投喂的食物。',
    tracks: [
      '手印状：拇指可对握，掌印似微型人手，掌宽 3-5 厘米，指（趾）端有指甲而非爪',
      '常见组合：掌印+趾印散布于树下、岩壁与道路，跳跃落地时前后印成对',
    ],
    feces: '成团或短条状，含果核与植物残渣，常见于投喂点与林道旁。',
    dangerLevel: 'L2',
    possibleInjury:
      '抓伤、咬伤可致较深创伤与出血；其为猕猴疱疹病毒（B 病毒）天然宿主，咬伤后若未及时处理存在致命性脑炎风险。',
    safetyMeasures:
      '不投喂、不直视其眼睛（被视为挑衅）、不手持食物与塑料袋；群体靠近时缓慢退开、不奔跑不尖叫；被围堵时丢弃物品转移注意并撤离；景区与山道注意"禁喂猴"提示。',
    biteFirstAid:
      '立即用大量流动清水与肥皂水冲洗伤口至少 15 分钟，再用消毒液处理并覆盖敷料；不切开、不吸吮、不冰敷；立即就医并明确告知被猕猴咬伤（B 病毒暴露风险），需由专业机构评估抗病毒预防；记住动物与事发地点。',
    distribution: '中国南方、西南与部分中部省区的山地林区与景区。',
    identificationConfidence: 'B',
    tags: ['灵长类', '景区', '抓咬伤', '病毒暴露'],
    meta: meta({
      dangerLevel: 'L2',
      sources: pick('field_guide_cn', 'cdc', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-fox',
    animalClass: 'mammal',
    name: '赤狐',
    scientificName: 'Vulpes vulpes',
    aliases: ['红狐', '火狐'],
    image: undefined,
    appearance:
      '体长 60-90 厘米（含尾），体重 3-7 公斤；毛色多为锈红至黄褐色，腹部白色，尾蓬松且端部常为白色，吻尖耳大。',
    habitat: '林缘、草原、荒漠、丘陵与城乡结合部，适应力强。',
    activityTime: '夜间与晨昏为主。',
    behavior:
      '独居机警，行动隐秘；感染狂犬病或犬瘟热的个体可出现反常的接近人类、白天活动、攻击行为等表现。',
    diet: '杂食：鼠类、野兔、鸟类、昆虫、浆果与腐食。',
    tracks: [
      '犬科四趾印，爪痕明显，掌垫较小，前后掌交替呈较直的直线',
      '步幅 30-50 厘米，常沿田埂、墙根与林缘行进',
    ],
    feces: '长条形，末端常尖细并有毛发与骨屑，多在显眼处标记。',
    dangerLevel: 'L2',
    possibleInjury: '咬伤与抓伤；核心风险是狂犬病病毒传播，以及犬瘟热等人畜共患问题。',
    safetyMeasures:
      '不接触、不靠近、不投喂任何行为反常的狐（白天主动靠近、畏光、攻击性强、流涎）；家畜与宠物按时接种狂犬疫苗；发现病死狐狸不要徒手处置，报告当地动物疫控或疾控部门。',
    biteFirstAid:
      '立即用流动清水与肥皂水反复冲洗伤口至少 15 分钟，覆盖清洁敷料；不切开、不吸吮、不冰敷；尽快到有资质的狂犬病暴露处置门诊就医，按医嘱接种狂犬病疫苗与免疫球蛋白，并处理破伤风；记住动物外形与去向。',
    distribution: '广泛分布于中国各省区。',
    identificationConfidence: 'B',
    tags: ['犬科', '狂犬病', '夜行', '病媒风险'],
    meta: meta({ dangerLevel: 'L2', sources: pick('field_guide_cn', 'cdc', 'rc_firstaid') }),
  },
  {
    id: 'animal-badger',
    animalClass: 'mammal',
    name: '狗獾',
    scientificName: 'Meles leucurus',
    aliases: ['獾', '猹'],
    image: undefined,
    appearance:
      '体长 50-70 厘米，体重 6-10 公斤；体粗壮，头背灰白与黑色纵纹相间（面部白底黑纹），吻长而尖，四肢短健、爪长而有力。',
    habitat: '丘陵、山地林缘、农田与河滩，群居于挖掘的洞穴系统。',
    activityTime: '夜间为主。',
    behavior: '挖掘能力强，洞道深长；被逼迫或在洞口遭遇时会龇牙抵抗，前爪抓刨有力，咬合不放。',
    diet: '杂食：蚯蚓、昆虫、鼠类、蛙类、植物根茎与落果。',
    tracks: [
      '五趾印，爪痕长而明显（前爪更长），掌垫呈横列，前掌印宽 5-7 厘米',
      '洞口常有扇形挖掘出的松土与拖拉痕迹',
    ],
    feces: '成堆条状，含昆虫甲壳与植物残渣，多在洞口附近与路径上标记。',
    dangerLevel: 'L2',
    possibleInjury: '深度咬伤与抓伤，伤口污染严重、感染率高；可能传播狂犬病与细小病毒等。',
    safetyMeasures:
      '夜间行走使用照明，发现洞穴与翻土痕迹绕行；不掏洞、不堵洞驱赶、不接触个体；宠物与家畜避免接触其活动区；不徒手处置死亡个体。',
    biteFirstAid:
      '用大量流动清水与肥皂水冲洗伤口至少 15 分钟，覆盖清洁敷料并适度加压止血；不切开、不吸吮；尽快就医清创并评估狂犬病与破伤风预防；记住动物外形与遭遇地点。',
    distribution: '中国大部分省区（东北、华北、华东、西南、西北等地）。',
    identificationConfidence: 'C',
    identificationNote:
      '狗獾与猪獾外形接近（猪獾鼻端裸露似猪、面部黑纹较宽），野外快速识别易混淆，建议以鼻端与面部纹路综合判断，必要时以照片请专业人员复核。',
    tags: ['鼬科', '洞穴', '夜行', '抓咬伤'],
    meta: meta({ dangerLevel: 'L2', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },
  {
    id: 'animal-mole',
    animalClass: 'mammal',
    name: '华南缺齿鼹',
    scientificName: 'Mogera insularis',
    aliases: ['鼹鼠', '地爬子'],
    image: undefined,
    appearance:
      '体长 10-16 厘米，体重 40-80 克；圆筒形，毛细密如天鹅绒（灰黑或深褐），眼极小且被毛覆盖，吻突出，前肢短宽如铲、掌心向外。',
    habitat: '湿润的农田、林地、草地与庭院疏松土壤中。',
    activityTime: '全天在地下活动。',
    behavior:
      '终身营地下生活，挖掘隧道觅食，地面可见鼹鼠丘（推土堆）；极少到地面，对人基本无攻击性。',
    diet: '地下昆虫、蚯蚓、幼虫与部分植物根系。',
    tracks: [
      '少见完整足印；地面活动时留下细小的爪痕与拖曳痕',
      '典型间接痕迹：隧道隆起的土脊与直径约 10-15 厘米的锥形推土堆',
    ],
    feces: '少见，多在隧道内；地面偶见含昆虫残体的小颗粒。',
    dangerLevel: 'L0',
    possibleInjury: '几乎无直接风险；可能啃咬农作物根系造成损害。',
    safetyMeasures:
      '不抓捕、不掏挖其洞道；处理园艺与土壤作业时注意其隧道，避免踩塌伤及自身与动物。',
    biteFirstAid:
      '被抓咬极少发生。若发生，用流动清水与肥皂水冲洗伤口，覆盖清洁敷料，视情况就医；不徒手玩弄活体。',
    distribution: '中国南方与东南沿海各省区。',
    identificationConfidence: 'C',
    identificationNote:
      '鼹鼠科多种外形极相似，非专业人员难以在野外准确区分种属，本条目按常见广布类群描述，识别置信度为 C。',
    tags: ['食虫目', '地下生活', '农业'],
    meta: meta({ dangerLevel: 'L0', sources: pick('field_guide_cn') }),
  },
  {
    id: 'animal-bat',
    animalClass: 'mammal',
    name: '蝙蝠（常见洞栖种类）',
    scientificName: 'Chiroptera spp.',
    aliases: ['翼手目', '夜蝙蝠'],
    image: undefined,
    appearance:
      '小型至中型哺乳动物，前肢特化为翼膜，体长 5-15 厘米；中国常见种类如菊头蝠、蹄蝠、伏翼，多为灰褐至黑褐色，齿尖锐。',
    habitat: '洞穴、岩缝、树洞、桥墩与建筑缝隙，晨昏与夜间飞行捕食。',
    activityTime: '黄昏至黎明（夜行性）。',
    behavior:
      '群栖，回声定位导航；通常回避人类，但可能被惊扰飞入居所、落入帐篷或低空掠过；不徒手接触任何蝙蝠。',
    diet: '昆虫（多数种类）、花蜜与果实（少数种类）。',
    tracks: [
      '几乎无地面足迹；间接痕迹为洞壁粪堆、尿渍与栖息处磨亮的岩面',
      '粪便细小如鼠粪，常成片堆积于栖息点下方',
    ],
    feces: '颗粒状，长 3-8 毫米，大量堆积于洞穴与栖息结构下方，干燥后易形成粉尘（含病原）。',
    dangerLevel: 'L3',
    possibleInjury:
      '咬伤（徒手抓握或发现落巢幼蝠时）；核心风险为狂犬病病毒——多数人群被蝙蝠咬伤可无痛而不被察觉，另可因吸入洞穴粉尘暴露于组织胞浆菌等病原。',
    safetyMeasures:
      '不徒手抓握、不接触落巢或困住的蝙蝠，用厚手套与纸箱隔离后联系野生动物救助；居所发现蝙蝠时关闭房间门、开窗让其自行飞出，检查有无可能的咬痕（尤其儿童、醉酒与睡眠者）；洞穴探险佩戴口罩，避免搅动粪尘。',
    biteFirstAid:
      '任何与蝙蝠的直接接触（咬、抓、唾液污染破损皮肤或黏膜）都按狂犬病暴露处理：立即用流动清水与肥皂水冲洗伤口至少 15 分钟，覆盖敷料，不切开、不吸吮、尽快到狂犬病暴露处置门诊就医并接种疫苗；记住蝙蝠外形、接触方式与时间。',
    distribution: '全国各省区均有分布，洞穴型种类在南方岩溶地区尤为常见。',
    identificationConfidence: 'C',
    identificationNote:
      '蝙蝠种类繁多且野外难以逐一鉴别，本条描述洞栖常见类群的通用风险；具体种属需凭标本或高清照片由专业人员鉴定。',
    tags: ['飞行哺乳类', '狂犬病', '洞穴', '病毒宿主'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('cdc', 'field_guide_cn', 'rc_firstaid', 'who_firstaid'),
    }),
  },

  /* ============ 鸟类 bird ============ */
  {
    id: 'animal-pheasant',
    animalClass: 'bird',
    name: '环颈雉',
    scientificName: 'Phasianus colchicus',
    aliases: ['野鸡', '雉鸡'],
    image: undefined,
    appearance:
      '雄鸟体长 60-80 厘米（含长达 40 厘米的尾羽），颈有白色环带，头颈金属绿紫色，体羽金棕带黑斑；雌鸟较小，羽色暗淡具横斑，尾亦长。',
    habitat: '农田、灌丛、林缘、荒坡与草丛，几乎不飞远，遇险多奔走或短距爆发飞行。',
    activityTime: '晨昏为主，白天隐蔽于草丛。',
    behavior:
      '警觉性强，多在地面刨食；受惊突然起飞并发出响亮振翅声，飞行路线短促弯曲；育雏期雄鸟有领域行为。',
    diet: '种子、浆果、嫩叶、谷物与昆虫。',
    tracks: [
      '三趾向前、一趾向后的脚印，趾细长，趾端有钝爪，步印长约 4-6 厘米',
      '常见爪刨开地表落叶的扇形痕迹与拖尾痕',
    ],
    feces: '螺旋盘绕的条状，一端常带白色尿酸盐帽，多在取食地与栖枝下方。',
    dangerLevel: 'L1',
    possibleInjury: '基本不主动攻击人；突然起飞可能惊吓行人或骑车者，雄鸟在繁殖期可能扑击。',
    safetyMeasures: '保持距离不驱赶，尤其繁殖期绕行；不捡拾巢卵与雏鸟；夜间行走注意其突然起飞。',
    biteFirstAid:
      '通常无需处置。若被啄伤或抓伤，用流动清水与肥皂水冲洗，覆盖清洁敷料；出现红肿化脓就医。',
    distribution: '中国各省区广泛分布。',
    identificationConfidence: 'B',
    tags: ['雉科', '林缘', '农田'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'iucn') }),
  },
  {
    id: 'animal-crow',
    animalClass: 'bird',
    name: '大嘴乌鸦',
    scientificName: 'Corvus macrorhynchos',
    aliases: ['乌鸦', '老鸹'],
    image: undefined,
    appearance:
      '体长 40-50 厘米，体重 350-600 克；通体黑色带紫蓝金属光泽，喙粗大而厚，额部羽毛蓬起呈披散状。',
    habitat: '山地林区、村庄、城镇与垃圾场，适应力极强。',
    activityTime: '白天为主，晨昏集群。',
    behavior:
      '高智商、记忆力强，会记住投掷或威胁过它的人；育雏期与集群受到惊扰时可能俯冲啄击头部；不主动接近时风险很低。',
    diet: '杂食：昆虫、鼠类、鸟蛋与雏鸟、腐肉、垃圾与人类食物残渣。',
    tracks: [
      '四趾三前一后的鸟印，趾端爪痕清晰，印长约 5-7 厘米，常成行走序列',
      '枝头与地面偶见脱落的黑色羽片',
    ],
    feces: '白色与深色混合的糊状，多在栖息枝与建筑边缘，含尿酸盐。',
    dangerLevel: 'L1',
    possibleInjury: '俯冲时喙啄头面与眼部抓伤；一般限于繁殖期的防御行为。',
    safetyMeasures:
      '繁殖期（春季）经过有巢树下时快速通过、戴帽遮挡；不投掷、不掏鸟巢、不捡拾雏鸟；被俯冲时举起伞或帽子遮挡并离开，不追逐。',
    biteFirstAid:
      '若头面部被啄伤，用流动清水冲洗伤口并压迫止血，覆盖清洁敷料；眼部受伤立即就医；伤口较深者就医评估。',
    distribution: '中国各省区广泛分布。',
    identificationConfidence: 'B',
    tags: ['鸦科', '城镇', '繁殖期防御'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn') }),
  },
  {
    id: 'animal-eagle',
    animalClass: 'bird',
    name: '金雕',
    scientificName: 'Aquila chrysaetos',
    aliases: ['老雕', '鹫雕'],
    image: undefined,
    appearance:
      '大型猛禽，体长 76-103 厘米，翼展 1.8-2.3 米；体羽深褐，枕部与颈后羽毛金黄褐色，喙强力钩曲，足粗壮具长而锐利的钩爪。',
    habitat: '山地、丘陵与草原的开阔地带，喜在悬崖与高大乔木营巢与瞭望。',
    activityTime: '白天为主，晨昏活动频繁。',
    behavior:
      '领域性极强，飞行范围广；会攻击靠近巢区的动物与人，俯冲时爪击可造成严重撕裂伤；对地面活动的亮色物体与小动物敏感。',
    diet: '野兔、鼠类、旱獭、雉类与中小型兽类，也食腐。',
    tracks: [
      '大型三前一后鸟印，趾粗壮，爪痕深而弯曲，印长约 8-12 厘米',
      '栖枝下常有羽毛、粪便与猎物残骸',
    ],
    feces: '量大、白色糊状带深色内含物，多在悬崖巢下与栖枝处喷溅状分布。',
    dangerLevel: 'L2',
    possibleInjury: '俯冲爪击与喙啄造成的深部撕裂伤、眼部损伤，可能伤及头面部与手臂。',
    safetyMeasures:
      '进入有猛禽巢区的山地时保持警觉，不靠近崖壁巢区；育雏期绕行并遮挡头部；不驱赶、不掏巢、不投喂；野外作业佩戴帽子与护目镜可降低头面风险。',
    biteFirstAid:
      '被爪击或喙啄致较深伤口时，直接加压止血，用干净敷料覆盖，冲洗可见污染；不拔出深嵌物；头面部、眼部与肌腱部位受伤立即就医清创；记住猛禽外形与巢区位置。',
    distribution: '中国北方、西部与西南山地，亦见于中部部分地区。',
    identificationConfidence: 'B',
    tags: ['猛禽', '俯冲攻击', '山地'],
    meta: meta({ dangerLevel: 'L2', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },
  {
    id: 'animal-owl',
    animalClass: 'bird',
    name: '雕鸮',
    scientificName: 'Bubo bubo',
    aliases: ['猫头鹰', '老鸱'],
    image: undefined,
    appearance:
      '大型鸮类，体长 58-71 厘米，翼展约 1.6 米；体羽棕褐具黑色纵斑，面盘不明显，头顶有显著耳状羽簇，眼大而前视，喙钩曲。',
    habitat: '山地林缘、岩壁、废弃建筑与沟谷，白天栖于隐蔽处。',
    activityTime: '夜间为主。',
    behavior:
      '伏击型猎食，飞行几乎无声；受惊或护巢时会张翅、发出嘶声并可能扑击，爪力强；白天多静伏不鸣叫。',
    diet: '鼠类、野兔、刺猬、鸟类与蛙类。',
    tracks: [
      '四趾印（可一侧两趾转向后），爪痕深，印长 6-9 厘米',
      '典型痕迹为成堆的食丸（含毛发与骨屑的团块）与栖枝下的羽毛',
    ],
    feces: '白色糊状喷溅，混有毛发骨屑，多在栖枝与巢下。',
    dangerLevel: 'L1',
    possibleInjury: '夜间扑击可致眼部与头面部抓伤、手臂撕裂伤；风险低但后果可能较重。',
    safetyMeasures:
      '夜间山林行走使用头灯，发现栖息个体绕行；不靠近巢区、不掏洞巢与崖巢；不捕捉、不把玩幼鸟。',
    biteFirstAid:
      '被抓伤或啄伤时直接加压止血，用干净敷料覆盖并冲洗伤口；头面部与眼部受伤立即就医；出现肌腱活动受限或深部疼痛应就医评估。',
    distribution: '中国北方、西部、西南与中部多地。',
    identificationConfidence: 'B',
    tags: ['鸮形目', '夜行', '猛禽'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },
  {
    id: 'animal-egret',
    animalClass: 'bird',
    name: '白鹭',
    scientificName: 'Egretta garzetta',
    aliases: ['小白鹭', '鹭鸶'],
    image: undefined,
    appearance:
      '中型涉禽，体长 55-65 厘米；通体白色，喙黑而细长，腿长黑色、趾黄绿色，繁殖期枕后有两根细长饰羽，背上有丝状蓑羽。',
    habitat: '稻田、溪流、河滩、湿地与鱼塘，常在浅水区踱步觅食。',
    activityTime: '白天为主，晨昏觅食活跃。',
    behavior:
      '受惊时展翅低飞、颈部缩成 S 形；集群营巢于树上（鹭巢）；不主动攻击人，护巢期偶有俯冲。',
    diet: '小鱼、虾、蛙类与水生昆虫。',
    tracks: [
      '细长三前一后鸟印，趾间无蹼但趾极长，印长约 6-8 厘米，泥滩上呈直线序列',
      '浅水与泥地上常有长喙探啄的小孔',
    ],
    feces: '白色糊状，多在巢下树枝与岸边，含羽毛与骨屑。',
    dangerLevel: 'L1',
    possibleInjury: '几乎无攻击性；护巢期俯冲时长喙可能划伤头面，风险很低。',
    safetyMeasures: '不靠近鹭巢与繁殖林；在湿地行走保持距离，不驱赶取食个体；不捡拾鸟蛋。',
    biteFirstAid:
      '若被划伤，用流动清水冲洗伤口并压迫止血，覆盖清洁敷料；伤口较深或位于面部、眼部附近应就医。',
    distribution: '中国中东部、南方与西南的湿地与农田广泛分布。',
    identificationConfidence: 'B',
    tags: ['鹭科', '湿地', '涉禽'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'iucn') }),
  },
  {
    id: 'animal-goose',
    animalClass: 'bird',
    name: '鸿雁',
    scientificName: 'Anser cygnoides',
    aliases: ['大雁', '野鹅'],
    image: undefined,
    appearance:
      '大型雁类，体长 80-94 厘米；上体灰褐色、下体近白色，喙黑色且基部有白色胼胝，颈长，飞行时排成"一"字或"人"字。',
    habitat: '湖泊、沼泽、河滩与农田，越冬期集群在开阔水域与收割后的田地。',
    activityTime: '白天与晨昏取食，夜间多在水面或滩地休息。',
    behavior:
      '成群活动，警惕性高；繁殖期与受惊群体有驱赶行为，会伸颈张喙扑向靠近者；家养化个体（如看护犬群的看家雁）攻击性更强。',
    diet: '水草、嫩叶、草根、谷物与田间落粒。',
    tracks: [
      '三前一后带蹼的鸟印，趾间蹼印清晰，印长 8-12 厘米，常成两列并行',
      '滩地与田埂上有成片的行走序列与啄食小坑',
    ],
    feces: '成堆绿色糊状，量大，多在休息地与取食地成片分布。',
    dangerLevel: 'L2',
    possibleInjury: '喙啄（可致皮下出血与淤青）、翅扑造成的挫伤，护巢期可能连续追击。',
    safetyMeasures:
      '不靠近雁群的休息地与巢区，绕行通过；繁殖期保持 50 米以上距离；不投喂、不捡拾雁蛋；被张喙威吓时缓慢后退，不挥舞手臂对峙。',
    biteFirstAid:
      '被啄伤或抓伤后用流动清水与肥皂水冲洗，覆盖清洁敷料并压迫止血；出现持续疼痛、肿胀或活动受限就医；头面部受伤及时就诊。',
    distribution: '中国东北、华北、华中与长江中下游的湿地与越冬地。',
    identificationConfidence: 'B',
    tags: ['雁形目', '湿地', '护巢行为'],
    meta: meta({ dangerLevel: 'L2', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },

  /* ============ 爬行类 reptile ============ */
  {
    id: 'animal-cobra',
    animalClass: 'reptile',
    name: '眼镜王蛇',
    scientificName: 'Ophiophagus hannah',
    aliases: ['过山峰', '山万蛇', '眼镜蛇王'],
    image: undefined,
    appearance:
      '世界上体型最大的毒蛇，中国记录体长常见 2-3 米、最长可超 4 米；颈背可扁平呈"披风"状并有镜状斑纹，背部橄榄褐至黑色，头椭圆、头背有大鳞。',
    habitat: '热带与亚热带常绿阔叶林、竹林、溪谷与林缘，喜在落叶层与洞穴附近活动。',
    activityTime: '白天为主，炎热时晨昏活动。',
    behavior:
      '具领域性，能将前体竖起 1/3 并张开颈部威吓，主动追击；以其他蛇类为食（食蛇性）；受惊时发出喷气声。',
    diet: '以蛇类为主，也取食蜥蜴、鼠类等。',
    tracks: [
      '无足，典型痕迹为蜿蜒爬行的"S"形身体印痕，宽 3-6 厘米的连续波状带',
      '常在落叶、沙土与泥地留下鳞片刮擦纹与拖曳线',
    ],
    feces: '常为半固态糊状或带有白色尿酸盐的团块，多在洞口与路径旁。',
    dangerLevel: 'L4',
    possibleInjury:
      '前沟牙深度咬伤，神经毒毒素可导致眼睑下垂、吞咽困难、呼吸肌麻痹甚至呼吸衰竭，排毒量大时进展迅速。',
    safetyMeasures:
      '林中行走穿高帮鞋、长裤并用手杖"打草惊蛇"；翻动枯木、石块与落叶堆前先观察；露营避开蛇洞、兽径与倒木下；遇蛇保持 2 米以上距离缓慢后退，不挑衅、不徒手捕捉；携带照明夜间行走。',
    biteFirstAid:
      '立即脱离并呼救，拨打 120；让伤肢保持在心脏水平以下并制动，去除戒指手表；用流动清水与肥皂水冲洗伤口，覆盖清洁敷料；不切开、不吸吮、不冰敷、不烧灼、不使用止血带紧扎；记住蛇的外形、颜色与花纹，尽快送往有抗蛇毒血清的医院（越快越好），途中持续观察呼吸。',
    distribution: '中国南方至西南（云南、广西、广东、福建、贵州、湖南、西藏东南部）及东南亚。',
    identificationConfidence: 'B',
    tags: ['毒蛇', '神经毒', '眼镜蛇科', '急救重点'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'wilderness_society', 'rc_firstaid', 'who_firstaid', 'nhc'),
    }),
  },
  {
    id: 'animal-mamushi',
    animalClass: 'reptile',
    name: '短尾蝮',
    scientificName: 'Gloydius brevicaudus',
    aliases: ['蝮蛇', '土夫蛇', '草上飞'],
    image: undefined,
    appearance:
      '体长 0.5-0.8 米；头呈明显的三角形，颊窝（热感应器）位于鼻眼之间，体背灰褐或棕褐色，有两行深色圆斑或"X"形斑，尾短而尖。',
    habitat: '丘陵、山地林缘、农田、石堆、溪边草丛与落叶层，与人类活动区高度重叠。',
    activityTime: '晨昏与夜间为主，雨后与闷热天白日也活动。',
    behavior:
      '伏击型，静止时极难发现，常盘卷于落叶、草丛与石缝；被踩踏或靠近时突然弹射咬人，是中国最常见的伤人毒蛇之一。',
    diet: '鼠类、蛙类、蜥蜴、鸟类与昆虫。',
    tracks: [
      '蜿蜒爬行印痕，宽 2-5 厘米的波状连续线，转弯处痕迹加深',
      '落叶与沙地上可见鳞片点状刮擦纹，常通向石堆与鼠洞',
    ],
    feces: '条状，一端常带白色尿酸盐，多在洞穴与石缝附近。',
    dangerLevel: 'L4',
    possibleInjury:
      '毒牙咬伤后局部肿胀、淤血、水疱与剧痛，可发展为血肿、组织坏死；全身可见出血倾向、恶心呕吐，严重者休克与多器官功能障碍。',
    safetyMeasures:
      '农田、石堆、柴垛与草丛作业穿高帮鞋、戴厚手套并先用棍棒翻动；夜间行走必带头灯与手杖；露营不把睡袋铺在落叶与石堆上，帐篷拉好拉链；见蛇不打、绕行，不徒手掏洞翻石。',
    biteFirstAid:
      '立即远离并呼救，拨打 120；制动伤肢（夹板或三角巾悬吊）并保持在心脏水平以下，去除戒指手表；用流动清水与肥皂水冲洗伤口，覆盖清洁敷料；不切开、不吸吮、不冰敷、不烧灼、不用止血带或嘴吸；记住蛇的外形与斑纹（可拍照），尽快送医注射抗蝮蛇毒血清并观察病情变化。',
    distribution: '中国东部、中部、南部与东北大部分省区，是分布最广的毒蛇之一。',
    identificationConfidence: 'B',
    tags: ['毒蛇', '蝮蛇科', '血循毒', '农田'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'wilderness_society', 'rc_firstaid', 'who_firstaid', 'nhc'),
    }),
  },
  {
    id: 'animal-bamboo-viper',
    animalClass: 'reptile',
    name: '竹叶青',
    scientificName: 'Trimeresurus stejnegeri',
    aliases: ['青竹蛇', '翠青蛇（误称）', '红线虫'],
    image: undefined,
    appearance:
      '体长 0.6-1 米，通体鲜绿（少数棕褐型），腹面黄白，体侧常有一条白线或红白相间的纵线，尾端砖红；头呈三角形，眼红色，瞳孔纵裂。',
    habitat: '南方山区竹林、灌丛、溪边与果园，多缠绕于低矮枝条与草上。',
    activityTime: '夜间为主，白天也常静伏于枝叶间。',
    behavior:
      '树栖伏击型，体色与环境融为一体极难察觉；被惊扰时可能甩尾或直接咬击，多在手伸向枝叶、溪边取水时被咬。',
    diet: '蛙类、蜥蜴、鼠类与鸟类。',
    tracks: [
      '蜿蜒印痕较细（宽 1-3 厘米），常见于溪边湿泥与叶面水痕',
      '竹林与灌丛地面可见断续的波状线与尾部拖痕',
    ],
    feces: '小型条状带白色尿酸盐，多在枝上与石面。',
    dangerLevel: 'L3',
    possibleInjury:
      '咬伤后局部剧烈肿胀、疼痛、淤斑与血疱，可累及整肢，一般不致死但易造成组织损伤与功能障碍。',
    safetyMeasures:
      '南方山区穿长裤与高帮鞋，采野果、取水、整理植被前先看清枝叶与手落点；不在竹林与灌丛下露营过夜；行走用手杖拨开前方枝条；见绿蛇绕行，不抓捕、不玩耍。',
    biteFirstAid:
      '立即制动伤肢并呼叫救援，拨打 120；用流动清水与肥皂水冲洗伤口，覆盖清洁敷料；不切开、不吸吮、不冰敷、不使用止血带；记住蛇的绿色体色、红尾与侧线等特征，尽快就医观察肿胀进展并由医生决定是否使用抗蛇毒血清。',
    distribution: '中国南方与西南各省区（长江以南为主）。',
    identificationConfidence: 'B',
    tags: ['毒蛇', '蝰科', '血循毒', '树栖'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('field_guide_cn', 'wilderness_society', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-alligator',
    animalClass: 'reptile',
    name: '扬子鳄',
    scientificName: 'Alligator sinensis',
    aliases: ['土龙', '猪婆龙'],
    image: undefined,
    appearance:
      '中小型鳄类，体长 1.5-2 米，体重 30-45 公斤；吻短而钝（闭嘴时下颌第四齿不外露），背部鳞甲深橄榄至灰黑色，尾侧有黄色斑纹，眼位于头顶。',
    habitat: '长江中下游丘陵的水库、池塘、河汊与芦苇滩，掘洞穴居。',
    activityTime: '白天晒背、夜间活动，捕食多在晨昏。',
    behavior:
      '伏击型掠食者，水中接近无声；受惊多迅速滑入水中并潜伏；具有领域性，靠近洞口或育幼期有攻击可能。',
    diet: '鱼、螺蚌、蛙类、水鸟与小型哺乳类。',
    tracks: [
      '拖曳的宽大身体印痕（宽 20-40 厘米），中央有腹甲刮痕与四肢爪印',
      '水边泥地可见爪趾印与扇形尾迹',
    ],
    feces: '粗条状，多在水边晒场与洞口，常与羽毛、甲壳混合。',
    dangerLevel: 'L3',
    possibleInjury: '强有力的咬合与"死亡翻转"可造成撕裂伤、骨折与肢体离断，尾部横扫也可能致挫伤。',
    safetyMeasures:
      '在鳄鱼活动水域岸边行走保持距离，不在水边洗涤、取水与露营；不靠近洞口、不投喂、不翻越围栏；夜间使用照明避开水岸边缘；携儿童与宠物全程看护。',
    biteFirstAid:
      '立即脱离并呼救，拨打 120；大出血用干净敷料直接持续按压（深部伤口以填塞加压为主），不拔出嵌入的异物；断肢用清洁敷料包裹后放入干净塑料袋浸于冰水外层，随伤者立即送医；不切开、不吸吮，持续监测意识与呼吸，尽快手术清创与修复。',
    distribution:
      '中国安徽、浙江、江苏等地的局部水域（野外种群稀少，属国家一级保护动物，严禁捕捉与伤害）。',
    identificationConfidence: 'B',
    tags: ['鳄目', '水域', '咬伤', '保护动物'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-python',
    animalClass: 'reptile',
    name: '缅甸蟒',
    scientificName: 'Python bivittatus',
    aliases: ['南蛇', '蟒蛇'],
    image: undefined,
    appearance:
      '大型无毒蛇，体长常见 3-4 米、最长可超 5 米，体重可达数十至上百公斤；体背黄褐至灰褐色，有深褐色大块云斑，头较大、吻端有热感窝。',
    habitat: '热带与南亚热带的森林、灌丛、溪谷与农林交错带，善游泳与攀爬。',
    activityTime: '夜行为主。',
    behavior:
      '无毒，但靠缠绕制服猎物，力量极大；通常回避人类，被逼迫、受惊或误抓时会咬住不放并缠绕；繁殖期与护食时更易攻击。',
    diet: '鸟类、小型兽类、蛙与家禽家兔。',
    tracks: [
      '连续蜿蜒爬行带，宽 5-15 厘米，边缘有规律的鳞片刮纹',
      '泥地与沙地上呈"S"形长带，转弯处可见身体压出的凹槽',
    ],
    feces: '粗长条状，一端常带白色尿酸盐，多在洞穴与石下。',
    dangerLevel: 'L2',
    possibleInjury:
      '多排细密倒钩齿咬伤可致出血与感染；缠绕可造成压迫性损伤（大面积者有窒息风险），但不注入蛇毒。',
    safetyMeasures:
      '南方林区与溪谷行走注意倒木、石缝与水边；不徒手翻动大型蛇类，不抓捕、不挑逗；发现大蛇绕行并通知林业部门；露营将食物密封并避免在蛇类通道上扎营。',
    biteFirstAid:
      '若蛇不松口，用清水浇淋其吻部或轻撬齿列使其松脱，切勿硬拉造成撕裂伤；用流动清水与肥皂水彻底冲洗伤口，覆盖清洁敷料并加压止血；不切开、不吸吮；若被缠绕，先解除缠绕并保持气道通畅，随后尽快就医清创、评估肌腱损伤与破伤风预防；记住蛇的斑纹与体型。',
    distribution: '中国云南、广西、广东、福建、贵州等热带与南亚热带地区。',
    identificationConfidence: 'B',
    tags: ['蟒科', '无毒蛇', '缠绕风险', '南方林区'],
    meta: meta({ dangerLevel: 'L2', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },
  {
    id: 'animal-turtle',
    animalClass: 'reptile',
    name: '中华鳖',
    scientificName: 'Pelodiscus sinensis',
    aliases: ['甲鱼', '团鱼', '王八'],
    image: undefined,
    appearance:
      '中小型淡水鳖，背甲长 10-25 厘米，革质软甲无角质盾片，橄榄绿至黄褐色，吻部延长呈管状，四肢具蹼与利爪。',
    habitat: '江河、湖泊、池塘与水库的缓流水域，喜潜伏淤泥与水草间。',
    activityTime: '白天潜伏，晨昏与夜间活动。',
    behavior:
      '受惊时迅速潜入水中或缩入泥沙；被抓住时会伸长颈部咬住不放（咬合持久、不轻易松口），也会用爪抓挠。',
    diet: '鱼虾、螺蚌、水生昆虫与动物尸体。',
    tracks: ['水边泥地可见四肢蹼趾印与拖曳的椭圆形身体痕', '常有爪子刨出的浅坑与潜伏凹槽'],
    feces: '多在水中，岸边少见，偶见带白色尿酸盐的软条。',
    dangerLevel: 'L1',
    possibleInjury: '咬伤可造成持续性咬合撕裂与出血，爪可抓伤手足；水中抓握易失手。',
    safetyMeasures:
      '不徒手抓握鳖类，抓握时从背甲后缘双手托持并远离头部；发现时不掏挖、不追逐；养殖与野外个体均避免直接用手接触其吻部。',
    biteFirstAid:
      '被咬住时保持冷静，可用清水浇其鼻孔或轻触使其松口，切勿猛拽；松口后用流动清水与肥皂水冲洗伤口、加压止血、覆盖敷料；伤口较深或污染明显应就医清创并评估破伤风预防。',
    distribution: '中国南北多数地区的淡水水域（亦有大量养殖）。',
    identificationConfidence: 'B',
    tags: ['龟鳖目', '淡水', '咬伤'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'rc_firstaid') }),
  },

  /* ============ 两栖类 amphibian ============ */
  {
    id: 'animal-toad',
    animalClass: 'amphibian',
    name: '中华蟾蜍',
    scientificName: 'Bufo gargarizans',
    aliases: ['癞蛤蟆', '疥蛤蟆'],
    image: undefined,
    appearance:
      '体长 6-12 厘米；皮肤粗糙满布大小疣粒，背色灰褐、土黄并杂有深色斑，耳后腺（毒腺）呈长椭圆形明显隆起，四肢短壮。',
    habitat: '林下、草丛、农田、庭院与石缝，雨后与夜间在路灯下与水边活动。',
    activityTime: '夜间为主，雨后活动频繁。',
    behavior:
      '行动缓慢，遇险多伏地不动或缓慢爬行；受刺激时耳后腺分泌白色毒液；不抓握、不揉眼后再接触口鼻。',
    diet: '蜗牛、蛞蝓、甲虫、蚂蚁等农林害虫。',
    tracks: [
      '少见清晰足印，湿泥上可见短趾的前足印（宽约 2-3 厘米）与拖曳痕',
      '雨后路面常见缓慢爬行的短距痕迹',
    ],
    feces: '软条状，多在石下、草根与墙角。',
    dangerLevel: 'L3',
    possibleInjury:
      '耳后腺与皮肤分泌的蟾蜍毒素（强心甾类）可引起局部麻木、红肿，误食或经眼、口黏膜吸收可致心律失常、恶心呕吐与心脏骤停风险。',
    safetyMeasures:
      '不徒手抓握、不玩耍、更不食用蟾蜍及其分泌物；接触后立即洗手、不揉眼睛；发现时绕行，不带回家；儿童接触后出现口唇麻木立即就医并说明接触史。',
    biteFirstAid:
      '皮肤接触：立即用大量流动清水冲洗污染部位与双手，脱去污染衣物，就医观察；眼接触：持续冲洗眼睛至少 15 分钟并尽快眼科就诊；误食：立即拨打 120 或就近急诊，携带剩余物或拍照，不自行催吐（遵医嘱），途中监测意识与心率。',
    distribution: '中国南北多数省区，为最常见的蟾蜍之一。',
    identificationConfidence: 'B',
    tags: ['蟾蜍', '毒腺', '黏膜暴露', '儿童风险'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('field_guide_cn', 'rc_firstaid', 'who_firstaid', 'nhc'),
    }),
  },
  {
    id: 'animal-frog',
    animalClass: 'amphibian',
    name: '黑斑蛙',
    scientificName: 'Pelophylax nigromaculatus',
    aliases: ['青蛙', '田鸡（俗名）'],
    image: undefined,
    appearance:
      '体长 5-9 厘米；背绿色或黄绿色，沿背中线有两条淡黄色纵脊，散布黑色圆斑，腹面白色，后肢长有蹼。',
    habitat: '稻田、池塘、沟渠与湿润草地，白天多伏于水边草丛。',
    activityTime: '夜间为主，白天亦可见。',
    behavior: '受惊长距离跳跃入水；不主动攻击人；皮肤湿润需保持水分，离水时间长会衰弱。',
    diet: '昆虫、蚯蚓与小型无脊椎动物。',
    tracks: [
      '湿泥上可见成对的后足蹬印（趾细长带蹼）与前足小印',
      '水边与田埂有连续跳跃落点，间距 30-80 厘米',
    ],
    feces: '软条状，多在水边草丛。',
    dangerLevel: 'L1',
    possibleInjury:
      '本身毒性极低，抓握一般无严重后果；主要风险是野生个体可能携带寄生虫（如裂头蚴）与细菌，以及来源不明个体的未知风险。',
    safetyMeasures:
      '不徒手长时间抓握，接触后彻底洗手；不食用任何野生蛙类与蝌蚪（避免裂头蚴等寄生虫感染）；不带野生个体回营地饲养；被咬抓伤按一般伤口处理。',
    biteFirstAid:
      '用流动清水与肥皂水冲洗伤口，覆盖清洁敷料；若伤口较深或出现红肿发热就医；若曾有生食或以蛙敷贴伤口的史（裂头蚴高风险行为），应尽快就医说明情况。',
    distribution: '中国东部、中部、南部与东北部分地区的平原丘陵水域。',
    identificationConfidence: 'B',
    tags: ['蛙科', '寄生虫风险', '稻田'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'nhc', 'rc_firstaid') }),
  },
  {
    id: 'animal-salamander',
    animalClass: 'amphibian',
    name: '中国大鲵',
    scientificName: 'Andrias davidianus',
    aliases: ['娃娃鱼', '狗鱼'],
    image: undefined,
    appearance:
      '世界上最大的两栖动物，体长常见 0.6-1.5 米、最大可超 1.8 米；头大而扁、口裂宽，眼小无眼睑，体背棕褐并有不规则深色斑，皮肤湿润多黏液，四肢短小。',
    habitat: '山溪、岩洞与清凉洁净的深潭，昼伏夜出，对水质与水温要求高。',
    activityTime: '夜间为主。',
    behavior: '伏击型，行动迟缓，通常不主动攻击人；被抓住时可能咬合不放；受惊退入石缝与洞穴。',
    diet: '鱼、蟹、蛙、水生昆虫与小型水鸟（大型个体）。',
    tracks: [
      '溪底与湿石上可见圆钝的四肢掌印与拖曳的宽大身体痕',
      '洞口与石缝外偶见黏液拉丝与光滑擦痕',
    ],
    feces: '软条状，多在洞穴与石下。',
    dangerLevel: 'L1',
    possibleInjury:
      '咬合可造成持续性咬伤与出血；主要风险是非法捕捉与误伤保护动物，以及接触其皮肤黏液后未洗手导致的黏膜暴露。',
    safetyMeasures:
      '野生大鲵为国家保护动物，发现时不捕捉、不骚扰、不投喂，远离并报告林业部门；溪流中翻动石块时小心其藏身缝隙；不徒手抓握大型个体。',
    biteFirstAid:
      '被咬后让其自然松口或用清水浇淋吻部，切勿猛拽；随后用流动清水与肥皂水冲洗伤口、加压止血、覆盖敷料，就医评估肌腱损伤与破伤风；若为保护动物相关伤害事件，按当地规定报告。',
    distribution: '中国长江、珠江及黄河上游的山溪流域（野外种群稀少）。',
    identificationConfidence: 'B',
    tags: ['有尾目', '保护动物', '溪流'],
    meta: meta({ dangerLevel: 'L1', sources: pick('field_guide_cn', 'iucn', 'rc_firstaid') }),
  },

  /* ============ 鱼类 fish ============ */
  {
    id: 'animal-pufferfish',
    animalClass: 'fish',
    name: '河鲀（东方鲀类）',
    scientificName: 'Takifugu spp.',
    aliases: ['河豚', '气泡鱼', '鸡泡鱼'],
    image: undefined,
    appearance:
      '体长 15-30 厘米，体短圆，无鳞或被小刺，受惊时吞水使腹部膨成球状；背部灰褐有斑纹，腹面白，口小、齿板愈合成喙状。',
    habitat: '近海、河口与部分淡水水域，春季常洄游入江河产卵。',
    activityTime: '多在底层活动，昼夜均可见。',
    behavior:
      '遇险膨胀并竖起体表小刺；其内脏、卵巢、肝脏与皮肤富含河鲀毒素（TTX），属剧毒物质，中毒无特效解毒药。',
    diet: '底栖贝类、甲壳类与小鱼。',
    tracks: ['无足；主要痕迹为被冲上岸的个体与渔网中的滑溜体表', '河口浅滩偶见其栖息翻动的底泥'],
    feces: '软质，多在水底，岸边少见。',
    dangerLevel: 'L4',
    possibleInjury:
      '误食河鲀毒素中毒：口唇与舌尖麻木、呕吐腹泻，进而四肢无力、呼吸困难，严重者可在数小时内因呼吸衰竭死亡。',
    safetyMeasures:
      '不捕捞、不购买、不加工、不食用任何野生河鲀及其制品（含内脏与卵）；不听信"土法处理可去毒"的说法；聚餐中发现疑似河鲀的鱼肉立即停止食用并保留样品；中毒风险无家庭处理方法可规避。',
    biteFirstAid:
      '误食后立即拨打 120 或急送医院，告知进食河鲀及时间与剂量；保留剩余食物与呕吐物供检验；不要自行催吐（意识不清者绝对禁止），保持侧卧防误吸，监测呼吸与意识；出现口唇麻木或呼吸困难按急救原则处理并尽快就医，途中随时准备心肺复苏。',
    distribution: '中国沿海各省及长江下游河口，常见种类如红鳍东方鲀、暗纹东方鲀。',
    identificationConfidence: 'B',
    tags: ['毒素', '食品安全', '剧毒', '急救重点'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('cdc', 'nhc', 'who_firstaid', 'rc_firstaid', 'usda_food'),
    }),
  },
  {
    id: 'animal-stingray',
    animalClass: 'fish',
    name: '赤魟',
    scientificName: 'Dasyatis akajei',
    aliases: ['魟鱼', '黄貂鱼', '蒲扇鱼'],
    image: undefined,
    appearance:
      '体盘菱形、扁平，宽 30-60 厘米；背灰褐至橄榄色，腹面白，尾细长如鞭，尾背有一至数枚带倒锯齿的毒棘，体表光滑无鳞。',
    habitat: '近海沙泥底、河口与咸淡水区域，常半埋于泥沙中。',
    activityTime: '昼夜均活动，多在底层。',
    behavior: '平时温顺、静伏海底，被踩踏或踩到尾棘时向后上方甩尾刺击；尾棘可刺穿鞋底与潜水服。',
    diet: '底栖贝类、甲壳类与小鱼。',
    tracks: ['浅海底可见椭圆形伏卧压痕与扇形鳍缘刮纹', '沙滩上偶见其游动留下的"V"形尾迹与中心拖痕'],
    feces: '软质团块，多在海底，岸边少见。',
    dangerLevel: 'L3',
    possibleInjury:
      '尾棘刺伤（常在足底），毒液导致剧烈疼痛、肿胀、出血与组织坏死，继发感染常见，严重者可出现全身症状。',
    safetyMeasures:
      '在浅海、河口涉水与赶海时穿防刺鞋或厚底鞋，行走用脚"滑步"试探前方泥沙；不徒手翻动海底、不抓握其尾部；发现魟鱼绕行；处理渔获时先剪除或避开尾棘。',
    biteFirstAid:
      '立即离开水域并呼救，拨打 120；伤处用温热淡水冲洗（毒素多为蛋白性，避免酒精直接冲洗创口），用干净敷料覆盖；先将刺伤处浸入 40-45℃ 热水 30-90 分钟以缓解疼痛（以不烫伤为限），不切开、不吸吮；棘刺嵌入者不盲目拔除，制动后尽快就医手术取出并清创、评估破伤风与抗感染。',
    distribution: '中国沿海及河口咸淡水区域。',
    identificationConfidence: 'B',
    tags: ['软骨鱼', '毒棘', '赶海安全'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('wilderness_society', 'field_guide_cn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-catfish',
    animalClass: 'fish',
    name: '黄颡鱼',
    scientificName: 'Tachysurus fulvidraco',
    aliases: ['黄辣丁', '昂刺鱼', '嘎鱼'],
    image: undefined,
    appearance:
      '体长 10-25 厘米，头扁平、口有须 4 对，体背黄绿色、腹面黄色，体侧常有暗色横斑；背鳍与胸鳍各有一枚硬棘，棘缘有锯齿并连毒腺。',
    habitat: '江河、湖泊、池塘与水库的缓流底层，喜浑浊水域与石缝。',
    activityTime: '夜间为主。',
    behavior: '底层夜行性；被抓住时胸鳍硬棘张开并左右摆动，可刺穿手指，引起剧痛与局部肿胀。',
    diet: '水生昆虫、小虾、螺与小鱼。',
    tracks: ['基本无地面痕迹；渔获与水底活动留下轻微底泥翻动', '垂钓者常以其棘刺伤手为典型"痕迹"'],
    feces: '软条，多在水底。',
    dangerLevel: 'L2',
    possibleInjury:
      '硬棘刺伤手指或足底，毒液引起灼样剧痛、局部红肿，伤口易继发感染；棘可能折断残留体内。',
    safetyMeasures:
      '抓握时从胸鳍后方按住并避开硬棘，或戴防刺手套；处理渔获时先用布包裹再取钩；赤足下水穿涉水鞋，避免踩到水底个体。',
    biteFirstAid:
      '被刺伤后立即用流动清水冲洗，若棘折断残留不自行深挖取出；疼痛可先浸入温热水中缓解（以不烫伤为限）；覆盖清洁敷料后就医，由医生取出残留棘并清创、评估破伤风预防；出现红肿扩散、发热应尽快复诊。',
    distribution: '中国各大水系与淡水湖泊常见。',
    identificationConfidence: 'B',
    tags: ['鲶形目', '毒棘', '垂钓风险'],
    meta: meta({ dangerLevel: 'L2', sources: pick('field_guide_cn', 'rc_firstaid') }),
  },

  /* ============ 高危兽类 dangerous ============ */
  {
    id: 'animal-leopard',
    animalClass: 'dangerous',
    name: '豹（金钱豹）',
    scientificName: 'Panthera pardus',
    aliases: ['金钱豹', '花豹'],
    image: undefined,
    appearance:
      '大型猫科，体长 1-1.5 米（不含尾），体重 30-70 公斤；体黄褐至棕黄，遍布黑色环状斑（中空玫瑰斑），尾长、头部相对较小。',
    habitat: '山地林区、灌丛、丘陵与林农交错带，独居，活动范围大，多利用兽径与山脊移动。',
    activityTime: '夜间与晨昏为主。',
    behavior:
      '隐蔽伏击型顶级捕食者，善攀爬、能拖曳猎物上树；对人类通常回避，但在食物短缺、被惊扰或习惯化时可能进入村寨与营地周边；清晨与黄昏风险最高。',
    diet: '鹿类、野猪、野兔、猴类等中型兽类与家畜。',
    tracks: [
      '猫科四趾印（不露爪），掌垫前缘有三个瓣叶，掌印宽 4-7 厘米',
      '前后印交替、步幅 60-90 厘米，常沿山脊与兽径直线行进，无拖尾痕',
    ],
    feces: '长条形，末端常不规则，含毛发与骨屑，多在路径交叉处与岩石上标记（喷尿标记）。',
    dangerLevel: 'L4',
    possibleInjury:
      '锁喉与扑倒造成的颈部、头面部深部穿刺伤与大出血，可致休克与死亡；夜间营地袭击风险较高。',
    safetyMeasures:
      '结伴行走并保持警觉，天黑前到达营地；不睡在完全敞开的场地，帐篷与庇护所拉好，食物密封吊高并远离睡眠区；不沿山脊与兽径独行，制造人声与光照；遇豹保持镇定、缓慢后退、面向它并放大身形（举高衣物），绝不转身奔跑与背对；不试图靠近拍照。',
    biteFirstAid:
      '立即脱离并高声呼救，拨打 120；大出血用干净敷料直接持续按压，深部伤口以填塞加压为主，不拔出嵌入物；不切开、不吸吮、不冰敷；保持伤肢制动与伤员保暖、防休克；记住豹的体型、斑纹与去向，尽快送医手术清创并处理狂犬病与破伤风暴露。',
    distribution: '中国东北、华北、西南、华南与西北部分山地林区（多地种群稀少）。',
    identificationConfidence: 'B',
    tags: ['大型猫科', '顶级捕食者', '营地安全', '急救重点'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick(
        'field_guide_cn',
        'iucn',
        'rc_firstaid',
        'who_firstaid',
        'survival_manual_military',
      ),
    }),
  },
  {
    id: 'animal-tiger',
    animalClass: 'dangerous',
    name: '虎',
    scientificName: 'Panthera tigris',
    aliases: ['老虎', '大虫'],
    image: undefined,
    appearance:
      '最大型猫科动物，体长 2-2.5 米，体重 100-250 公斤；橙黄至红褐色底并具黑色条纹，腹面白，头圆吻宽、犬齿粗长，前肢力量极大。',
    habitat: '森林、灌丛、沼泽与山地，独居并占据大片领地，沿固定路线巡视。',
    activityTime: '夜间与晨昏为主。',
    behavior:
      '顶级伏击捕食者，通常回避人类；历史上多次袭击多发生在夜间、视线不良或其受困受伤时；对靠近幼崽的个体极度敏感。中国野外确认记录极少（华南虎长期无野外确认记录）。',
    diet: '鹿、野猪、野牛等大型有蹄类。',
    tracks: [
      '猫科四趾印不露爪，掌垫宽大，掌印宽 7-11 厘米，后足印常大于前足',
      '步幅 0.8-1.2 米，沿山脊与林道成直线行进，常有喷尿与抓树标记',
    ],
    feces: '粗大长条，含毛发与骨屑，多在路径中央与显眼处标记领地。',
    dangerLevel: 'L4',
    possibleInjury: '致命性咬伤、抓伤与大面积撕裂伤，颈部与头部攻击可瞬间致死或致休克。',
    safetyMeasures:
      '不进入封育保护区与已知活动区；野外宿营使用坚固庇护所，食物与气味物远离并密封；夜间结伴、点火照明、制造规律人声；遇虎保持距离、面向它缓慢后退、绝不奔跑与背对，可用火光与喊声示警；发现新鲜足迹、粪便与抓痕立即撤离并报告林业部门。',
    biteFirstAid:
      '立即呼救并拨打 120；以直接持续加压控制大出血（深部伤口填塞加压），不拔出异物；不切开、不吸吮、不冰敷；保持呼吸道通畅、保暖防休克，疑似脊柱损伤者固定后搬动；记住虎的斑纹与去向，尽快送医手术清创并处理狂犬病与破伤风暴露。',
    distribution:
      '中国野外主要见于东北林区（东北虎）、西南边境（孟加拉虎、印支虎历史分布），华南虎野外无确认记录。',
    identificationConfidence: 'B',
    tags: ['大型猫科', '顶级捕食者', '营地安全', '急救重点'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick(
        'field_guide_cn',
        'iucn',
        'rc_firstaid',
        'who_firstaid',
        'survival_manual_military',
      ),
    }),
  },
  {
    id: 'animal-elephant',
    animalClass: 'dangerous',
    name: '亚洲象',
    scientificName: 'Elephas maximus',
    aliases: ['大象', '野象'],
    image: undefined,
    appearance:
      '陆地最大哺乳动物之一，肩高 2-3 米，体重 3-5 吨；灰褐色皮肤多褶皱，耳相对较小，鼻为象鼻（约 10 万块肌群），雄性具象牙，额部有两个圆凸（额丘）。',
    habitat: '热带与南亚热带的森林、竹林、河谷与农田交错带，集群活动。',
    activityTime: '全天，晨昏取食频繁，夜间常移动。',
    behavior:
      '母系集群，智商高、记忆力强；正常时回避人类，但发情期公象、受惊群体、护幼个体或曾受伤害的个体会主动冲撞、踩踏与推倒树木房屋；公路上拦路与抢食事件常见。',
    diet: '每日取食数十公斤草本、竹类、树皮、果实与农作物。',
    tracks: [
      '近乎圆形的大足印，直径 30-50 厘米，前足印略呈心形、后足印较圆，边缘有趾痕',
      '成串直线排列，步幅 1-1.5 米；伴随大量折断的树干、竹丛、踩塌的植被与粪堆',
    ],
    feces: '巨大成堆（单次可达数十公斤），含大量未消化植物纤维，常成行分布于迁移路线。',
    dangerLevel: 'L4',
    possibleInjury:
      '冲撞与踩踏造成多发骨折、颅脑与胸腹脏器损伤、内出血，可瞬间致命；象鼻抽打与象牙挑刺造成深部撕裂。',
    safetyMeasures:
      '在象群活动区保持至少 100 米以上距离，绝不挡在象群与水源、通道之间；发现折断的树、新鲜大足迹与象鸣立即原路缓慢撤离；驾车遇象停车等候让行，不鸣笛、不围堵、不下车拍照；营地避开象道与象群迁移走廊；不投喂、不驱赶。',
    biteFirstAid:
      '被冲撞或踩踏后先确认环境安全（象可能仍在附近），立即拨打 120；按"气道—呼吸—循环—出血—骨折"顺序处置：控制大出血、开放气道、疑似脊柱损伤者固定头颈不搬动、开放性骨折不复位并用清洁敷料覆盖；保暖防休克，记录受伤时间并尽快送医。',
    distribution: '中国云南西双版纳、普洱、临沧等地的局部区域。',
    identificationConfidence: 'B',
    tags: ['长鼻目', '冲撞', '云南', '急救重点'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid', 'mem_gov_cn'),
    }),
  },
  {
    id: 'animal-dhole',
    animalClass: 'dangerous',
    name: '豺',
    scientificName: 'Cuon alpinus',
    aliases: ['亚洲豺犬', '红狼', '掏狗'],
    image: undefined,
    appearance:
      '中型犬科，体长 0.9-1.3 米，体重 15-20 公斤；毛棕红至红褐色，腹部与颈部较浅，尾粗密而下垂，吻短、耳圆、四肢短健。',
    habitat: '山地林区、灌丛与丘陵，集群（可达 10 余只）活动。',
    activityTime: '晨昏与夜间为主。',
    behavior:
      '高度协作的集群猎手，通过叫声联络、分工包抄，能猎杀数倍于自身体型的猎物；对人通常回避，但在群体数量多、猎物匮乏或被逼时可能尾随并试探性接近营地。',
    diet: '鹿、野猪、野兔等兽类，也食腐与小型动物。',
    tracks: [
      '犬科四趾印带明显爪痕，掌印宽 3.5-5 厘米，前后印交替成一直线',
      '群体会留下多条平行或交错的足迹带，步幅 50-80 厘米',
    ],
    feces: '长条形，含毛发与骨屑，多在路径与领地边缘标记。',
    dangerLevel: 'L4',
    possibleInjury: '群体撕咬造成的多处大面积咬伤与失血，围攻时可致休克；追逐中被抓倒踩踏。',
    safetyMeasures:
      '山地结伴行走，天黑前扎营；不睡在开阔地与兽径上，食物密封吊高；遇豺群不奔跑，面向它们缓慢后退，用火光、大声喊叫与投掷石块驱赶；发现成群足迹与新鲜粪便立即改道并报告林业部门；不投喂、不靠近。',
    biteFirstAid:
      '立即脱离并呼救，拨打 120；多处伤口用大量流动清水与肥皂水冲洗后以干净敷料覆盖、直接加压止血，深部伤口填塞加压；不切开、不吸吮、不冰敷；保暖防休克、制动疑似骨折，尽快送医处理狂犬病与破伤风暴露并记住动物数量与去向。',
    distribution: '中国西南、西北、东北与南方部分山地（多地种群极度稀少）。',
    identificationConfidence: 'C',
    identificationNote:
      '豺与流浪犬、狼在远距离易混淆，需结合红褐色体毛、短吻、圆耳与群体活动综合判断；不确定时按"未知犬科动物"采取同等防护与暴露处置。',
    tags: ['犬科', '集群猎手', '营地安全', '急救重点'],
    meta: meta({
      dangerLevel: 'L4',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
  {
    id: 'animal-golden-cat',
    animalClass: 'dangerous',
    name: '亚洲金猫',
    scientificName: 'Catopuma temminckii',
    aliases: ['红豹', '火猫'],
    image: undefined,
    appearance:
      '中型猫科，体长 0.8-1.1 米，体重 10-16 公斤；毛色变异大（棕红、灰褐、黑色型），面部常有黑白条纹，尾长、体型矫健。',
    habitat: '热带与亚热带山地森林、灌丛，独居而行踪隐秘。',
    activityTime: '夜间与晨昏为主。',
    behavior:
      '隐秘的林栖猎手，对人回避；受惊或被逼时可能发出嘶声并扑击，攻击性较强，但与人类遭遇的记录稀少且零散。',
    diet: '野兔、鼠类、雉类、蜥蜴等小型动物。',
    tracks: [
      '猫科四趾印不露爪，掌印宽 3.5-5 厘米，前后印交替、步幅 45-65 厘米',
      '林下落叶层常见连续的细小足印与拖尾痕',
    ],
    feces: '条状，含毛发与骨屑，多在树根、岩石与路径上标记。',
    dangerLevel: 'L3',
    possibleInjury: '咬伤与抓伤可造成深部撕裂与出血；因遭遇记录少，实际风险评估证据有限。',
    safetyMeasures:
      '林中行走结伴并照明，不徒手翻动倒木与石块；不抓捕、不围堵任何不明中型猫科动物；发现疑似个体保持距离、缓慢撤离并拍照上报林业部门。',
    biteFirstAid:
      '被咬抓后用大量流动清水与肥皂水冲洗伤口，覆盖清洁敷料并加压止血；不切开、不吸吮；尽快就医清创并评估狂犬病与破伤风暴露，记住动物外形与事发地点。',
    distribution: '中国西南、华南、东南与西藏东南部的山地森林。',
    identificationConfidence: 'D',
    identificationNote:
      '野外目击记录稀少、毛色多型，且与豹猫、云猫等中型猫科易混淆；本条目依据有限标本与文献描述，证据不足，识别与危险度评估均待进一步核实，仅作线索使用。',
    tags: ['猫科', '罕见', '待核实'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('pending_verification'),
      reviewStatus: 'pending_review',
      reviewNote: '中型猫科识别与遭遇风险证据不足，待专业复核',
      aiGenerated: true,
    }),
  },
  {
    id: 'animal-wild-yak',
    animalClass: 'dangerous',
    name: '野牦牛',
    scientificName: 'Bos mutus',
    aliases: ['野牛', '高原牛'],
    image: undefined,
    appearance:
      '大型牛科，肩高 1.6-2 米，体重 500-1000 公斤；全身被厚密的黑褐色长毛（腹下裙毛近地），肩部隆起，角粗大呈弧形向两侧伸展，鼻孔宽大。',
    habitat: '青藏高原海拔 3000-6000 米的高山草甸、荒漠与雪线附近，集群活动。',
    activityTime: '白天为主，晨昏取食。',
    behavior:
      '平时在远距离避开人类；受惊、被逼入死角或发情期会低头加速冲撞，庞大的体重可造成毁灭性伤害；公路与营地附近偶有拦路个体。',
    diet: '高山禾草、苔草、地衣与低矮灌丛。',
    tracks: [
      '圆形大蹄印，宽 12-18 厘米，蹄瓣粗厚，成对排列且步幅 80-120 厘米',
      '常成密集群行痕迹，伴随被啃食的草根与压倒的草丛',
    ],
    feces: '成堆的粗大颗粒或团块，量大，多在固定采食地与水源附近。',
    dangerLevel: 'L3',
    possibleInjury: '冲撞造成多发骨折、颅胸腹脏器损伤与内出血，可致命；践踏造成二次伤害。',
    safetyMeasures:
      '青藏高原行车与徒步不接近、不惊扰、不挡路；与野牦牛保持至少 100 米距离，绕行并留出逃跑通道；不鸣笛驱赶、不徒步逼近拍照；遇其低头刨地、喷鼻或直视时立即缓慢后退到开阔安全处；营地扎在远离兽道与水源的开阔地。',
    biteFirstAid:
      '被冲撞或践踏后先确认牛已离开，立即拨打 120；按创伤初步评估处置：控制大出血、开放气道、疑似脊柱损伤固定头颈不随意搬动、开放性骨折无菌覆盖不复位；注意高原环境下保暖与供氧，尽快后送至有条件医院。',
    distribution: '中国青藏高原（青海、西藏、新疆南部、四川西部）。',
    identificationConfidence: 'B',
    tags: ['牛科', '高原', '冲撞', '青藏高原'],
    meta: meta({
      dangerLevel: 'L3',
      sources: pick('field_guide_cn', 'iucn', 'rc_firstaid', 'who_firstaid'),
    }),
  },
];

/** 动物足迹 / 痕迹记录 */
export const animalTracks: AnimalTrack[] = [
  {
    id: 'track-black-bear',
    animalId: 'animal-black-bear',
    description:
      '掌印似人手但前端有长而钝的爪痕，掌垫五瓣明显；常见前后掌交替的直线行进痕迹，沿山脊、林道与倒木行走。',
    size: '前掌宽 7-10 厘米、后掌宽 8-12 厘米，步幅 40-70 厘米',
    gait: '缓步/踱步（前后掌印部分重叠），受惊时步幅拉大且爪痕加深',
  },
  {
    id: 'track-wild-boar',
    animalId: 'animal-wild-boar',
    description: '偶蹄双瓣蹄印，蹄尖外撇、后端开口，前蹄印常大于后蹄；伴随成片拱土翻根的觅食痕迹。',
    size: '蹄印长 6-9 厘米、宽 5-8 厘米',
    gait: '常成对或单列慢行，受惊直线冲刺时印痕深且凌乱',
  },
  {
    id: 'track-wolf',
    animalId: 'animal-wolf',
    description:
      '犬科四趾印，爪痕清晰不收爪，掌垫前缘呈三个瓣叶的弧形；前后印交替几乎落在同一直线上。',
    size: '掌印宽 4-6 厘米、长 7-9 厘米，步幅 60-90 厘米',
    gait: '小跑/踱步（对角线两足同时落地），常沿同一路径反复使用',
  },
  {
    id: 'track-deer',
    animalId: 'animal-deer',
    description:
      '两瓣尖细的蹄印呈倒"V"形，前后端尖锐，无爪痕；成串排列，常分叉通向水源与林间草地。',
    size: '蹄长约 5-7 厘米、宽 4-6 厘米',
    gait: '行走时后蹄常踩入前蹄印（重叠步），受惊跳跃时前后印成组、间距 1-1.5 米',
  },
  {
    id: 'track-hare',
    animalId: 'animal-hare',
    description:
      '后足印（长而窄，位于前方）与前足印（成对斜列于后方）组成跳跃组，常见之字形路线与急转痕迹。',
    size: '后足印长 9-12 厘米，前足印长 4-6 厘米，跳跃间距 1-2 米',
    gait: '跳跃式（后足蹬地、前足着地），受惊时路线曲折多变',
  },
  {
    id: 'track-rat',
    animalId: 'animal-rat',
    description:
      '前足 4 趾、后足 5 趾的细小足印交替成链状；重要间接痕迹为墙根灰尘擦出的"鼠道"、门齿双行啃咬痕与管道口的油污蹭痕。',
    size: '后足印长约 2-3 厘米、前足印 1-2 厘米',
    gait: '疾走（前后印部分重叠），常沿墙根与固定路线',
  },
  {
    id: 'track-squirrel',
    animalId: 'animal-squirrel',
    description:
      '细小趾垫呈放射状的前后足印，树干与地表有细密爪划痕；取食点旁堆积啃开的果壳与种子碎屑。',
    size: '前足印长约 2-3 厘米',
    gait: '跳跃式前进（成组落点），树上呈绕干攀爬痕',
  },
  {
    id: 'track-macaque',
    animalId: 'animal-macaque',
    description:
      '拇指可对握的"手印"，五指（趾）分离、端有指甲而非爪；地面、岩壁与树枝上常见掌印、抓握痕与坐压痕。',
    size: '掌宽 3-5 厘米',
    gait: '四肢并用行走（掌—指依次着地），跳跃落地时前后印成对',
  },
  {
    id: 'track-fox',
    animalId: 'animal-fox',
    description:
      '紧凑的四趾犬科印，爪痕明显但掌垫较小，前后印交替成较直的细线，常沿田埂、墙根与林缘行进。',
    size: '掌印宽 3.5-4.5 厘米，步幅 30-50 厘米',
    gait: '轻巧小步快走，转弯处印痕变浅',
  },
  {
    id: 'track-badger',
    animalId: 'animal-badger',
    description: '五趾印、爪痕长而明显（前爪更长），掌垫横列；洞口有扇形堆积的挖掘松土与拖拉痕迹。',
    size: '前掌印宽 5-7 厘米',
    gait: '沉重短步，常进出固定洞道，地面留浅沟',
  },
  {
    id: 'track-bat',
    animalId: 'animal-bat',
    description:
      '几乎无地面足迹；可靠痕迹为洞穴与栖息点下方成片的细小粪堆、尿渍磨亮的岩面，以及翼膜掠过留下的灰尘擦痕。',
    size: '粪粒长 3-8 毫米，成片堆积',
    gait: '不适用（飞行）；地面仅偶尔爬行留下细划痕',
  },
  {
    id: 'track-pheasant',
    animalId: 'animal-pheasant',
    description: '三前一后的细长鸟印，趾端钝爪痕清晰；地面有爪扇形刨开落叶的痕迹与长尾拖曳线。',
    size: '印长约 4-6 厘米',
    gait: '行走两列并行，受惊起飞前有急促凌乱的助跑印',
  },
  {
    id: 'track-crow',
    animalId: 'animal-crow',
    description:
      '粗壮的四趾鸟印（三前一后），爪痕明显；栖枝与建筑边缘有成片白色喷溅粪便与脱落的黑色羽片。',
    size: '印长约 5-7 厘米',
    gait: '跳跃与行走混合，地面常见"走—跳"交替序列',
  },
  {
    id: 'track-eagle',
    animalId: 'animal-eagle',
    description:
      '大型三前一后鸟印，趾粗、爪痕深而弯曲呈钩状；悬崖栖枝与巢下有羽毛、粪便喷溅与猎物残骸（毛皮、骨骼）。',
    size: '印长约 8-12 厘米，爪痕深 1-3 厘米',
    gait: '地面少走动，多为短距跳跃；抓握栖枝时趾环绕枝条留压痕',
  },
  {
    id: 'track-owl',
    animalId: 'animal-owl',
    description:
      '四趾印（外趾可转向后）与深爪痕；最典型痕迹是栖枝下方成堆的食丸（毛发与骨屑压缩的椭圆团块）与脱落羽毛。',
    size: '印长 6-9 厘米，食丸长 3-5 厘米',
    gait: '地面少活动，多为短距跳跃与低飞落点痕',
  },
  {
    id: 'track-cobra',
    animalId: 'animal-cobra',
    description:
      '无足，落叶、沙土与泥地上留下宽幅"S"形连续爬行带与鳞片刮擦点纹，转弯处痕迹加深，常通向洞穴与倒木。',
    size: '爬行带宽 3-6 厘米',
    gait: '蜿蜒行进；受惊竖起时仅在原地留下盘卷压痕',
  },
  {
    id: 'track-mamushi',
    animalId: 'animal-mamushi',
    description:
      '较细的波状连续爬行线，沙地与落叶上可见点状鳞片刮纹，常与鼠洞、石堆相连；盘卷时留下圆形压痕。',
    size: '爬行线宽 2-5 厘米',
    gait: '缓慢蜿蜒与伏击静伏（长时间无痕），雨后痕迹更明显',
  },
  {
    id: 'track-bamboo-viper',
    animalId: 'animal-bamboo-viper',
    description:
      '细波状爬行痕多见于溪边湿泥与叶面水痕；竹林与灌丛地面为断续波状线，枝条上有身体缠绕压弯的痕迹。',
    size: '爬行线宽 1-3 厘米',
    gait: '树栖缠绕移动，地面痕迹断续',
  },
  {
    id: 'track-alligator',
    animalId: 'animal-alligator',
    description:
      '水边泥地的宽大拖曳体痕，中央有腹甲刮出的平滑带，两侧为四肢爪印与扇形尾迹；晒背处有长条压痕。',
    size: '体痕宽 20-40 厘米，步幅短',
    gait: '贴地爬行（四肢在身体两侧划行）与游泳波纹',
  },
  {
    id: 'track-python',
    animalId: 'animal-python',
    description: '连续的宽幅"S"形爬行带，边缘有规律的鳞片刮纹，转弯处可见身体压出的凹槽与拖曳痕。',
    size: '爬行带宽 5-15 厘米',
    gait: '蜿蜒行进，遇障碍转为直线拖行',
  },
  {
    id: 'track-toad',
    animalId: 'animal-toad',
    description:
      '湿泥与草地上短距缓慢爬行痕，前足小印（宽约 2-3 厘米）与后足拖痕相接；雨后路灯下与墙角常见。',
    size: '前足印宽 2-3 厘米，移动痕迹短且断续',
    gait: '爬行与短跳交替，雨后痕迹最易辨认',
  },
  {
    id: 'track-frog',
    animalId: 'animal-frog',
    description:
      '湿泥上成对的细长后足蹬印（趾间蹼痕清晰）与前方小的前足印，田埂与水边呈连续跳跃落点。',
    size: '后足印长 4-6 厘米，落点间距 30-80 厘米',
    gait: '跳跃式（后肢蹬地），入水处有溅水与蹼划痕',
  },
  {
    id: 'track-pufferfish',
    animalId: 'animal-pufferfish',
    description:
      '无足；主要识别痕迹为河口浅滩被冲上岸的膨大个体、渔网中体表的黏滑与小刺刮痕，以及底泥被翻动的浅坑。',
    size: '体长 15-30 厘米，膨胀后近球形',
    gait: '不适用（水中游动，尾鳍与背鳍推进）',
  },
  {
    id: 'track-stingray',
    animalId: 'animal-stingray',
    description:
      '浅海底的椭圆形伏卧压痕与扇形鳍缘刮纹，半埋时仅露出眼与喷水孔；沙滩上留"V"形游动尾迹与中央拖痕。',
    size: '体盘宽 30-60 厘米，尾痕细长',
    gait: '贴底滑行与伏卧（静止时几乎无痕）',
  },
  {
    id: 'track-leopard',
    animalId: 'animal-leopard',
    description:
      '猫科四趾印不露爪，掌垫前缘三个瓣叶清晰；前后印交替成一直线沿山脊与兽径行进，常伴树干抓痕、喷尿标记与被拖上树的猎物残骸。',
    size: '掌印宽 4-7 厘米，步幅 60-90 厘米',
    gait: '贴地缓步（后蹄印常压在前印上），潜行时几乎无声',
  },
  {
    id: 'track-tiger',
    animalId: 'animal-tiger',
    description:
      '宽大的猫科四趾印不露爪，掌垫厚实；沿山脊与林道成直线的重叠步迹，伴随时常出现的抓树标记、喷尿湿痕与粗大粪堆。',
    size: '掌印宽 7-11 厘米，步幅 0.8-1.2 米',
    gait: '缓慢重叠步（后足踩入前足印），追踪时步迹成一条直线',
  },
  {
    id: 'track-elephant',
    animalId: 'animal-elephant',
    description:
      '近圆形的大足印，前足印略呈心形、后足印较圆，边缘可见趾痕；伴随折断的树干、踩塌植被与成堆粪便，构成明显迁移走廊。',
    size: '足印直径 30-50 厘米，步幅 1-1.5 米',
    gait: '缓慢直线行走（前后足印交错成列），转弯处有拖擦痕',
  },
  {
    id: 'track-dhole',
    animalId: 'animal-dhole',
    description: '带明显爪痕的犬科四趾印，多条平行或交错的足迹带（群体行进），沿林道与山脊延伸。',
    size: '掌印宽 3.5-5 厘米，步幅 50-80 厘米',
    gait: '小跑与奔跑混合，群体痕迹凌乱但方向一致',
  },
  {
    id: 'track-wild-yak',
    animalId: 'animal-wild-yak',
    description:
      '粗厚的双瓣蹄印成对排列，沿高山草甸形成密集群行压痕；伴随被啃食的草根、压倒的草丛与大型粪堆。',
    size: '蹄印宽 12-18 厘米，步幅 80-120 厘米',
    gait: '缓慢成群行进，水源与采食地之间痕迹反复加深',
  },
];
