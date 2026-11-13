import { getCategory } from '@apocalypse/core';
import { Link, useParams } from 'react-router-dom';
import {
  BackButton,
  BookmarkButton,
  HazardBanner,
  MetaBar,
  RelatedLinks,
  Sections,
  SourceList,
  StepList,
  TipList,
  useHistory,
} from '../../components/detail';
import { Icon } from '../../components/Icon';
import { EmptyState, Panel, Tag } from '../../components/ui';
import { getArticle, resolveRefs } from '../../lib/knowledge';

/** 知识文章详情（统一模板） */
export default function ArticleDetail() {
  const { id } = useParams();
  const article = id ? getArticle(id) : undefined;
  useHistory('article', article?.id ?? '', article?.title ?? '');

  if (!article) {
    return (
      <div className="fade-in">
        <BackButton />
        <EmptyState
          icon="book"
          title="未找到该知识条目"
          hint="可能已被下架或链接有误。"
          action={
            <Link className="btn btn-primary" to="/knowledge">
              返回图鉴
            </Link>
          }
        />
      </div>
    );
  }

  const cat = getCategory(article.categorySlug);
  const related = resolveRefs(article.relatedIds);

  return (
    <div className="fade-in">
      <BackButton fallback={`/knowledge/${article.categorySlug}`} />
      <HazardBanner level={article.meta.dangerLevel} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-[12px] text-[var(--color-ink-dim)]">
            <Link to="/knowledge" className="hover:text-[var(--color-ink)]">
              知识图鉴
            </Link>
            <Icon name="chevron" size={11} />
            <Link
              to={`/knowledge/${article.categorySlug}`}
              className="hover:text-[var(--color-ink)]"
            >
              {cat?.name}
            </Link>
          </div>

          <h1 className="text-[22px] font-bold leading-snug">{article.title}</h1>
          {article.aliases.length > 0 && (
            <p className="mt-1 text-[12.5px] text-[var(--color-ink-faint)]">
              别名：{article.aliases.join('、')}
            </p>
          )}

          <div className="mt-3">
            <MetaBar meta={article.meta} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <BookmarkButton kind="article" refId={article.id} title={article.title} />
            <button
              type="button"
              className="btn"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              <Icon name="copy" size={14} /> 复制链接
            </button>
            <button type="button" className="btn" onClick={() => window.print()}>
              <Icon name="print" size={14} /> 打印 / 导出 PDF
            </button>
          </div>

          {/* 简介 */}
          <Panel className="mt-5 p-4">
            <p className="text-[14px] leading-[1.9] text-[var(--color-ink)]">{article.summary}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-[var(--color-ink-dim)]">
              {article.environment && article.environment.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Icon name="earth" size={13} /> 适用环境：{article.environment.join('、')}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Icon name="star" size={13} /> 难度 {article.difficulty}/5
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={13} /> 更新 {article.meta.updatedAt.slice(0, 10)}
              </span>
            </div>
            {article.scenarios && article.scenarios.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="micro-label mr-1">适用场景</span>
                {article.scenarios.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            )}
          </Panel>

          {/* 正文 */}
          <div className="mt-6">
            <Sections sections={article.sections} />
          </div>

          {/* 操作步骤 */}
          {article.steps && article.steps.length > 0 && (
            <Panel className="mt-6 p-4">
              <span className="micro-label">操作步骤 · PROCEDURE</span>
              <div className="mt-3">
                <StepList steps={article.steps} />
              </div>
            </Panel>
          )}

          {/* 所需工具 */}
          {article.tools && article.tools.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="micro-label">所需工具</span>
              {article.tools.map((t) => (
                <Tag key={t}>
                  <Icon name="tool" size={11} /> {t}
                </Tag>
              ))}
            </div>
          )}

          {/* 注意事项 / 禁忌 */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TipList title="注意事项" items={article.precautions ?? []} tone="warn" />
            <TipList title="禁忌事项" items={article.contraindications ?? []} tone="danger" />
          </div>

          {/* 标签 */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Tag key={t}># {t}</Tag>
            ))}
          </div>
        </div>

        {/* 右栏 */}
        <div className="flex flex-col gap-4">
          <SourceList meta={article.meta} />
          <RelatedLinks items={related} />
          <Panel className="p-4">
            <span className="micro-label">离线状态</span>
            <div
              className="mt-2.5 flex items-center gap-2 text-[13px]"
              style={{ color: 'var(--color-moss-hi)' }}
            >
              <Icon name="check" size={15} />
              {article.offlineReady ? '已打包进应用，断网可读' : '需要下载离线包'}
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
              本条目随应用离线安装，无需网络即可阅读与搜索。
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
