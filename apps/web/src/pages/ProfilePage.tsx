import type { EmergencyContact, SurvivalProfile } from '@apocalypse/core';
import { useEffect, useState } from 'react';
import { BackupControls } from '../components/BackupControls';
import { Icon } from '../components/Icon';
import { Confirm, PageHeader, Panel, Tag } from '../components/ui';
import { loadProfile, saveProfile, uid } from '../lib/db';
import { skills } from '../lib/knowledge';
import { useApp } from '../lib/store';

const EMPTY: SurvivalProfile = {
  id: 'profile-1',
  displayName: '',
  householdSize: 1,
  skills: [],
  contacts: [],
  shelterPlan: '',
  notes: '',
  updatedAt: '',
};

/** 个人生存档案：家庭/技能/联系人/避难计划/笔记（本地保存）+ 备份恢复 */
export default function ProfilePage() {
  const { bookmarks, history, toast, inventory } = useApp();
  const [profile, setProfile] = useState<SurvivalProfile>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      if (p) setProfile(p);
      setLoaded(true);
    });
  }, []);

  const persist = async (next: SurvivalProfile) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setProfile(updated);
    await saveProfile(updated);
  };

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast('请填写姓名与电话', 'warn');
      return;
    }
    const c: EmergencyContact = { id: uid(), ...newContact };
    persist({ ...profile, contacts: [...profile.contacts, c] });
    setNewContact({ name: '', relation: '', phone: '' });
  };

  if (!loaded) return <div className="skeleton h-40 w-full" />;

  const knownSkills = skills.filter((s) => profile.skills.includes(s.title));

  return (
    <div className="fade-in">
      <PageHeader
        icon="user"
        title="个人生存档案"
        subtitle="家庭 · 技能 · 紧急联系人 · 避难计划 · 笔记 · 敏感数据仅本地保存"
        actions={
          <>
            <BackupControls />
            <button type="button" className="btn btn-danger" onClick={() => setConfirmWipe(true)}>
              <Icon name="trash" size={14} /> 清除本地数据
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* 基本信息 */}
          <Panel className="p-4" accent="moss">
            <span className="micro-label">基本信息 · IDENTITY</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-[12.5px] text-[var(--color-ink-dim)]">
                称呼
                <input
                  className="field mt-1.5"
                  value={profile.displayName}
                  placeholder="如：张家"
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  onBlur={() => persist(profile)}
                />
              </label>
              <label className="text-[12.5px] text-[var(--color-ink-dim)]">
                家庭人数
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="field mt-1.5"
                  value={profile.householdSize}
                  onChange={(e) =>
                    setProfile({ ...profile, householdSize: Number(e.target.value) })
                  }
                  onBlur={() => persist(profile)}
                />
              </label>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { label: '收藏', v: bookmarks.length },
                { label: '已读', v: history.length },
                { label: '物资', v: inventory.length },
                { label: '技能', v: profile.skills.length },
              ].map((x) => (
                <div
                  key={x.label}
                  className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] py-2.5"
                >
                  <div className="font-mono text-[18px] font-bold">{x.v}</div>
                  <div className="micro-label mt-0.5">{x.label}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 掌握技能 */}
          <Panel className="p-4">
            <span className="micro-label">掌握技能 · SKILLS</span>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.skills.length === 0 && (
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">
                  尚未登记任何技能
                </span>
              )}
              {profile.skills.map((s) => (
                <Tag key={s}>
                  {s}
                  <button
                    type="button"
                    className="ml-1.5 text-[var(--color-danger)]"
                    onClick={() =>
                      persist({ ...profile, skills: profile.skills.filter((x) => x !== s) })
                    }
                  >
                    ×
                  </button>
                </Tag>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <select
                className="field flex-1"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    persist({ ...profile, skills: [...profile.skills, e.target.value] });
                  }
                }}
              >
                <option value="">从图鉴添加技能…</option>
                {skills
                  .filter((s) => !profile.skills.includes(s.title))
                  .map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
              </select>
            </div>
            {knownSkills.length > 0 && (
              <div className="mt-3 text-[12px] text-[var(--color-ink-faint)]">
                已关联 {knownSkills.length} 个教程详情
              </div>
            )}
          </Panel>

          {/* 避难计划与笔记 */}
          <Panel className="p-4">
            <span className="micro-label">避难计划 · SHELTER PLAN</span>
            <textarea
              className="field mt-2.5 min-h-[110px]"
              value={profile.shelterPlan}
              placeholder="集合点、路线、备选方案…"
              onChange={(e) => setProfile({ ...profile, shelterPlan: e.target.value })}
              onBlur={() => persist(profile)}
            />
            <div className="mt-4 micro-label">个人笔记 · NOTES</div>
            <textarea
              className="field mt-2.5 min-h-[110px]"
              value={profile.notes}
              placeholder="保险单号、医疗信息、重要提醒…"
              onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
              onBlur={() => persist(profile)}
            />
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-faint)]">
              <Icon name="lock" size={12} /> 以上内容仅保存在本机 IndexedDB，不上传任何服务器。
            </p>
          </Panel>
        </div>

        {/* 右栏：紧急联系人 */}
        <div className="flex flex-col gap-4">
          <Panel className="p-4" accent="danger">
            <span className="micro-label" style={{ color: 'var(--color-danger)' }}>
              紧急联系人 · EMERGENCY CONTACTS
            </span>
            <div className="mt-3 flex flex-col gap-2">
              {profile.contacts.length === 0 && (
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">
                  建议至少登记 2 位紧急联系人
                </span>
              )}
              {profile.contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium">
                      {c.name}{' '}
                      <span className="text-[11.5px] text-[var(--color-ink-faint)]">
                        {c.relation}
                      </span>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="font-mono text-[13px] text-[var(--color-info)]"
                    >
                      {c.phone}
                    </a>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger !px-2 !py-1"
                    onClick={() =>
                      persist({
                        ...profile,
                        contacts: profile.contacts.filter((x) => x.id !== c.id),
                      })
                    }
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <input
                className="field"
                placeholder="姓名 *"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <div className="flex gap-2">
                <input
                  className="field"
                  placeholder="关系"
                  value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                />
                <input
                  className="field"
                  placeholder="电话 *"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <button type="button" className="btn btn-primary" onClick={addContact}>
                <Icon name="plus" size={14} /> 添加联系人
              </button>
            </div>
          </Panel>

          <Panel className="p-4">
            <span className="micro-label">数据安全 · SECURITY</span>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[12px] text-[var(--color-ink-dim)]">
              <li>· 敏感数据仅存本地，不经过网络</li>
              <li>· 支持一键导出 / 恢复 JSON 备份</li>
              <li>· 清除数据不可恢复，请先导出备份</li>
              <li>· 各端个人数据使用 IndexedDB 保存</li>
            </ul>
          </Panel>
        </div>
      </div>

      <Confirm
        open={confirmWipe}
        danger
        title="清除全部本地数据"
        message="⚠ 这将删除本机上的收藏、历史、物资、笔记、档案、学习记录与地图标记，且不可恢复。确定继续吗？（建议先导出备份）"
        confirmText="我已备份，继续清除"
        onCancel={() => setConfirmWipe(false)}
        onConfirm={async () => {
          try {
            const { clearAllData } = await import('../lib/db');
            await clearAllData();
            toast('本应用数据已清除', 'success');
            setTimeout(() => window.location.reload(), 800);
          } catch {
            toast('清除失败，请重试', 'error');
          }
        }}
      />
    </div>
  );
}
