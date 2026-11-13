import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackButton } from '../../components/detail';
import { Icon } from '../../components/Icon';
import { DangerBadge, EmptyState, PageHeader, Panel, Spinner, Tag } from '../../components/ui';
import {
  checkImageQuality,
  type IdentifyResult,
  identifyImage,
  matchLocalSpecies,
} from '../../lib/ai';
import { isMobile } from '../../lib/platform';

/**
 * 植物图片识别：
 * 1 接收图片 → 2 质量检查 → 3 调用 MiMo 图片理解 → 4 特征分析 → 5 候选物种
 * → 6 检索本地植物库 → 7 比对相似种 → 8 结果与不确定性 → 9 进一步辨认特征 → 10 危险警告
 * 禁止仅凭识别建议食用；无法确定时明确显示"身份未确认"。
 */
export default function PlantIdentify() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<
    'idle' | 'checking' | 'uploading' | 'analyzing' | 'done' | 'error'
  >('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | undefined | null) => {
    if (!f) return;
    const q = checkImageQuality(f);
    if (!q.ok) {
      setError(q.reason ?? '图片不合格');
      setStage('error');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
    setStage('idle');
  };

  const run = async () => {
    if (!file) return;
    setStage('checking');
    try {
      await new Promise((r) => setTimeout(r, 350)); // 质量检查反馈
      setStage('analyzing');
      const res = await identifyImage(file, 'plant');
      if (!res.ok && res.error) {
        setError(res.error);
        setStage('error');
        return;
      }
      // 步骤6-7：检索正式植物数据库并比对相似种
      const enriched = matchLocalSpecies(res.candidates, 'plant');
      setResult({
        ...res,
        candidates: enriched.map((c) => ({
          ...c,
          matchedId: c.localMatches[0]?.id?.replace('plant:', ''),
        })),
      });
      setStage('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : '识别失败');
      setStage('error');
    }
  };

  const confirmed =
    result && result.candidates.length > 0 && result.candidates[0].confidence >= 0.75;

  return (
    <div className="fade-in">
      <BackButton fallback="/plants" />
      <PageHeader
        icon="camera"
        title="植物图片识别"
        subtitle="拍照或上传 → 质量检查 → AI 形态分析 → 候选物种 → 本地数据库比对 → 不确定性提示"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 左：上传与预览 */}
        <div>
          <div
            className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-[var(--color-edge)] bg-[var(--color-panel)] p-6 text-center transition-colors hover:border-[var(--color-moss-hi)]"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onPick(e.dataTransfer.files?.[0]);
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="待识别植物"
                className="max-h-[300px] rounded-[3px] object-contain"
              />
            ) : (
              <>
                <Icon name="camera" size={36} className="text-[var(--color-moss-hi)]" />
                <div>
                  <p className="text-[14px] font-medium">点击或拖拽图片到此</p>
                  <p className="mt-1 text-[12px] text-[var(--color-ink-faint)]">
                    支持 JPG/PNG/WebP，≤5MB。建议拍摄叶片、花朵、整株各一张。
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            // 移动端直接调起后置相机；web/桌面保持文件选择器
            capture={isMobile() ? 'environment' : undefined}
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn btn-primary flex-1"
              disabled={!file || stage === 'analyzing' || stage === 'checking'}
              onClick={run}
            >
              {stage === 'analyzing' || stage === 'checking' ? (
                <Spinner size={14} />
              ) : (
                <Icon name="search" size={15} />
              )}
              {stage === 'analyzing'
                ? 'AI 分析中…'
                : stage === 'checking'
                  ? '质量检查中…'
                  : '开始识别'}
            </button>
            {preview && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                  setStage('idle');
                }}
              >
                <Icon name="trash" size={14} /> 清除
              </button>
            )}
          </div>

          {stage === 'error' && (
            <div className="mt-3 rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-danger-dim)]/40 px-4 py-3 text-[13px]">
              <div className="flex items-center gap-2 font-bold text-[var(--color-danger)]">
                <Icon name="warning" size={14} /> 识别未完成
              </div>
              <p className="mt-1.5 text-[var(--color-ink-dim)]">{error}</p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-faint)]">
                提示：AI
                识别需要服务端在线；离线状态下无法进行图片识别，可先浏览植物图鉴手动比对特征。
              </p>
            </div>
          )}

          <Panel className="mt-4 p-4">
            <span className="micro-label">识别流程说明</span>
            <ol className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-[var(--color-ink-dim)]">
              {[
                '图片质量检查（大小/格式/清晰度）',
                'AI 形态特征分析（叶/花/果/茎）',
                '生成候选物种与置信度',
                '检索正式植物数据库比对',
                '比对相似与易混淆物种',
                '显示不确定性与进一步辨认要点',
                '给出危险警告与安全声明',
              ].map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-[var(--color-sand)]">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* 右：结果 */}
        <div>
          {stage === 'idle' && !result && (
            <EmptyState
              icon="leaf"
              title="等待识别"
              hint="上传一张植物照片后点击「开始识别」。识别结果仅供参考，禁止据此食用或药用。"
            />
          )}

          {(stage === 'checking' || stage === 'analyzing') && (
            <Panel className="flex flex-col items-center gap-3 p-10">
              <Spinner size={26} />
              <p className="text-[13.5px] text-[var(--color-ink-dim)]">
                {stage === 'checking'
                  ? '正在检查图片质量…'
                  : 'AI 正在分析形态特征并比对植物数据库…'}
              </p>
            </Panel>
          )}

          {stage === 'done' && result && (
            <div className="flex flex-col gap-4 fade-in">
              {/* 危险警告（始终显示） */}
              <div className="overflow-hidden rounded-[3px] border border-[var(--color-danger)]">
                <div className="hazard-stripe h-2" />
                <div className="bg-[var(--color-danger-dim)] px-4 py-3 text-[13px]">
                  <div className="flex items-center gap-2 font-bold text-[var(--color-danger)]">
                    <Icon name="warning" size={15} /> 安全警告
                  </div>
                  <p className="mt-1.5 leading-relaxed text-[var(--color-ink)]">
                    <b>禁止</b>
                    基于本识别结果食用、试尝或药用任何植物。识别存在误差，相似物种可能剧毒。
                    如需确认，请携带完整样本（根/茎/叶/花/果）咨询植物学专业人员。
                  </p>
                </div>
              </div>

              {/* 身份确认状态 */}
              <Panel className={`p-4 ${confirmed ? '' : 'border-[var(--color-warn)]'}`}>
                <div className="flex items-center justify-between">
                  <span className="micro-label">识别状态</span>
                  <span
                    className="danger-badge"
                    style={{ color: confirmed ? 'var(--color-moss-hi)' : 'var(--color-warn)' }}
                  >
                    {confirmed ? '候选置信度较高（仍需人工确认）' : '⚠ 身份未确认'}
                  </span>
                </div>
                {!confirmed && (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-warn)]">
                    当前置信度不足，无法确认物种。以下仅为可能的候选，<b>不得据此做任何处置</b>。
                  </p>
                )}
              </Panel>

              {/* 候选物种 */}
              {result.candidates.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="未找到匹配候选"
                  hint="图片可能不清晰或不包含关键识别部位。建议拍摄叶片正面、花朵与整株后重试。"
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {result.candidates.map((c, i) => (
                    <Panel key={i} className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">
                            #{i + 1}
                          </span>
                          <span className="text-[15px] font-bold">{c.name}</span>
                          {c.scientificName && (
                            <span className="font-mono text-[12px] italic text-[var(--color-sand)]">
                              {c.scientificName}
                            </span>
                          )}
                        </div>
                        <span
                          className="font-mono text-[13px]"
                          style={{
                            color:
                              c.confidence >= 0.75
                                ? 'var(--color-moss-hi)'
                                : c.confidence >= 0.5
                                  ? 'var(--color-warn)'
                                  : 'var(--color-danger)',
                          }}
                        >
                          {(c.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-2 progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${c.confidence * 100}%` }}
                        />
                      </div>
                      {c.matchedId && (
                        <Link
                          to={`/plants/${c.matchedId}`}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-info)] hover:underline"
                        >
                          <Icon name="chevron" size={12} /> 查看图鉴详情并比对特征
                        </Link>
                      )}
                    </Panel>
                  ))}
                </div>
              )}

              {/* AI 提取的特征 */}
              {result.features.length > 0 && (
                <Panel className="p-4">
                  <span className="micro-label">AI 提取的形态特征</span>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {result.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-[13px] text-[var(--color-ink-dim)]">
                        <span className="text-[var(--color-moss-hi)]">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {/* 进一步辨认 */}
              {result.needMoreFeatures.length > 0 && (
                <Panel className="p-4" accent="sand">
                  <span className="micro-label">进一步辨认需要的特征</span>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {result.needMoreFeatures.map((f, i) => (
                      <Tag key={i}>{f}</Tag>
                    ))}
                  </div>
                </Panel>
              )}

              {/* 不确定性说明 */}
              <Panel className="p-4">
                <span className="micro-label">不确定性说明</span>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
                  {result.uncertainty ||
                    '模型识别基于图片可见特征，存在同属近似种混淆的可能；光线、角度、季节都会影响判断。'}
                </p>
              </Panel>

              {result.warning && (
                <div className="rounded-[3px] border border-[var(--color-warn)] bg-[var(--color-warn-dim)]/40 px-4 py-3 text-[13px] text-[var(--color-warn)]">
                  <Icon name="warning" size={14} className="mr-1.5 inline" />
                  {result.warning}
                </div>
              )}

              <Link to="/plants" className="btn btn-sand justify-center">
                浏览完整植物图鉴手动比对 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
