import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from '../src/components/AppLayout';
import { I18nProvider } from '../src/lib/i18n';

vi.mock('../src/lib/update', () => ({
  PwaUpdateProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('../src/components/PwaUpdate', () => ({ PwaUpdateBanner: () => null }));
vi.mock('../src/components/NativeUpdateBanner', () => ({ NativeUpdateBanner: () => null }));

afterEach(() => vi.unstubAllGlobals());

describe('responsive application navigation', () => {
  it.each(['zh-CN', 'en-US'])('labels the AI mobile tab correctly for %s', (locale) => {
    vi.stubGlobal('navigator', { languages: [locale], onLine: true });
    const html = renderToStaticMarkup(
      <I18nProvider>
        <MemoryRouter initialEntries={['/ai']}>
          <AppLayout>Content</AppLayout>
        </MemoryRouter>
      </I18nProvider>,
    );
    const mobileNav = html.match(/<nav class="fixed[\s\S]*?<\/nav>/)?.[0];
    expect(mobileNav).toBeDefined();
    const aiLink = mobileNav?.match(/<a[^>]*href="\/ai"[^>]*>([\s\S]*?)<\/a>/)?.[1];
    expect(aiLink).toBeDefined();
    expect(aiLink).toMatch(/<\/svg>AI$/);
    expect(aiLink).not.toContain(locale === 'zh-CN' ? '搜索' : 'Search');
    expect(html).toContain(`aria-label="${locale === 'zh-CN' ? 'AI 助手' : 'AI assistant'}"`);
  });
});
