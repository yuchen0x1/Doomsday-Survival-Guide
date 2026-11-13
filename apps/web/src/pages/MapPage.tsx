import type { MapMarker, MapMarkerKind } from '@apocalypse/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { Confirm, EmptyState, Modal, PageHeader, Panel, Tag } from '../components/ui';
import { listMapMarkers, removeMapMarker, saveMapMarker, uid } from '../lib/db';
import { useApp } from '../lib/store';

/**
 * 生存地图：
 * - 自定义瓦片服务（MAP_TILE_URL 可配置替换，见 .env.example）
 * - 用户标记（水源/避难/危险/路线/物资/自定义）全部本地保存
 * - 隐私：默认 private=true，不公开位置；未核实地点不得标记为安全避难点
 * 无网络时瓦片不可用，但标记数据仍完整可读可编辑。
 */

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '© OpenStreetMap contributors';

const MARKER_KINDS: { key: MapMarkerKind; label: string; color: string }[] = [
  { key: 'water', label: '水源', color: '#5a9bb5' },
  { key: 'shelter', label: '避难所', color: '#6b8f5e' },
  { key: 'danger', label: '危险区', color: '#d84a3b' },
  { key: 'supply', label: '物资点', color: '#c9a961' },
  { key: 'route', label: '路线点', color: '#e08b34' },
  { key: 'custom', label: '自定义', color: '#9aa096' },
];

const ZOOM = 13;
const TILE_SIZE = 256;

function deg2num(lat: number, lon: number, zoom: number) {
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

export default function MapPage() {
  const { online, toast } = useApp();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [center, setCenter] = useState({ lat: 39.9042, lng: 116.4074 }); // 北京
  const [adding, setAdding] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    name: '',
    kind: 'water' as MapMarkerKind,
    note: '',
    verified: false,
    private: true,
  });
  const [delTarget, setDelTarget] = useState<MapMarker | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const refresh = useCallback(async () => setMarkers(await listMapMarkers()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 地理定位（失败则用默认中心）
  const locate = () => {
    if (!navigator.geolocation) {
      toast('当前环境不支持定位', 'warn');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast('定位失败，已保持当前视野', 'warn'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // 投影：中心 → 瓦片坐标
  const { x: cx, y: cy } = useMemo(() => deg2num(center.lat, center.lng, ZOOM), [center]);
  const world = 2 ** ZOOM;
  const tiles: { x: number; y: number }[] = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const x = (((cx + dx) % world) + world) % world;
      const y = cy + dy;
      if (y >= 0 && y < world) tiles.push({ x, y });
    }
  }

  // 标记投影：相对中心的像素偏移（WebMercator 简化）
  const project = useCallback(
    (lat: number, lng: number) => {
      const n = 2 ** ZOOM * TILE_SIZE;
      const toX = (l: number) => ((l + 180) / 360) * n;
      const toY = (la: number) => {
        const r = (la * Math.PI) / 180;
        return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
      };
      const px = toX(lng) - toX(center.lng);
      const py = toY(lat) - toY(center.lat);
      return { px, py };
    },
    [center],
  );

  // 点击地图 → 取经纬度（反投影）
  const unproject = useCallback(
    (px: number, py: number) => {
      const n = 2 ** ZOOM * TILE_SIZE;
      const fromX = (x: number) => (x / n) * 360 - 180;
      const fromY = (y: number) => {
        const t = Math.PI - (2 * Math.PI * y) / n;
        return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(t) - Math.exp(-t)));
      };
      const cxPx = ((center.lng + 180) / 360) * n;
      const r = (center.lat * Math.PI) / 180;
      const cyPx = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
      return { lat: fromY(cyPx + py), lng: fromX(cxPx + px) };
    },
    [center],
  );

  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    const pos = unproject(px, py);
    setForm({ name: '', kind: 'water', note: '', verified: false, private: true });
    setAdding(pos);
  };

  const saveMarker = async () => {
    if (!adding) return;
    if (!form.name.trim()) {
      toast('请填写标记名称', 'warn');
      return;
    }
    if (form.kind === 'shelter' && !form.verified) {
      toast('未核实的地点不能标记为安全避难点', 'warn');
      return;
    }
    const m: MapMarker = {
      id: uid(),
      kind: form.kind,
      name: form.name.trim(),
      lat: adding.lat,
      lng: adding.lng,
      note: form.note.trim() || undefined,
      verified: form.verified,
      private: form.private,
      createdAt: new Date().toISOString(),
    };
    await saveMapMarker(m);
    setMarkers(await listMapMarkers());
    setAdding(null);
    toast('标记已保存到本地', 'success');
  };

  const pan = (dLat: number, dLng: number) => {
    setCenter((c) => ({ lat: c.lat + dLat, lng: c.lng + dLng }));
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon="map"
        title="生存地图"
        subtitle={`${markers.length} 个本地标记 · 瓦片服务可配置 · 位置数据默认私有`}
        actions={
          <>
            <button type="button" className="btn" onClick={() => setListOpen(true)}>
              <Icon name="list" size={14} /> 标记列表
            </button>
            <button type="button" className="btn btn-sand" onClick={locate}>
              <Icon name="navigation" size={14} /> 我的位置
            </button>
          </>
        }
      />

      {!online && (
        <div className="mb-3 rounded-[3px] border border-[var(--color-warn)] bg-[var(--color-warn-dim)]/40 px-4 py-2.5 text-[12.5px] text-[var(--color-warn)]">
          <Icon name="wifi-off" size={14} className="mr-1.5 inline" />
          当前离线：地图瓦片无法加载（灰底），但你的标记数据完整可用，可正常查看与编辑。
        </div>
      )}

      <Panel className="overflow-hidden p-0">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-edge)] bg-[var(--color-panel)] px-3.5 py-2.5">
          <span className="micro-label">图层标记</span>
          {MARKER_KINDS.map((k) => {
            const n = markers.filter((m) => m.kind === k.key).length;
            return (
              <span
                key={k.key}
                className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-dim)]"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: k.color }}
                />
                {k.label}
                <span className="font-mono opacity-60">{n}</span>
              </span>
            );
          })}
          <span className="ml-auto font-mono text-[11px] text-[var(--color-ink-faint)]">
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)} · z{ZOOM}
          </span>
        </div>

        {/* 地图主体 */}
        <div
          className="relative h-[480px] cursor-crosshair overflow-hidden bg-[#1a1f1a] select-none"
          onClick={onMapClick}
        >
          {/* 瓦片层 */}
          <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
            <div className="relative" style={{ width: TILE_SIZE * 5, height: TILE_SIZE * 5 }}>
              {tiles.map((t, i) => (
                <img
                  key={`${t.x}-${t.y}-${i}`}
                  src={TILE_URL.replace('{z}', String(ZOOM))
                    .replace('{x}', String(t.x))
                    .replace('{y}', String(t.y))}
                  alt=""
                  className="absolute"
                  style={{
                    left: (i % 5) * TILE_SIZE,
                    top: Math.floor(i / 5) * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    opacity: online ? 0.9 : 0.06,
                    filter: online ? 'saturate(0.55) brightness(0.72) contrast(1.1)' : 'none',
                  }}
                  onError={() => setUsingFallback(true)}
                  draggable={false}
                />
              ))}
            </div>
          </div>

          {/* 网格（离线兜底视觉） */}
          {!online && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(74,107,63,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(74,107,63,.15) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* 中心十字 */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-6 w-6">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-sand)]/70" />
              <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-[var(--color-sand)]/70" />
            </div>
          </div>

          {/* 标记 */}
          {markers.map((m) => {
            const { px, py } = project(m.lat, m.lng);
            const color = MARKER_KINDS.find((k) => k.key === m.kind)?.color ?? '#9aa096';
            if (Math.abs(px) > 400 || Math.abs(py) > 400) return null;
            return (
              <div
                key={m.id}
                className="group absolute z-10 -translate-x-1/2 -translate-y-full cursor-pointer"
                style={{ left: `calc(50% + ${px}px)`, top: `calc(50% + ${py}px)` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`${m.name}\n${m.note ?? ''}\n\n删除该标记？`)) {
                    removeMapMarker(m.id).then(refresh);
                  }
                }}
                title={`${m.name}${m.verified ? '（已核实）' : m.kind === 'shelter' ? '（未核实）' : ''}`}
              >
                <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true">
                  <path
                    d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z"
                    fill={color}
                  />
                  <circle cx="11" cy="11" r="4.5" fill="#0b0d0c" />
                  {m.verified && (
                    <circle
                      cx="18"
                      cy="4"
                      r="4"
                      fill="#6b8f5e"
                      stroke="#0b0d0c"
                      strokeWidth="1.5"
                    />
                  )}
                </svg>
                <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-black/75 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {m.name}
                </span>
              </div>
            );
          })}

          {/* 提示 */}
          <div className="pointer-events-none absolute bottom-2.5 left-3 rounded-[2px] bg-black/55 px-2.5 py-1 text-[10.5px] text-white/75">
            点击地图任意位置添加标记 · {ATTRIBUTION}
          </div>

          {/* 方向控制 */}
          <div className="absolute right-3 top-3 flex flex-col gap-1">
            {[
              { d: [-0.03, 0], icon: 'chevron-down', rot: 180 },
              { d: [0.03, 0], icon: 'chevron-down', rot: 0 },
              { d: [0, -0.04], icon: 'chevron-down', rot: 90 },
              { d: [0, 0.04], icon: 'chevron-down', rot: -90 },
            ].map((b, i) => (
              <button
                type="button"
                key={i}
                className="btn !bg-black/60 !px-2 !py-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  pan(b.d[0], b.d[1]);
                }}
              >
                <Icon name={b.icon} size={14} style={{ transform: `rotate(${b.rot}deg)` }} />
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-[var(--color-ink-faint)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#6b8f5e]" /> 绿色对勾 = 已核实
        </span>
        <span>隐私：所有标记仅存本机，默认私有，不上传不公开</span>
        <span>瓦片服务可通过 MAP_TILE_URL 配置替换</span>
      </div>

      {/* 添加标记 */}
      <Modal open={!!adding} title="添加地图标记" onClose={() => setAdding(null)}>
        {adding && (
          <div className="flex flex-col gap-3.5">
            <div className="font-mono text-[12px] text-[var(--color-ink-faint)]">
              坐标 {adding.lat.toFixed(5)}, {adding.lng.toFixed(5)}
            </div>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              名称 *
              <input
                className="field mt-1.5"
                value={form.name}
                placeholder="如：东侧水井"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              类型
              <select
                className="field mt-1.5"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as MapMarkerKind })}
              >
                {MARKER_KINDS.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              备注
              <textarea
                className="field mt-1.5 min-h-[70px]"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[var(--color-ink-dim)]">
              <input
                type="checkbox"
                className="accent-[var(--color-moss-hi)]"
                checked={form.verified}
                onChange={(e) => setForm({ ...form, verified: e.target.checked })}
              />
              我已实地核实该地点（安全避难点必须勾选）
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[var(--color-ink-dim)]">
              <input
                type="checkbox"
                className="accent-[var(--color-moss-hi)]"
                checked={form.private}
                onChange={(e) => setForm({ ...form, private: e.target.checked })}
              />
              私有标记（默认开启，不对外共享）
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setAdding(null)}>
                取消
              </button>
              <button type="button" className="btn btn-primary" onClick={saveMarker}>
                <Icon name="check" size={14} /> 保存标记
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 标记列表 */}
      <Modal
        open={listOpen}
        title={`全部标记（${markers.length}）`}
        onClose={() => setListOpen(false)}
        width={560}
      >
        {markers.length === 0 ? (
          <EmptyState icon="map" title="还没有标记" hint="点击地图任意位置创建第一个标记。" />
        ) : (
          <div className="flex flex-col gap-2">
            {markers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3 py-2.5"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: MARKER_KINDS.find((k) => k.key === m.kind)?.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-medium">{m.name}</span>
                    {m.verified && (
                      <span className="danger-badge" style={{ color: 'var(--color-moss-hi)' }}>
                        已核实
                      </span>
                    )}
                    {m.private && (
                      <span className="danger-badge" style={{ color: 'var(--color-ink-faint)' }}>
                        私有
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">
                    {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                  </div>
                  {m.note && (
                    <div className="text-[12px] text-[var(--color-ink-dim)]">{m.note}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn !px-2 !py-1"
                  onClick={() => {
                    setCenter({ lat: m.lat, lng: m.lng });
                    setListOpen(false);
                  }}
                >
                  <Icon name="navigation" size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-danger !px-2 !py-1"
                  onClick={() => setDelTarget(m)}
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Confirm
        open={!!delTarget}
        danger
        title="删除标记"
        message={`确定删除「${delTarget?.name}」吗？`}
        confirmText="删除"
        onCancel={() => setDelTarget(null)}
        onConfirm={() => {
          if (delTarget) removeMapMarker(delTarget.id).then(refresh);
          setDelTarget(null);
          toast('已删除', 'info');
        }}
      />

      {usingFallback && <span className="hidden" />}
    </div>
  );
}
