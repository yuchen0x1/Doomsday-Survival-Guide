import { Component, lazy, type ReactNode, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

/* 路由级代码分割（核心图鉴页直接打包，保证首屏与离线可用） */
const Home = lazy(() => import('./pages/Home'));
const KnowledgeList = lazy(() => import('./pages/knowledge/KnowledgeList'));
const ArticleDetail = lazy(() => import('./pages/knowledge/ArticleDetail'));
const PlantList = lazy(() => import('./pages/plants/PlantList'));
const PlantDetail = lazy(() => import('./pages/plants/PlantDetail'));
const PlantIdentify = lazy(() => import('./pages/plants/PlantIdentify'));
const AnimalList = lazy(() => import('./pages/animals/AnimalList'));
const AnimalDetail = lazy(() => import('./pages/animals/AnimalDetail'));
const InsectList = lazy(() => import('./pages/insects/InsectList'));
const InsectDetail = lazy(() => import('./pages/insects/InsectDetail'));
const MedicineList = lazy(() => import('./pages/medicines/MedicineList'));
const MedicineDetail = lazy(() => import('./pages/medicines/MedicineDetail'));
const FirstAidList = lazy(() => import('./pages/firstaid/FirstAidList'));
const FirstAidDetail = lazy(() => import('./pages/firstaid/FirstAidDetail'));
const SkillList = lazy(() => import('./pages/skills/SkillList'));
const SkillDetail = lazy(() => import('./pages/skills/SkillDetail'));
const SupplyList = lazy(() => import('./pages/supplies/SupplyList'));
const SupplyDetail = lazy(() => import('./pages/supplies/SupplyDetail'));
const InventoryPage = lazy(() => import('./pages/supplies/InventoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const AIPage = lazy(() => import('./pages/AIPage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const SimulatorList = lazy(() => import('./pages/simulator/SimulatorList'));
const SimulatorPlay = lazy(() => import('./pages/simulator/SimulatorPlay'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const HazardList = lazy(() => import('./pages/hazards/HazardList'));
const HazardDetail = lazy(() => import('./pages/hazards/HazardDetail'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton h-9 w-64" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28" />
        ))}
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-xl p-6">
          <h2 className="mb-2 text-lg font-semibold">页面出错了</h2>
          <p className="mb-4 text-sm text-[var(--color-ink-faint)]">
            {this.state.error.message || '未知错误'}（你的本地数据不受影响）
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              重新加载
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/knowledge" element={<KnowledgeList />} />
            <Route path="/knowledge/:categorySlug" element={<KnowledgeList />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/plants" element={<PlantList />} />
            <Route path="/plants/identify" element={<PlantIdentify />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/animals" element={<AnimalList />} />
            <Route path="/animals/:id" element={<AnimalDetail />} />
            <Route path="/insects" element={<InsectList />} />
            <Route path="/insects/:id" element={<InsectDetail />} />
            <Route path="/medicines" element={<MedicineList />} />
            <Route path="/medicines/:id" element={<MedicineDetail />} />
            <Route path="/first-aid" element={<FirstAidList />} />
            <Route path="/first-aid/:id" element={<FirstAidDetail />} />
            <Route path="/skills" element={<SkillList />} />
            <Route path="/skills/:id" element={<SkillDetail />} />
            <Route path="/supplies" element={<SupplyList />} />
            <Route path="/supplies/:id" element={<SupplyDetail />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="/calculators" element={<CalculatorsPage />} />
            <Route path="/calculator/:slug" element={<CalculatorsPage />} />
            <Route path="/simulator" element={<SimulatorList />} />
            <Route path="/simulator/:id" element={<SimulatorPlay />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/hazards" element={<HazardList />} />
            <Route path="/hazard/:id" element={<HazardDetail />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}
