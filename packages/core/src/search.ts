import type { SearchDocument, SearchResult } from './types';

/**
 * 离线全文搜索引擎（零依赖，可在 Web / Tauri / Capacitor / Node 运行）。
 * - 中文：字符二元组（bigram）索引 + 子串匹配
 * - 英文：小写分词 + 词干粗处理
 * - 字段权重：title > tags > subtitle > body
 */

const FIELD_WEIGHT = { title: 6, tags: 4, subtitle: 2.5, body: 1 } as const;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'or', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'by',
  '的', '了', '和', '与', '在', '是', '有', '及', '等', '把', '被', '对', '从', '到',
]);

/** 归一化：小写、去空白 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** 提取英文词与中文字符序列 */
function tokenize(text: string): string[] {
  const out: string[] = [];
  const re = /[a-z0-9]+|[一-鿿]+/g;
  const lower = normalize(text);
  let m: RegExpExecArray | null;
  while ((m = re.exec(lower))) {
    const part = m[0];
    if (/^[一-鿿]+$/.test(part)) {
      // 中文：单字 + 二元组
      for (const ch of part) out.push(ch);
      for (let i = 0; i < part.length - 1; i++) out.push(part.slice(i, i + 2));
    } else if (part.length > 1 && !STOPWORDS.has(part)) {
      out.push(part);
      // 简单词干：去复数/ing
      if (part.endsWith('ies') && part.length > 4) out.push(part.slice(0, -3) + 'y');
      else if (part.endsWith('s') && !part.endsWith('ss') && part.length > 3) out.push(part.slice(0, -1));
      if (part.endsWith('ing') && part.length > 5) out.push(part.slice(0, -3));
    }
  }
  return out;
}

interface IndexedDoc {
  doc: SearchDocument;
  /** term -> field -> tf */
  terms: Map<string, Map<keyof typeof FIELD_WEIGHT, number>>;
  fieldLength: Record<keyof typeof FIELD_WEIGHT, number>;
}

export class SearchIndex {
  private docs = new Map<string, IndexedDoc>();
  private df = new Map<string, number>();
  private totalDocs = 0;

  build(documents: SearchDocument[]): this {
    this.docs.clear();
    this.df.clear();
    this.totalDocs = 0;
    for (const d of documents) this.add(d);
    return this;
  }

  add(doc: SearchDocument): void {
    if (this.docs.has(doc.id)) this.remove(doc.id);
    const fields: Record<string, string> = {
      title: doc.title,
      tags: doc.tags.join(' '),
      subtitle: doc.subtitle,
      body: doc.body,
    };
    const terms = new Map<string, Map<keyof typeof FIELD_WEIGHT, number>>();
    const fieldLength = { title: 0, tags: 0, subtitle: 0, body: 0 } as Record<keyof typeof FIELD_WEIGHT, number>;

    for (const [field, text] of Object.entries(fields)) {
      const f = field as keyof typeof FIELD_WEIGHT;
      const tokens = tokenize(text ?? '');
      fieldLength[f] += tokens.length;
      for (const t of tokens) {
        let fm = terms.get(t);
        if (!fm) { fm = new Map(); terms.set(t, fm); }
        fm.set(f, (fm.get(f) ?? 0) + 1);
      }
    }
    for (const t of terms.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    this.docs.set(doc.id, { doc, terms, fieldLength });
    this.totalDocs++;
  }

  remove(id: string): void {
    const entry = this.docs.get(id);
    if (!entry) return;
    for (const t of entry.terms.keys()) {
      const n = (this.df.get(t) ?? 1) - 1;
      if (n <= 0) this.df.delete(t);
      else this.df.set(t, n);
    }
    this.docs.delete(id);
    this.totalDocs--;
  }

  clear(): void {
    this.docs.clear();
    this.df.clear();
    this.totalDocs = 0;
  }

  get size(): number {
    return this.docs.size;
  }

  search(query: string, opts?: { limit?: number; kind?: string; category?: string; maxDanger?: string }): SearchResult[] {
    const limit = opts?.limit ?? 30;
    const q = normalize(query);
    if (!q) return [];
    const qTokens = tokenize(q);
    if (qTokens.length === 0) return [];
    const unique = Array.from(new Set(qTokens));
    const results: SearchResult[] = [];

    for (const entry of this.docs.values()) {
      const { doc } = entry;
      if (opts?.kind && doc.kind !== opts.kind) continue;
      if (opts?.category && doc.category !== opts.category) continue;

      let score = 0;
      let matchedTerms = 0;
      for (const term of unique) {
        const fm = entry.terms.get(term);
        if (!fm) continue;
        matchedTerms++;
        const idf = Math.log(1 + this.totalDocs / (1 + (this.df.get(term) ?? 1)));
        for (const [field, tf] of fm) {
          const len = Math.max(1, entry.fieldLength[field]);
          score += FIELD_WEIGHT[field] * (1 + Math.log(tf)) * idf * (tf / Math.min(len, 50));
        }
      }
      if (matchedTerms === 0) continue;

      // 短语/子串加成：标题或标签包含完整查询串
      if (q.length >= 2) {
        if (normalize(doc.title).includes(q)) score *= 1.8;
        else if (normalize(doc.tags.join(' ')).includes(q)) score *= 1.3;
        else if (normalize(doc.subtitle).includes(q)) score *= 1.15;
      }
      // 覆盖率加成（命中词比例）
      score *= 0.6 + 0.4 * (matchedTerms / unique.length);
      // 危险内容轻微降权排序（同分时普通内容优先），但不隐藏
      if (doc.dangerLevel === 'L4') score *= 0.98;

      results.push({ document: doc, score: Math.round(score * 1000) / 1000 });
    }

    results.sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title));
    return results.slice(0, limit);
  }
}

/** 把各知识库转换为搜索文档（三端共用的索引构建入口） */
export interface IndexableSet {
  articles: { id: string; title: string; summary: string; categorySlug: string; tags: string[]; dangerLevel: string; sections: { heading: string; body: string }[] }[];
  plants: { id: string; name: string; scientificName: string; aliases: string[]; category: string; tags: string[]; dangerLevel: string; toxicity: string; uses: string[]; habitat: string }[];
  animals: { id: string; name: string; scientificName: string; aliases: string[]; animalClass: string; tags: string[]; dangerLevel: string; appearance: string; habitat: string }[];
  insects: { id: string; name: string; scientificName: string; aliases: string[]; tags: string[]; dangerLevel: string; appearance: string; habitat: string }[];
  medicines: { id: string; name: string; aliases: string[]; category: string; purpose: string; tags: string[]; dangerLevel: string }[];
  firstAid: { id: string; title: string; summary: string; categorySlug: string; tags: string[]; dangerLevel: string; applicable: string[] }[];
  skills: { id: string; title: string; summary: string; categorySlug: string; tags: string[]; dangerLevel: string; purpose: string }[];
  supplies: { id: string; name: string; category: string; purpose: string; tags: string[]; dangerLevel: string }[];
  scenarios: { id: string; title: string; summary: string; tags: string[]; dangerLevel: string }[];
  hazards: { id: string; title: string; description: string; category: string; dangerLevel: string; indicators: string[] }[];
}

export function buildSearchDocuments(set: IndexableSet): SearchDocument[] {
  const docs: SearchDocument[] = [];
  const danger = (l: string) => (['L0', 'L1', 'L2', 'L3', 'L4'].includes(l) ? l : 'L0') as SearchDocument['dangerLevel'];

  for (const a of set.articles) {
    docs.push({
      id: `article:${a.id}`, kind: 'article', title: a.title,
      subtitle: a.summary.slice(0, 80), category: a.categorySlug, tags: a.tags,
      dangerLevel: danger(a.dangerLevel),
      body: [a.summary, ...a.sections.map((s) => `${s.heading} ${s.body}`)].join(' '),
    });
  }
  for (const p of set.plants) {
    docs.push({
      id: `plant:${p.id}`, kind: 'plant', title: p.name,
      subtitle: `${p.scientificName} · ${p.aliases.join('、')}`, category: p.category, tags: [...p.tags, ...p.aliases, p.scientificName],
      dangerLevel: danger(p.dangerLevel),
      body: `${p.toxicity} ${p.uses.join(' ')} ${p.habitat} ${p.scientificName}`,
    });
  }
  for (const a of set.animals) {
    docs.push({
      id: `animal:${a.id}`, kind: 'animal', title: a.name,
      subtitle: `${a.scientificName} · ${a.aliases.join('、')}`, category: a.animalClass, tags: [...a.tags, ...a.aliases, a.scientificName],
      dangerLevel: danger(a.dangerLevel),
      body: `${a.appearance} ${a.habitat} ${a.scientificName}`,
    });
  }
  for (const i of set.insects) {
    docs.push({
      id: `insect:${i.id}`, kind: 'insect', title: i.name,
      subtitle: `${i.scientificName} · ${i.aliases.join('、')}`, category: 'insect', tags: [...i.tags, ...i.aliases],
      dangerLevel: danger(i.dangerLevel),
      body: `${i.appearance} ${i.habitat} ${i.scientificName}`,
    });
  }
  for (const m of set.medicines) {
    docs.push({
      id: `medicine:${m.id}`, kind: 'medicine', title: m.name,
      subtitle: m.purpose.slice(0, 80), category: m.category, tags: [...m.tags, ...m.aliases],
      dangerLevel: danger(m.dangerLevel), body: `${m.purpose} ${m.aliases.join(' ')}`,
    });
  }
  for (const f of set.firstAid) {
    docs.push({
      id: `first_aid:${f.id}`, kind: 'first_aid', title: f.title,
      subtitle: f.summary.slice(0, 80), category: f.categorySlug, tags: f.tags,
      dangerLevel: danger(f.dangerLevel),
      body: `${f.summary} ${f.applicable.join(' ')}`,
    });
  }
  for (const s of set.skills) {
    docs.push({
      id: `skill:${s.id}`, kind: 'skill', title: s.title,
      subtitle: s.summary.slice(0, 80), category: s.categorySlug, tags: s.tags,
      dangerLevel: danger(s.dangerLevel), body: `${s.summary} ${s.purpose}`,
    });
  }
  for (const s of set.supplies) {
    docs.push({
      id: `supply:${s.id}`, kind: 'supply', title: s.name,
      subtitle: s.purpose.slice(0, 80), category: s.category, tags: s.tags,
      dangerLevel: danger(s.dangerLevel), body: s.purpose,
    });
  }
  for (const s of set.scenarios) {
    docs.push({
      id: `scenario:${s.id}`, kind: 'scenario', title: s.title,
      subtitle: s.summary.slice(0, 80), category: 'disasters', tags: s.tags,
      dangerLevel: danger(s.dangerLevel), body: s.summary,
    });
  }
  for (const h of set.hazards) {
    docs.push({
      id: `hazard:${h.id}`, kind: 'hazard', title: h.title,
      subtitle: h.description.slice(0, 80), category: h.category, tags: h.indicators,
      dangerLevel: danger(h.dangerLevel), body: `${h.description} ${h.indicators.join(' ')}`,
    });
  }
  return docs;
}
