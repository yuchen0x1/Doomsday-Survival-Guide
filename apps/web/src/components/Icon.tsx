import type { CSSProperties } from 'react';

/** 统一图标体系：24px 线性 SVG 图标 */

const PATHS: Record<string, string> = {
  compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3.5 6.5-2 5.5-5.5 2 2-5.5 5.5-2Z',
  mountain: 'M3 20 9 8l4 6 2.5-3.5L21 20H3Zm10.5-14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  leaf: 'M5 19C5 10 11 4 20 4c0 9-5 15-13 15h-2Zm0 0c1-5 4-9 8-11',
  paw: 'M12 14c-2.5 0-5 2-5 4.5S9.5 22 12 22s5-1 5-3.5S14.5 14 12 14ZM6.5 9.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm11 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM10 6.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm4 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
  bug: 'M9 4.5A2.5 2.5 0 0 1 11.5 7h1A2.5 2.5 0 0 1 15 4.5M8 9h8v5a4 4 0 0 1-8 0V9Zm-4 2h4m8 0h4M7 13l-2.5 2M17 13l2.5 2M7 17l-2 2.5M17 17l2 2.5M12 9v10',
  pill: 'M8.5 3.5a5 5 0 0 1 7 0l5 5a5 5 0 0 1-7 7l-5-5a5 5 0 0 1 0-7Zm-2 9 6-6',
  firstaid: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8m-4-4h8',
  tool: 'M14.5 4.5a4 4 0 0 0 5 5L9 20a3 3 0 0 1-4-4L14.5 4.5Z',
  hammer: 'm14 4 6 6-2.5 2.5-6-6L14 4ZM12 9.5 4 17.5 6.5 20l8-8',
  jar: 'M7 4h10m-9 3h8l-1 13H8L7 7Zm2 4h6',
  droplet: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  cloud: 'M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-1 8.5H7Z',
  earth: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3.5 9h17M3.5 15h17M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  warning: 'M12 3 2.5 20h19L12 3Zm0 6v5m0 3v.5',
  sprout: 'M12 21v-7m0 0c-4 0-6-2.5-6-6 4 0 6 2.5 6 6Zm0 0c0-3.5 2-6 6-6 0 3.5-2 6-6 6Z',
  bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  wrench: 'M20 6.5a5 5 0 0 1-6.5 6L6 20a2.1 2.1 0 0 1-3-3l7.5-7.5A5 5 0 0 1 16.5 3L14 5.5 18 9l2.5-2.5Z',
  brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V16a3 3 0 0 0 4 2.8V4Zm0 0a3 3 0 0 1 3 3v13m0-16a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V16a3 3 0 0 1-4 2.8M6 12h3m6 0h3',
  shield: 'M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5.5 11.5L21 20',
  bookmark: 'M6 3h12v18l-6-4.5L6 21V3Z',
  history: 'M12 5a7 7 0 1 1-6.7 9M4 5v4h4',
  home: 'M4 11 12 4l8 7v9h-5v-6h-6v6H4v-9Z',
  book: 'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h9',
  calculator: 'M6 3h12v18H6V3Zm3 3h6M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 15h.01M12 15h.01M15.5 15v3M8.5 18h3.5',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15',
  bot: 'M12 3a7 7 0 0 1 7 7v4a7 7 0 0 1-14 0v-4a7 7 0 0 1 7-7Zm-3 7h.01M15 10h.01M9 16h6M12 3V1m0 22v-2',
  download: 'M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8-3-1.5 2.5L16 9l.5 3 2.5 2-1 3-3-.5-2 2-2-1-2 1-2-2-3 .5-1-3 2.5-2L6 9l-2.5-1.5L2 6l3-1 2.5 1L9 4l3-1 1.5 2L16 4l3 1-1 1Z',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-8 17a8 8 0 0 1 16 0',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
  'chevron-left': 'm15 6-6 6 6 6',
  'chevron-down': 'm6 9 6 6 6-6',
  camera: 'M4 7h4l2-2h4l2 2h4v13H4V7Zm8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M5 7h14M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6',
  edit: 'M4 20h4L20 8l-4-4L4 16v4Zm11-13 4 4',
  check: 'm4 13 5 5L20 6',
  flame: 'M12 22c4 0 6-2.5 6-6 0-4-3-6-4-9-1.5 2-2.5 3-4 4-1.5-1-2-2.5-2-4-2 2-2 5-2 7 0 4 2 8 6 8Z',
  tent: 'M12 4 3 20h18L12 4Zm0 0v16M7 20l5-8 5 8',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  tag: 'M3 12V4h8l10 10-8 8L3 12Zm5-5h.01',
  star: 'm12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.3 6.4 20.3l1.2-6.3L3 9.6l6.3-.8L12 3Z',
  play: 'M7 4.5v15l13-7.5L7 4.5Z',
  'arrow-left': 'M20 12H4m0 0 6-6m-6 6 6 6',
  external: 'M14 4h6v6m0-6L10 14M9 5H5v14h14v-4',
  'wifi-off': 'M3 3l18 18M12 18h.01M8.5 14.5a5 5 0 0 1 5-1.3M5 11a10 10 0 0 1 4-2.4M2 8a15 15 0 0 1 5-3M19 11a10 10 0 0 0-3-2M22 8a15 15 0 0 0-6-3.3',
  database: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5',
  upload: 'M12 21V9m0 0-4.5 4.5M12 9l4.5 4.5M4 5h16',
  print: 'M7 8V3h10v5M7 17H4V9h16v8h-3m-10-4h10v8H7v-8Z',
  clipboard: 'M9 4h6v3H9V4ZM7 5H5v16h14V5h-2M9 12h6m-6 4h6',
  heart: 'M12 21S3.5 15 3.5 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5C20.5 15 12 21 12 21Z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  lock: 'M6 10h12v10H6V10Zm3 0V7a3 3 0 0 1 6 0v3',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 8v5m0-8.5v.01',
  copy: 'M8 8h12v12H8V8Zm-4 8V4h12',
  send: 'M3 11.5 21 3l-8.5 18-2.5-7-7-2.5Z',
  stop: 'M6 6h12v12H6z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4.5V12l4 2',
  users: 'M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM2 20a7 7 0 0 1 14 0M17 5a3.5 3.5 0 0 1 0 7m2 3a6 6 0 0 1 3 5',
  box: 'M4 8l8-4 8 4v9l-8 4-8-4V8Zm0 0 8 4m8-4-8 4m0 9V12',
  flask: 'M10 3h4m-3 0v6L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-6-10V3M7.5 15h9',
  navigation: 'm3 11 18-8-8 18-2-8-8-2Z',
};

export type IconName = keyof typeof PATHS | string;

export function Icon({
  name, size = 18, className = '', style,
}: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  const d = PATHS[name] ?? PATHS.info;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS);
