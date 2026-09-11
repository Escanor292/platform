'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  GripVertical,
  LayoutTemplate,
  Palette,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Star,
  Undo2,
} from 'lucide-react';
import {
  applyPresetLayout,
  DEFAULT_PROFILE_CUSTOMIZATION,
  PROFILE_PRESETS,
  type ProfileAudience,
  type ProfileCustomizationConfig,
  type ProfilePreset,
} from '@/lib/profile-customization';
import ProfileStudioPreview from '@/components/profile/ProfileStudioPreview';
import SectionDragList from '@/components/profile/SectionDragList';
import { ProfileTemplateLibrary } from '@/components/profile/ProfileTemplateLibrary';

type Option = { id: string; title: string; slug?: string; status?: string; projectId?: string | null; campaignId?: string | null };
type Options = { projects: Option[]; campaigns: Option[]; rewards: Option[]; blogPosts: Option[] };
type PreviewMode = 'desktop' | 'mobile';

const PRESET_DESCRIPTIONS: Record<ProfilePreset, string> = {
  minimal: 'Gọn gàng, tập trung vào giới thiệu và nội dung chính.',
  creator: 'Cân bằng giữa creator, project, campaign và sản phẩm.',
  project: 'Đặt dự án và câu chuyện phát triển làm trung tâm.',
  shop: 'Ưu tiên sản phẩm, tồn kho và các nút mua/ủng hộ.',
  community: 'Ưu tiên blog, thành tích, hoạt động và kết nối cộng đồng.',
};

const PRESET_THEME: Record<ProfilePreset, ProfileCustomizationConfig['theme']> = {
  minimal: { primary: '#334155', secondary: '#64748b', background: '#f8fafc', surface: '#ffffff', text: '#0f172a', muted: '#64748b', gradientColors: ['#334155', '#64748b'], gradientAngle: 135, radius: 'soft', cardStyle: 'bordered', fontPreset: 'modern', density: 'compact', heroStyle: 'minimal', reducedMotion: false },
  creator: DEFAULT_PROFILE_CUSTOMIZATION.theme,
  project: { primary: '#0f766e', secondary: '#2563eb', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a', muted: '#52716d', gradientColors: ['#0f766e', '#2563eb', '#7c3aed'], gradientAngle: 135, radius: 'round', cardStyle: 'elevated', fontPreset: 'modern', density: 'comfortable', heroStyle: 'cover', reducedMotion: false },
  shop: { primary: '#ea580c', secondary: '#db2777', background: '#fff7ed', surface: '#ffffff', text: '#431407', muted: '#9a3412', gradientColors: ['#ea580c', '#db2777'], gradientAngle: 120, radius: 'soft', cardStyle: 'elevated', fontPreset: 'friendly', density: 'compact', heroStyle: 'cover', reducedMotion: false },
  community: { primary: '#7c3aed', secondary: '#2563eb', background: '#f5f3ff', surface: '#ffffff', text: '#2e1065', muted: '#6d28d9', gradientColors: ['#7c3aed', '#2563eb', '#0f766e'], gradientAngle: 160, radius: 'round', cardStyle: 'bordered', fontPreset: 'friendly', density: 'comfortable', heroStyle: 'gradient', reducedMotion: false },
};

function cloneConfig(value: ProfileCustomizationConfig) {
  return JSON.parse(JSON.stringify(value)) as ProfileCustomizationConfig;
}

function AudienceSwitch({ value, onChange }: { value: ProfileAudience; onChange: (next: ProfileAudience) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-full bg-cream p-1" role="tablist" aria-label="Chế độ bố cục">
      {([
        { id: 'owner', label: 'Chính chủ' },
        { id: 'guest', label: 'Khách' },
      ] as const).map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition ${
            value === item.id ? 'bg-pgreen text-white shadow-sm' : 'text-gray-500 hover:text-dblue'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${value === item.id ? 'bg-white' : 'bg-gray-300'}`} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

function toggleId(ids: string[], id: string, max: number) {
  if (ids.includes(id)) return ids.filter((item) => item !== id);
  if (ids.length >= max) return ids;
  return [...ids, id];
}

export default function ProfileCustomizationEditor() {
  const [config, setConfig] = useState<ProfileCustomizationConfig>(cloneConfig(DEFAULT_PROFILE_CUSTOMIZATION));
  const [options, setOptions] = useState<Options>({ projects: [], campaigns: [], rewards: [], blogPosts: [] });
  const [versions, setVersions] = useState<Array<{ id: string; version: number; action: string; createdAt: string }>>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [audience, setAudience] = useState<ProfileAudience>('guest');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile/customization', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Không thể tải cấu hình');
        setConfig(body.draft);
        setOptions(body.options);
        setVersions(body.versions || []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không thể tải cấu hình'))
      .finally(() => setLoading(false));
  }, []);

  const patch = (next: Partial<ProfileCustomizationConfig>) => setConfig((current) => ({ ...current, ...next }));
  const patchTheme = (next: Partial<ProfileCustomizationConfig['theme']>) => setConfig((current) => ({ ...current, theme: { ...current.theme, ...next } }));

  const applyPreset = (preset: ProfilePreset) => {
    const next = applyPresetLayout(cloneConfig(config), preset);
    next.theme = { ...PRESET_THEME[preset] };
    setConfig(next);
    setMessage(`Đã áp dụng mẫu ${preset}`);
  };

  const save = async (action: 'save' | 'publish' | 'restore' | 'restore_version' | 'reset', versionId?: string) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/profile/customization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, config, versionId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Không thể lưu');
      setConfig(body.draft);
      setVersions(body.versions || versions);
      setMessage(action === 'publish' ? 'Đã xuất bản giao diện mới.' : action === 'restore' ? 'Đã khôi phục bản đã xuất bản.' : action === 'restore_version' ? 'Đã khôi phục phiên bản vào bản nháp.' : action === 'reset' ? 'Đã khôi phục mặc định trong bản nháp.' : 'Đã lưu bản nháp.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-10 shadow-soft text-center text-gray-500 shadow-sm">Đang tải trình tùy chỉnh...</div>;
  if (error && !config) return <div className="rounded-[2rem] bg-cream p-6 text-red-700">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="rounded-[2.5rem] border border-pgreen/10 bg-gradient-to-r from-cream via-white to-fgreen/5 p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-fgreen/20 bg-fgreen/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-pgreen"><Sparkles size={14} /> Profile Studio</div>
            <h2 className="font-display text-3xl font-black tracking-tight text-dblue sm:text-4xl">Thiết kế không gian của bạn</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">Tùy chỉnh trang cá nhân theo cá tính, thương hiệu creator hoặc câu chuyện dự án.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-pgreen/10 bg-white/70 px-3 py-2 text-xs font-bold text-pgreen"><Check size={15} /> An toàn theo hệ thống</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-pgreen/10 bg-white/90 p-5 shadow-soft backdrop-blur">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-pgreen"><Sparkles size={16} /> Bản chỉnh sửa riêng tư</div>
          <p className="mt-1 text-sm text-gray-500">Lưu nháp trước, kiểm tra preview rồi mới xuất bản ra trang công khai.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => save('restore')} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-cream/70"><Undo2 size={16} /> Khôi phục bản public</button>
          <button onClick={() => save('reset')} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-cream/70"><RotateCcw size={16} /> Mặc định</button>
          <button onClick={() => save('save')} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-dblue px-3 py-2 text-sm font-bold text-white transition hover:bg-dblue/90"><Save size={16} /> Lưu nháp</button>
          <button onClick={() => save('publish')} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-pgreen px-3 py-2 text-sm font-bold text-white hover:bg-pgreen/90"><Check size={16} /> Xuất bản</button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-fgreen/30 bg-fgreen/10 px-4 py-3 text-sm font-semibold text-pgreen">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <div className="space-y-8">
          <section className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-4 flex items-center gap-2"><LayoutTemplate className="text-pgreen" size={20} /><h2 className="font-display text-xl font-black text-dblue">Mẫu hệ thống</h2></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROFILE_PRESETS.map((preset) => (
                <button key={preset} onClick={() => applyPreset(preset)} className={`rounded-2xl border p-4 text-left transition ${config.preset === preset ? 'border-pgreen bg-fgreen/10 ring-2 ring-fgreen/20' : 'border-gray-200 hover:border-pgreen/40'}`}>
                  <div className="flex items-center justify-between"><span className="font-black capitalize text-dblue">{preset}</span>{config.preset === preset && <Check size={16} className="text-pgreen" />}</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{PRESET_DESCRIPTIONS[preset]}</p>
                </button>
              ))}
            </div>
          </section>

          <ProfileTemplateLibrary config={config} onApply={(next) => { setConfig(next); setMessage('Đã áp dụng mẫu vào bản nháp.'); }} />

          <section className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-4 flex items-center gap-2"><Palette className="text-pgreen" size={20} /><h2 className="font-display text-xl font-black text-dblue">Màu sắc và phong cách</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {([['primary', 'Màu chủ đạo'], ['secondary', 'Màu phụ'], ['background', 'Màu nền'], ['surface', 'Màu thẻ'], ['text', 'Màu chữ'], ['muted', 'Màu chữ phụ']] as const).map(([key, label]) => (
                <label key={key} className="rounded-2xl border border-gray-200 p-3 text-sm font-semibold text-gray-700">
                  <span>{label}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <input type="color" aria-label={`${label} picker`} value={config.theme[key]} onChange={(event) => patchTheme({ [key]: event.target.value } as Partial<ProfileCustomizationConfig['theme']>)} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" />
                    <input type="text" aria-label={`${label} mã HEX`} value={config.theme[key]} onChange={(event) => patchTheme({ [key]: event.target.value } as Partial<ProfileCustomizationConfig['theme']>)} className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs uppercase text-dblue outline-none transition focus:border-pgreen focus:ring-2 focus:ring-pgreen/10" maxLength={7} />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-gray-700">Kiểu card<select value={config.theme.cardStyle} onChange={(event) => patchTheme({ cardStyle: event.target.value as ProfileCustomizationConfig['theme']['cardStyle'] })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal"><option value="elevated">Nổi</option><option value="bordered">Có viền</option><option value="flat">Phẳng</option></select></label>
              <label className="text-sm font-bold text-gray-700">Bo góc<select value={config.theme.radius} onChange={(event) => patchTheme({ radius: event.target.value as ProfileCustomizationConfig['theme']['radius'] })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal"><option value="soft">Mềm</option><option value="round">Tròn</option><option value="pill">Pill</option></select></label>
              <label className="text-sm font-bold text-gray-700">Font<select value={config.theme.fontPreset} onChange={(event) => patchTheme({ fontPreset: event.target.value as ProfileCustomizationConfig['theme']['fontPreset'] })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal"><option value="modern">Hiện đại</option><option value="serif">Thanh lịch</option><option value="friendly">Thân thiện</option></select></label>
              <label className="text-sm font-bold text-gray-700">Mật độ<select value={config.theme.density} onChange={(event) => patchTheme({ density: event.target.value as ProfileCustomizationConfig['theme']['density'] })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal"><option value="comfortable">Thoáng</option><option value="compact">Gọn</option></select></label>
              <label className="text-sm font-bold text-gray-700">Kiểu hero<select value={config.theme.heroStyle} onChange={(event) => patchTheme({ heroStyle: event.target.value as ProfileCustomizationConfig['theme']['heroStyle'] })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal"><option value="cover">Cover</option><option value="gradient">Gradient</option><option value="minimal">Tối giản</option></select></label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {config.theme.gradientColors.map((color, index) => <label key={`${color}-${index}`} className="rounded-2xl border border-gray-200 p-3 text-sm font-semibold text-gray-700"><span>Màu gradient {index + 1}</span><span className="mt-2 flex items-center gap-2"><input type="color" aria-label={`Gradient ${index + 1} picker`} value={color} onChange={(event) => { const colors = [...config.theme.gradientColors]; colors[index] = event.target.value; patchTheme({ gradientColors: colors }); }} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" /><input type="text" aria-label={`Gradient ${index + 1} mã HEX`} value={color} onChange={(event) => { const colors = [...config.theme.gradientColors]; colors[index] = event.target.value; patchTheme({ gradientColors: colors }); }} className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs uppercase text-dblue outline-none transition focus:border-pgreen focus:ring-2 focus:ring-pgreen/10" maxLength={7} /></span></label>)}
            </div>
            <label className="mt-4 block text-sm font-bold text-gray-700">Góc gradient: {config.theme.gradientAngle}°<input type="range" min="0" max="360" value={config.theme.gradientAngle} onChange={(event) => patchTheme({ gradientAngle: Number(event.target.value) })} className="mt-2 w-full accent-pgreen" /></label>
            <label className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 p-3 text-sm font-semibold text-gray-700">Giảm chuyển động cho accessibility<input type="checkbox" checked={config.theme.reducedMotion} onChange={(event) => patchTheme({ reducedMotion: event.target.checked })} className="h-4 w-4 accent-pgreen" /></label>
          </section>

          <section className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><GripVertical className="text-pgreen" size={20} /><h2 className="font-display text-xl font-black text-dblue">Section và kéo-thả</h2></div>
              <AudienceSwitch value={audience} onChange={setAudience} />
            </div>
            <p className="mb-4 text-sm text-gray-500">
              {audience === 'owner'
                ? 'Bố cục khi bạn vào trang của mình. Tab luôn đủ, kể cả khi chưa có nội dung.'
                : 'Bố cục khách thấy. Ẩn/hiện và thứ tự chỉ áp dụng với người khác (và Chế độ xem).'}
            </p>
            <SectionDragList config={config} onChange={setConfig} audience={audience} />
          </section>

          <section className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-4 flex items-center gap-2"><Star className="text-amber-500" size={20} /><h2 className="font-display text-xl font-black text-dblue">Nội dung nổi bật</h2></div>
            <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
              {([['projectIds', 'Dự án', options.projects, 3], ['campaignIds', 'Chiến dịch', options.campaigns, 6], ['rewardIds', 'Sản phẩm', options.rewards, 12], ['blogPostIds', 'Blog', options.blogPosts, 6]] as const).map(([key, label, list, max]) => (
                <div key={key} className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 p-3">
                  <div className="mb-2 text-sm font-black text-dblue">{label} <span className="font-normal text-gray-400">(tối đa {max})</span></div>
                  <div className="max-h-48 space-y-1.5 overflow-y-auto overflow-x-hidden pr-1">
                    {list.length === 0 ? (
                      <p className="text-xs text-gray-400">Chưa có nội dung phù hợp.</p>
                    ) : list.map((item) => (
                      <label key={item.id} className="flex min-w-0 items-start gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={config.featured[key].includes(item.id)} onChange={() => patch({ featured: { ...config.featured, [key]: toggleId(config.featured[key], item.id, max) } })} className="mt-0.5 h-4 w-4 shrink-0 accent-pgreen" />
                        <span className="min-w-0 flex-1 break-words leading-5">{item.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
            <h2 className="mb-4 font-display text-xl font-black text-dblue">Thống kê và thử nghiệm</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-gray-200 p-3 text-sm font-semibold text-gray-700">Hiện thống kê ủng hộ<input type="checkbox" checked={config.analytics.showSupportStats} onChange={(event) => patch({ analytics: { ...config.analytics, showSupportStats: event.target.checked } })} className="h-4 w-4 accent-pgreen" /></label>
              <label className="flex items-center justify-between rounded-2xl border border-gray-200 p-3 text-sm font-semibold text-gray-700">Hiện tiến độ campaign<input type="checkbox" checked={config.analytics.showProgressStats} onChange={(event) => patch({ analytics: { ...config.analytics, showProgressStats: event.target.checked } })} className="h-4 w-4 accent-pgreen" /></label>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-ebrown/25 p-4"><div className="flex items-center justify-between"><div><div className="font-bold text-dblue">Thử nghiệm preset B</div><p className="text-xs text-gray-500">Chỉ là cấu hình rollout; chưa tự đổi dữ liệu kinh doanh.</p></div><input type="checkbox" checked={config.experiment.enabled} onChange={(event) => patch({ experiment: { ...config.experiment, enabled: event.target.checked } })} className="h-4 w-4 accent-pgreen" /></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={config.experiment.variantBPreset} onChange={(event) => patch({ experiment: { ...config.experiment, variantBPreset: event.target.value as ProfilePreset } })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="minimal">B: Minimal</option><option value="creator">B: Creator</option><option value="project">B: Project</option><option value="shop">B: Shop</option><option value="community">B: Community</option></select><label className="text-sm font-bold text-gray-700">Phân bổ {config.experiment.allocationPercent}%<input type="range" min="0" max="100" value={config.experiment.allocationPercent} onChange={(event) => patch({ experiment: { ...config.experiment, allocationPercent: Number(event.target.value) } })} className="mt-2 w-full accent-pgreen" /></label></div></div>
          </section>
        </div>

        <aside className="h-fit space-y-4 xl:sticky xl:top-6">
          <div className="rounded-[2.5rem] border border-pgreen/10 bg-white/90 p-4 shadow-soft backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-display text-xl font-black text-dblue"><Eye size={18} className="text-pgreen" /> Xem trước</div>
              <div className="flex flex-wrap items-center gap-2">
                <AudienceSwitch value={audience} onChange={setAudience} />
                <div className="flex gap-1 rounded-xl border border-gray-200 bg-cream/70 p-1">
                  <button type="button" onClick={() => setPreviewMode('desktop')} className={`rounded-lg px-2 py-1 text-xs font-bold ${previewMode === 'desktop' ? 'bg-white text-dblue' : 'text-gray-500'}`}>Desktop</button>
                  <button type="button" onClick={() => setPreviewMode('mobile')} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${previewMode === 'mobile' ? 'bg-white text-dblue' : 'text-gray-500'}`}><Smartphone size={12} /> Mobile</button>
                </div>
              </div>
            </div>
            <ProfileStudioPreview config={config} mode={previewMode} audience={audience} />
          </div>
          <div className="rounded-[2rem] border border-pgreen/10 bg-white/90 p-5 shadow-soft"><div className="mb-3 flex items-center justify-between"><h3 className="font-black text-dblue">Lịch sử phiên bản</h3><span className="text-xs text-gray-400">12 bản gần nhất</span></div>{versions.length === 0 ? <p className="text-sm text-gray-500">Chưa có snapshot. Hãy lưu bản nháp hoặc xuất bản.</p> : <div className="space-y-2">{versions.map((version) => <div key={version.id} className="flex items-center justify-between gap-3 rounded-xl bg-cream/70 px-3 py-2"><div><div className="text-sm font-bold text-gray-700">Bản {version.version} · {version.action}</div><div className="text-xs text-gray-400">{new Date(version.createdAt).toLocaleString('vi-VN')}</div></div><button onClick={() => save('restore_version', version.id)} disabled={saving} className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-600 hover:border-pgreen/40 hover:text-pgreen">Khôi phục</button></div>)}</div>}</div>
        </aside>
      </div>
    </div>
  );
}
