"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ProductionEditor } from "@/components/editor";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fixtureFromSections, isTipTapDoc, parseFixtureSections, type FixtureSection } from "@/lib/project/rich-text";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

import {
  Loader2,
  FolderKanban,
  Image as ImageIcon,
  FileText,
  Package,
  ChevronRight,
  Check,
  PlusCircle,
  X,
  Palette,
} from "lucide-react";

const HERO_BG_PRESETS: { name: string; colors: string[]; angle: number }[] = [
  { name: "Tử Tế Tím", colors: ["#7c3aed", "#2563eb", "#0ea5e9"], angle: 135 },
  { name: "Xanh hi vọng", colors: ["#0f766e", "#059669", "#34d399"], angle: 135 },
  { name: "Hoàng hôn ấm", colors: ["#f43f5e", "#f59e0b", "#fbbf24"], angle: 120 },
  { name: "Đại dương sâu", colors: ["#1e3a8a", "#2563eb", "#60a5fa"], angle: 135 },
  { name: "Hoa anh đào", colors: ["#ec4899", "#f472b6", "#fce7f3"], angle: 120 },
  { name: "Đêm vàng kim", colors: ["#0f172a", "#4c1d95", "#fbbf24"], angle: 135 },
  { name: "Lá mùa thu", colors: ["#15803d", "#a3e635", "#fde047"], angle: 135 },
  { name: "Bão tím", colors: ["#312e81", "#7c3aed", "#c084fc"], angle: 135 },
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  status: string;
  excerpt: string | null;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  minAmount: number;
  isActive: boolean;
  campaignTitle?: string;
  campaignSlug?: string | null;
  imageUrl?: string | null;
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing project to edit; null = create mode */
  project?: {
    id: string;
    title: string;
    slug: string | null;
    description: string | null;
    coverImage: string | null;
    richDescription: any;
    heroBackgroundType?: string;
    heroBackgroundConfig?: any;
    linkedBlogPostIds: string[];
    linkedRewardIds: string[];
  } | null;
  defaultTab?: string;
  onSuccess: () => void;
}

function toEditorHtml(value: unknown): string {
  if (typeof value === "string") return value;
  if (isTipTapDoc(value)) {
    try {
      return generateHTML(value as any, [StarterKit]);
    } catch {
      return "";
    }
  }
  return "";
}

/**
 * Professional project create/edit form.
 * Sections: (1) Basic info, (2) Cover image + rich description, (3) Link blogs & products.
 */
export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  defaultTab = "basic",
  onSuccess,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(project);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Basic info
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Media & rich description
  const [coverImage, setCoverImage] = useState("");
  const [richDescription, setRichDescription] = useState("");
  const [fixtureSections, setFixtureSections] = useState<FixtureSection[] | null>(null);

  // Hero background (image or multi-color gradient)
  const [heroBgType, setHeroBgType] = useState<"image" | "color">("image");
  const [heroBgColors, setHeroBgColors] = useState<string[]>([]);
  const [heroBgAngle, setHeroBgAngle] = useState(135);

  // Linked items
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedRewardIds, setSelectedRewardIds] = useState<string[]>([]);
  const [hasProducts, setHasProducts] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);

  // Initialize form from existing project
  useEffect(() => {
    if (!open) return;
    setActiveTab(defaultTab || "basic");
    if (project) {
      setTitle(project.title);
      setSlug(project.slug || "");
      setDescription(project.description || "");
      setCoverImage(project.coverImage || "");
      const fixture = parseFixtureSections(project.richDescription);
      if (fixture) {
        setFixtureSections(fixture);
        setRichDescription("");
      } else {
        setFixtureSections(null);
        setRichDescription(toEditorHtml(project.richDescription));
      }
      setSelectedBlogIds(project.linkedBlogPostIds || []);
      setSelectedRewardIds(project.linkedRewardIds || []);
      setHasProducts((project.linkedRewardIds || []).length > 0);
      setHeroBgType(project.heroBackgroundType === "color" ? "color" : "image");
      setHeroBgColors(
        Array.isArray(project.heroBackgroundConfig?.colors)
          ? (project.heroBackgroundConfig.colors as string[])
          : []
      );
      setHeroBgAngle(
        typeof project.heroBackgroundConfig?.angle === "number"
          ? project.heroBackgroundConfig.angle
          : 135
      );
      fetchBlogPosts();
      fetchRewards();
    } else {
      resetForm();
      fetchBlogPosts();
      fetchRewards();
    }
  }, [open, project?.id, defaultTab]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setRichDescription("");
    setFixtureSections(null);
    setHeroBgType("image");
    setHeroBgColors([]);
    setHeroBgAngle(135);
    setSelectedBlogIds([]);
    setSelectedRewardIds([]);
    setHasProducts(false);
    setActiveTab("basic");
  };

  const fetchBlogPosts = async () => {
    setLoadingBlogs(true);
    try {
      const res = await fetch("/api/blog/my-posts?status=ALL&limit=100", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setBlogPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch blog posts", err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchRewards = async () => {
    setLoadingRewards(true);
    try {
      const res = await fetch("/api/rewards/my", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        const all: Reward[] = [];
        const seen = new Set<string>();
        const pushReward = (r: any, campaignTitle?: string, campaignSlug?: string | null) => {
          if (!r?.id || seen.has(r.id)) return;
          seen.add(r.id);
          all.push({
            ...r,
            campaignTitle,
            campaignSlug: campaignSlug || null,
            imageUrl: r.imageUrl || (Array.isArray(r.productImages) && r.productImages[0]) || null,
          });
        };
        (data.campaigns || []).forEach((c: any) => {
          (c.rewards || []).forEach((r: any) => pushReward(r, c.title, c.slug));
        });
        (data.projectsWithRewards || []).forEach((p: any) => {
          (p.rewards || []).forEach((r: any) => pushReward(r, p.title || "Sản phẩm dự án", null));
        });
        setRewards(all);
      }
    } catch (err) {
      console.error("Failed to fetch rewards", err);
    } finally {
      setLoadingRewards(false);
    }
  };

  const toggleBlog = (id: string) => {
    setSelectedBlogIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleReward = (id: string) => {
    setSelectedRewardIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên dự án");
      return;
    }
    if (heroBgType === "color") {
      const validColors = heroBgColors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
      if (validColors.length < 2) {
        toast.error("Chế độ nền màu cần ít nhất 2 mã màu hợp lệ (ví dụ #7c3aed)");
        return;
      }
    }
    setLoading(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        slug: slug.trim() || undefined,
        coverImage: coverImage || undefined,
        richDescription: fixtureSections
          ? fixtureFromSections(fixtureSections)
          : (richDescription || undefined),
        heroBackgroundType: heroBgType,
        heroBackgroundConfig:
          heroBgType === "color"
            ? {
                colors: heroBgColors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)),
                angle: heroBgAngle,
              }
            : null,
        blogPostIds: selectedBlogIds,
        rewardIds: hasProducts ? selectedRewardIds : [],
      };

      const url = project
        ? `/api/projects/${project.id}`
        : "/api/projects";
      const method = project ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        const details: string[] | undefined = error?.error?.details;
        if (details?.length) {
          throw new Error(details.map((d: any) => (typeof d === "string" ? d : d.message || JSON.stringify(d))).join("; "));
        }
        const errMsg =
          typeof error?.error === "string"
            ? error.error
            : error?.error?.message || "Không thể lưu dự án";
        if (errMsg.includes("slug")) {
          throw new Error("Đường dẫn (slug) đã được sử dụng. Vui lòng chọn slug khác.");
        }
        throw new Error(errMsg);
      }

      toast.success(isEdit ? "Đã cập nhật dự án thành công" : "Đã tạo dự án thành công");
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi lưu dự án");
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle = isEdit ? "Chỉnh sửa dự án" : "Tạo dự án mới";
  const dialogDesc = isEdit
    ? "Cập nhật thông tin, ảnh bìa, mô tả phong phú và các liên kết của dự án"
    : "Thiết lập dự án mới để tổ chức các chiến dịch, sản phẩm và bài viết của bạn";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-y-auto rounded-3xl">
        <DialogHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription>{dialogDesc}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="basic" className="px-8 pb-8 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="media">Ảnh & mô tả chi tiết</TabsTrigger>
            <TabsTrigger value="links">
              Liên kết
              {(selectedBlogIds.length > 0 || selectedRewardIds.length > 0) && (
                <Badge className="ml-2 px-1.5 h-5 min-w-5 text-[10px]">
                  {selectedBlogIds.length + selectedRewardIds.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto pr-2 -mr-2" style={{ maxHeight: "calc(85vh - 260px)" }}>
          {/* Tab 1: Basic info */}
          <TabsContent value="basic" className="space-y-5 mt-0">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ví dụ: Dự án khởi nghiệp công nghệ xanh"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Đường dẫn (slug) — tùy chọn
              </label>
              <Input
                placeholder="Ví dụ: du-an-cong-nghe-xanh"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                }
                maxLength={255}
                className="h-12 text-base"
              />
              <p className="text-xs text-gray-400 font-medium">
                Để trống để hệ thống tự tạo. Chỉ dùng chữ thường, số và dấu gạch ngang.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Mô tả ngắn
              </label>
              <Textarea
                placeholder="Một đoạn mô tả ngắn về dự án (hiển thị trên danh sách)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Tab 2: Media & rich description */}
          <TabsContent value="media" className="space-y-8 mt-0">
            <div>
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 block">
                Ảnh bìa dự án
              </label>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                label="Bấm để tải ảnh bìa (PNG, JPG, WEBP — tối đa 5MB)"
              />
            </div>

            {/* Hero background style: image or multi-color gradient */}
            <div>
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Nền trang dự án (hero)
              </label>
              <div className="flex gap-2 mb-4">
                {([
                  { v: "image" as const, label: "Ảnh sản phẩm" },
                  { v: "color" as const, label: "Màu / Gradient" },
                ] as const).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setHeroBgType(opt.v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      heroBgType === opt.v
                        ? "border-purple-600 bg-purple-600 text-white shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {heroBgType === "image" ? (
                <p className="text-xs text-gray-400 font-medium">
                  Nền trang sẽ dùng ảnh bìa dự án đã tải ở trên.
                </p>
              ) : (
                <div className="space-y-4 border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
                  {/* Live gradient preview */}
                  <div
                    className="h-24 rounded-xl border border-gray-200 shadow-inner flex items-center justify-center"
                    style={{
                      background:
                        heroBgColors.length >= 2
                          ? `linear-gradient(${heroBgAngle}deg, ${heroBgColors.join(", ")})`
                          : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow bg-black/20 px-3 py-1 rounded-full">
                      Xem trước nền trang
                    </span>
                  </div>

                  {/* Color inputs */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                      Các mã màu (hex) — thêm {heroBgColors.length >= 2 ? `${heroBgColors.length} màu` : "ít nhất 2 màu"} để tạo gradient
                    </label>
                    {heroBgColors.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-lg border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: c }}
                        />
                        <input
                          value={c}
                          onChange={(e) => {
                            const next = [...heroBgColors];
                            next[i] = e.target.value;
                            setHeroBgColors(next);
                          }}
                          placeholder="#7c3aed"
                          maxLength={7}
                          className="h-10 rounded-xl border border-gray-300 px-3 text-sm font-mono bg-white w-32"
                        />
                        <input
                          type="color"
                          value={/^#[0-9a-fA-F]{6}$/.test(c) ? c : "#000000"}
                          onChange={(e) => {
                            const next = [...heroBgColors];
                            next[i] = e.target.value;
                            setHeroBgColors(next);
                          }}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setHeroBgColors(heroBgColors.filter((_, j) => j !== i))
                          }
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Xóa màu này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {heroBgColors.length < 8 && (
                      <button
                        type="button"
                        onClick={() => setHeroBgColors([...heroBgColors, "#7c3aed"])}
                        className="flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-700"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Thêm màu ({heroBgColors.length}/8)
                      </button>
                    )}
                  </div>

                  {/* Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                      Gradient gợi ý — bấm để áp dụng
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {HERO_BG_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setHeroBgColors([...p.colors]);
                            setHeroBgAngle(p.angle);
                          }}
                          className="group relative h-14 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-400 transition-all"
                        >
                          <div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(${p.angle}deg, ${p.colors.join(", ")})`,
                            }}
                          />
                          <span className="absolute inset-x-0 bottom-0 text-center text-[10px] font-bold text-white bg-black/30 py-1 backdrop-blur-sm">
                            {p.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Angle */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                      Hướng gradient
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={heroBgAngle}
                      onChange={(e) => setHeroBgAngle(Number(e.target.value))}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="text-xs font-mono font-bold text-gray-500 w-9 text-right">
                      {heroBgAngle}°
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Mô tả chi tiết (soạn thảo phong phú)
              </label>
              <p className="text-xs text-gray-400 font-medium mb-3">
                Nội dung chi tiết của dự án hiển thị trên trang công khai. Hỗ trợ định dạng chữ,
                tiêu đề, danh sách, ảnh, video và khung sản phẩm.
              </p>
              {fixtureSections ? (
                <div className="space-y-4 border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
                  <p className="text-sm text-gray-600">
                    Dự án đang dùng các mục giới thiệu sẵn. Bạn có thể sửa tiêu đề, thêm nội dung từng mục,
                    hoặc chuyển sang trình soạn thảo phong phú.
                  </p>
                  {fixtureSections.map((section, index) => (
                    <div key={`${section.title}-${index}`} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
                      <Input
                        value={section.title}
                        onChange={(event) => {
                          const next = [...fixtureSections];
                          next[index] = { ...next[index], title: event.target.value };
                          setFixtureSections(next);
                        }}
                        className="h-11 font-semibold"
                      />
                      <Textarea
                        value={section.body}
                        onChange={(event) => {
                          const next = [...fixtureSections];
                          next[index] = { ...next[index], body: event.target.value };
                          setFixtureSections(next);
                        }}
                        rows={3}
                        placeholder="Nội dung mục này (không bắt buộc)"
                      />
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setFixtureSections([
                        ...fixtureSections,
                        { title: `Mục ${fixtureSections.length + 1}`, body: "" },
                      ])}
                      className="text-sm font-bold text-purple-600 hover:text-purple-700"
                    >
                      Thêm mục
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const escapeHtml = (value: string) =>
                          value
                            .replace(/&/g, "\u0026amp;")
                            .replace(/</g, "\u0026lt;")
                            .replace(/>/g, "\u0026gt;")
                            .replace(/"/g, "\u0026quot;");
                        const html = fixtureSections
                          .map((section) => `<h2>${escapeHtml(section.title)}</h2>${section.body ? `<p>${escapeHtml(section.body)}</p>` : ""}`)
                          .join("");
                        setRichDescription(html);
                        setFixtureSections(null);
                      }}
                      className="text-sm font-bold text-gray-600 hover:text-gray-800"
                    >
                      Chuyển sang soạn thảo phong phú
                    </button>
                  </div>
                  <div className="border border-gray-100 rounded-2xl p-6 bg-white">
                    <RichTextRenderer content={fixtureFromSections(fixtureSections)} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <ProductionEditor
                      content={richDescription}
                      onChange={setRichDescription}
                      config={{
                        placeholder: "Viết mô tả chi tiết cho dự án của bạn...",
                        autosave: false,
                        enableBubbleMenu: true,
                      }}
                    />
                  </div>
                  {richDescription && (
                    <details className="mt-4 group">
                      <summary className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-blue-600 select-none">
                        Xem trước nội dung đã soạn
                      </summary>
                      <div className="mt-3 border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                        <RichTextRenderer content={richDescription} />
                      </div>
                    </details>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Links */}
          <TabsContent value="links" className="space-y-8 mt-0">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-orange-600" />
                Bài viết blog liên kết ({selectedBlogIds.length})
              </label>
              <p className="text-xs text-gray-400 font-medium">
                Chọn các bài viết (kể cả nháp) để hiển thị trong dự án này.
              </p>
              <ScrollArea className="h-56 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="p-4 space-y-2">
                  {loadingBlogs ? (
                    <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
                      <Loader2 className="animate-spin" size={16} /> Đang tải bài viết...
                    </div>
                  ) : blogPosts.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">
                      Bạn chưa có bài viết nào.
                    </p>
                  ) : (
                    blogPosts.map((post) => {
                      const selected = selectedBlogIds.includes(post.id);
                      return (
                        <div
                          key={post.id}
                          onClick={() => toggleBlog(post.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            selected
                              ? "bg-purple-50 border border-purple-200"
                              : "bg-white border border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                              selected
                                ? "bg-purple-600 border-purple-600"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selected && <Check size={12} className="text-white" />}
                          </div>
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <FileText size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {post.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
                            </p>
                          </div>
                          {selected && (
                            <Check size={16} className="text-purple-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-blue-600"
                  checked={hasProducts}
                  onChange={(event) => {
                    const next = event.target.checked;
                    setHasProducts(next);
                    if (!next) setSelectedRewardIds([]);
                  }}
                />
                <span>
                  <span className="block text-sm font-black text-gray-900 uppercase tracking-widest">
                    Dự án có sản phẩm
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    Tích nếu có hàng có sẵn, pre-order hoặc quà tri ân. Bỏ tích nếu chỉ quyên góp, không nhận lại vật chất.
                  </span>
                </span>
              </label>
              {hasProducts ? (
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Package size={16} className="text-blue-600" />
                Chọn sản phẩm ({selectedRewardIds.length})
              </label>
              <p className="text-xs text-gray-400 font-medium">
                Chọn sản phẩm có sẵn của bạn để hiển thị trong dự án. Sản phẩm thuộc chiến dịch của dự án
                vẫn hiện trên trang dự án dù không gắn tay.
              </p>
              {project?.id && (
                <Link
                  href={`/dashboard/creator/projects/${project.id}/rewards/create`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tạo sản phẩm mới thuộc dự án
                </Link>
              )}
              <ScrollArea className="h-64 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="p-4 space-y-2">
                  {loadingRewards ? (
                    <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
                      <Loader2 className="animate-spin" size={16} /> Đang tải sản phẩm...
                    </div>
                  ) : rewards.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">
                      Bạn chưa có sản phẩm nào.
                    </p>
                  ) : (
                    rewards.map((r) => {
                      const selected = selectedRewardIds.includes(r.id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => toggleReward(r.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            selected
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-white border border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                              selected
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selected && <Check size={12} className="text-white" />}
                          </div>
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              r.imageUrl
                                ? ""
                                : "bg-gray-100"
                            }`}
                          >
                            {r.imageUrl ? (
                              <img
                                src={r.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <Package size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {r.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {r.campaignTitle ? `Chiến dịch: ${r.campaignTitle}` : "Sản phẩm dự án"}
                            </p>
                          </div>
                          {selected && (
                            <Check size={16} className="text-blue-600 flex-shrink-0" />
                          )}
                          {project?.id && (
                            <Link
                              href={
                                r.campaignSlug
                                  ? `/dashboard/creator/rewards/${r.campaignSlug}/edit/${r.id}`
                                  : `/dashboard/creator/projects/${project.id}/rewards/${r.id}/edit`
                              }
                              onClick={(event) => event.stopPropagation()}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex-shrink-0"
                            >
                              Sửa
                            </Link>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
              ) : (
                <p className="text-xs text-gray-500 px-1">
                  Không chọn sản phẩm. Chiến dịch gắn dự án này sẽ theo luồng quyên góp (All-or-Nothing hoàn nếu hết hạn chưa đủ goal).
                </p>
              )}
            </div>
          </TabsContent>
          </div>
        </Tabs>

        {/* Footer actions */}
        <div className="border-t border-gray-100 bg-gray-50/60 px-8 py-5 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-6 h-11 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="px-8 h-11 rounded-xl font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Đang lưu...
              </>
            ) : (
              <>
                {isEdit ? "Lưu thay đổi" : "Tạo dự án"}
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
