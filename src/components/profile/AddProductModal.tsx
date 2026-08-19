"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    X,
    Package,
    CopyPlus,
    Plus,
    Calendar,
    Eye,
    EyeOff,
    Check,
    Loader2,
    Gift,
    Tag,
    Layers,
    Upload,
    Video,
    Percent,
    Boxes,
    Image as ImageIcon,
    Play,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { DateInput } from "@/components/shared/DateInput";

type Step = "choose" | "fromCampaign" | "createNew";

interface Reward {
    id: string;
    title: string;
    description: string | null;
    minAmount: number;
    maxQuantity: number | null;
    deliveryDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    _count: { pledges: number };
}

interface CampaignData {
    id: string;
    slug: string;
    title: string;
    type: string;
    status: string;
    rewards: Reward[];
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal "Thêm sản phẩm" — cho phép creator:
 * 1. Chọn sản phẩm (reward) có sẵn từ các chiến dịch của mình để hiển thị trên trang cá nhân
 * 2. Tạo sản phẩm mới với giá như nền tảng thương mại điện tử
 */
export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("choose");
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form tạo mới (chuẩn thương mại điện tử)
    const [newForm, setNewForm] = useState({
        campaignId: "",
        title: "",
        brand: "",
        category: "",
        description: "",
        minAmount: "",
        maxAmount: "",
        stock: "",
        productImages: [] as string[],
        productVideo: "",
        maxQuantity: "",
        deliveryDate: "",
        isActive: true,
    });
    const [uploadingMedia, setUploadingMedia] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setStep("choose");
        setCampaigns([]);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || step !== "fromCampaign") return;
        let cancelled = false;
        setLoadingCampaigns(true);
        fetch("/api/rewards/my")
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Không thể tải chiến dịch"))))
            .then((data) => {
                if (!cancelled) setCampaigns(data.campaigns || []);
            })
            .catch(() => {
                if (!cancelled) toast.error("Lỗi tải danh sách chiến dịch");
            })
            .finally(() => {
                if (!cancelled) setLoadingCampaigns(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isOpen, step]);

    const close = () => {
        onClose();
    };

    // --- Chọn reward có sẵn từ chiến dịch ---
    const handlePickReward = async (campaign: CampaignData, reward: Reward) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/rewards/${reward.id}/toggle`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true }),
            });
            if (!res.ok) throw new Error("Không thể thêm sản phẩm");
            toast.success(`Đã thêm "${reward.title}" vào sản phẩm của bạn`);
            close();
            // Sau khi thêm, reload trang để tab Sản phẩm cập nhật số lượng
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message || "Lỗi khi thêm sản phẩm");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Tạo sản phẩm mới ---
    const handleCreateNew = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newForm.campaignId || !newForm.title || !newForm.minAmount) {
            toast.error("Vui lòng chọn chiến dịch, tên và giá sản phẩm");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId: newForm.campaignId,
                    title: newForm.title,
                    description: newForm.description || null,
                    minAmount: parseFloat(newForm.minAmount),
                    maxAmount: newForm.maxAmount ? parseFloat(newForm.maxAmount) : null,
                    stock: newForm.stock ? parseInt(newForm.stock) : null,
                    productImages: newForm.productImages,
                    productVideo: newForm.productVideo || null,
                    maxQuantity: newForm.maxQuantity ? parseInt(newForm.maxQuantity) : null,
                    deliveryDate: newForm.deliveryDate ? new Date(newForm.deliveryDate) : null,
                    isActive: true,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Không thể tạo sản phẩm");
            }
            toast.success("Tạo sản phẩm thành công!");
            close();
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message || "Lỗi khi tạo sản phẩm");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Upload media (ảnh / video) qua /api/upload ---
    const uploadFile = async (file: File): Promise<{ url: string; isVideo: boolean }> => {
        const isVideo = file.type.startsWith("video/");
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload thất bại");
        const url = data.secure_url || data.url;
        if (!url) throw new Error("Không nhận được URL ảnh/video");
        return { url, isVideo };
    };

    const handleMediaUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const arr = Array.from(files);
        for (const file of arr) {
            const okImage = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type);
            const okVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
            if (!okImage && !okVideo) {
                toast.error(`File "${file.name}" không được hỗ trợ (chỉ JPG, PNG, WEBP, MP4, WEBM)`);
                continue;
            }
            if (file.size > 30 * 1024 * 1024) {
                toast.error(`File "${file.name}" quá 30MB`);
                continue;
            }
            if (!file.type.startsWith("video/") && newForm.productImages.length >= 8) {
                toast.error("Tối đa 8 ảnh sản phẩm");
                break;
            }
            if (file.type.startsWith("video/") && newForm.productVideo) {
                toast.error("Sản phẩm chỉ hỗ trợ 1 video");
                continue;
            }
            setUploadingMedia(true);
            try {
                const { url, isVideo } = await uploadFile(file);
                if (isVideo) {
                    setNewForm((f) => ({ ...f, productVideo: url }));
                    toast.success("Đã tải video lên thành công");
                } else {
                    setNewForm((f) => ({ ...f, productImages: [...f.productImages, url] }));
                    toast.success("Đã tải ảnh lên thành công");
                }
            } catch (e: any) {
                toast.error(e.message || "Upload thất bại");
            } finally {
                setUploadingMedia(false);
            }
        }
    };

    const openNew = () => {
        // Nếu chỉ có 1 chiến dịch thì chọn luôn, không cần hỏi
        if (campaigns.length === 1) {
            setNewForm((f) => ({ ...f, campaignId: campaigns[0].id }));
        } else if (campaigns.length > 1) {
            setNewForm((f) => ({ ...f, campaignId: "" }));
        }
        setStep("createNew");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

            {/* Modal */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Package className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Thêm sản phẩm</h2>
                            <p className="text-gray-500 text-xs font-medium">
                                {step === "choose"
                                    ? "Chọn cách thêm sản phẩm"
                                    : step === "fromCampaign"
                                    ? "Chọn sản phẩm có sẵn từ chiến dịch"
                                    : "Tạo sản phẩm mới"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                        aria-label="Đóng"
                    >
                        <X size={18} className="text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-8 py-5">
                    {step === "choose" && (
                        <div className="space-y-4">
                            <button
                                onClick={openNew}
                                className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl hover:shadow-md hover:border-emerald-400 transition text-left"
                            >
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <Plus className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-black text-gray-900">Tạo sản phẩm mới</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Đặt tên, mô tả, giá bán và số lượng giới hạn như một nền tảng thương mại điện tử
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    setCampaigns([]);
                                    setStep("fromCampaign");
                                }}
                                className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:shadow-md hover:border-blue-400 transition text-left"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <CopyPlus className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-black text-gray-900">Chọn từ chiến dịch</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Dùng sản phẩm/phần quà đã có trong các chiến dịch của bạn
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === "fromCampaign" && (
                        <div className="space-y-5">
                            {loadingCampaigns ? (
                                <div className="flex flex-col items-center gap-3 py-10">
                                    <Loader2 className="text-gray-400 animate-spin" size={28} />
                                    <p className="text-sm text-gray-500 font-medium">Đang tải chiến dịch...</p>
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium mb-2">Chưa có chiến dịch nào.</p>
                                    <p className="text-gray-400 text-sm mb-5">
                                        Tạo chiến dịch trước để có thể thêm sản phẩm.
                                    </p>
                                    <button
                                        onClick={() => router.push("/campaigns/create")}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold transition"
                                    >
                                        Tạo chiến dịch
                                    </button>
                                </div>
                            ) : (
                                campaigns.map((c) => {
                                    const activeRewards = c.rewards.filter((r) => r.isActive);
                                    return (
                                        <div key={c.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm text-gray-900 truncate">{c.title}</div>
                                                    <div className="text-[11px] text-gray-400 font-medium uppercase">
                                                        {c.type === "REWARD" ? "Chiến dịch có thưởng" : "Chiến dịch quyên góp"}
                                                        {" • "}{c.status}
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-black text-gray-500 shrink-0">
                                                    {activeRewards.length} sản phẩm
                                                </span>
                                            </div>
                                            <div className="p-3 space-y-2">
                                                {activeRewards.length === 0 ? (
                                                    <p className="text-xs text-gray-400 px-2 py-1">
                                                        Chưa có sản phẩm nào trong chiến dịch này.
                                                    </p>
                                                ) : (
                                                    activeRewards.map((r) => (
                                                        <button
                                                            key={r.id}
                                                            disabled={submitting}
                                                            onClick={() => handlePickReward(c, r)}
                                                            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition text-left disabled:opacity-50"
                                                        >
                                                            <Gift size={18} className="text-emerald-600 shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-bold text-gray-900 truncate">
                                                                    {r.title}
                                                                </div>
                                                                {r.description && (
                                                                    <div className="text-xs text-gray-500 line-clamp-1">
                                                                        {r.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="text-sm font-black text-emerald-600">
                                                                    {formatVND(r.minAmount)}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {step === "createNew" && (
                        <form onSubmit={handleCreateNew} className="space-y-5">
                            {/* Chọn chiến dịch nếu nhiều */}
                            {campaigns.length > 1 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Chiến dịch *
                                    </label>
                                    <select
                                        value={newForm.campaignId}
                                        onChange={(e) =>
                                            setNewForm((f) => ({ ...f, campaignId: e.target.value }))
                                        }
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                                    >
                                        <option value="">-- Chọn chiến dịch --</option>
                                        {campaigns.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Sản phẩm mới sẽ được liên kết với chiến dịch này.
                                    </p>
                                </div>
                            )}

                            {/* ---- Hình ảnh & Video ---- */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-emerald-600" />
                                    Hình ảnh & Video sản phẩm
                                </label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer",
                                        uploadingMedia
                                            ? "border-gray-200 bg-gray-50"
                                            : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                                    )}
                                    onClick={() =>
                                        !uploadingMedia &&
                                        document
                                            .getElementById("product-media-input")
                                            ?.click()
                                    }
                                >
                                    <input
                                        id="product-media-input"
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*"
                                        multiple={!newForm.productVideo}
                                        onChange={(e) => {
                                            handleMediaUpload(e.target.files);
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="flex items-center justify-center gap-3 text-gray-500">
                                        {uploadingMedia ? (
                                            <>
                                                <Loader2 size={22} className="animate-spin text-emerald-600" />
                                                <span className="text-sm font-bold">Đang tải lên...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={22} className="text-emerald-500" />
                                                <div className="text-center">
                                                    <p className="text-sm font-bold">Thêm ảnh / video sản phẩm</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        JPG, PNG, WEBP, MP4, WEBM (tối đa 30MB/file, tối đa 8 ảnh + 1 video)
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {/* Preview media đã tải */}
                                {(newForm.productImages.length > 0 || newForm.productVideo) && (
                                    <div className="mt-3 grid grid-cols-4 gap-2">
                                        {newForm.productImages.map((img, i) => (
                                            <div key={img} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                                                <img src={img} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                                                {i === 0 && (
                                                    <span className="absolute top-1 left-1 text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                                        Bìa
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setNewForm((f) => ({
                                                            ...f,
                                                            productImages: f.productImages.filter((x) => x !== img),
                                                        }))
                                                    }
                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {newForm.productVideo && (
                                            <div className="relative group aspect-square rounded-xl overflow-hidden border-2 border-emerald-400 bg-gray-900">
                                                <video src={newForm.productVideo} className="w-full h-full object-cover" />
                                                <span className="absolute top-1 left-1 text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Play size={10} /> Video
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewForm((f) => ({ ...f, productVideo: "" }))}
                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ---- Tên & thông tin cơ bản ---- */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Tên sản phẩm *
                                </label>
                                <input
                                    type="text"
                                    value={newForm.title}
                                    onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
                                    required
                                    placeholder="VD: Túi vải canvas thương mại công bằng, Gói ủng hộ cơ bản..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Tag size={14} className="text-gray-400" />
                                        Thương hiệu
                                    </label>
                                    <input
                                        type="text"
                                        value={newForm.brand}
                                        onChange={(e) => setNewForm((f) => ({ ...f, brand: e.target.value }))}
                                        placeholder="VD: Tử Tế Shop"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Layers size={14} className="text-gray-400" />
                                        Danh mục
                                    </label>
                                    <input
                                        type="text"
                                        value={newForm.category}
                                        onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))}
                                        placeholder="VD: Quà tặng, Thời trang, F&B..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* ---- Giá bán ---- */}
                            <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2 text-sm font-black text-orange-700">
                                    <Percent size={16} />
                                    Giá bán
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Giá sản phẩm (giá bán) *
                                    </label>
                                    <CurrencyInput
                                        name="minAmount"
                                        value={newForm.minAmount}
                                        onChange={(value) => setNewForm((f) => ({ ...f, minAmount: value }))}
                                        placeholder="50.000"
                                        required
                                        min="1000"
                                        step="1000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Giá gốc (giá tham chiếu)
                                    </label>
                                    <CurrencyInput
                                        name="maxAmount"
                                        value={newForm.maxAmount}
                                        onChange={(value) => setNewForm((f) => ({ ...f, maxAmount: value }))}
                                        placeholder="80.000"
                                        min="1000"
                                        step="1000"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Hiển thị giá gốc bị gạch đi kèm % giảm giá, tạo cảm giác khuyến mãi như Shopee/Lazada
                                    </p>
                                    {newForm.minAmount && newForm.maxAmount && parseFloat(newForm.maxAmount) > parseFloat(newForm.minAmount) && (
                                        <div className="inline-block mt-2 px-2.5 py-1 bg-red-600 text-white text-xs font-black rounded-lg">
                                            Giảm {Math.round(((parseFloat(newForm.maxAmount) - parseFloat(newForm.minAmount)) / parseFloat(newForm.maxAmount)) * 100)}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ---- Tồn kho & vận chuyển ---- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Boxes size={14} className="text-gray-400" />
                                        Tồn kho
                                    </label>
                                    <input
                                        type="number"
                                        value={newForm.stock}
                                        onChange={(e) => setNewForm((f) => ({ ...f, stock: e.target.value }))}
                                        min="1"
                                        placeholder="VD: 100"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Số lượng còn có thể nhận</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Ngày giao dự kiến
                                    </label>
                                    <DateInput
                                        value={newForm.deliveryDate}
                                        onChange={(value) =>
                                            setNewForm((f) => ({ ...f, deliveryDate: value }))
                                        }
                                        placeholder="dd/mm/yyyy"
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </div>

                            {/* ---- Mô tả chi tiết ---- */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Mô tả chi tiết
                                </label>
                                <textarea
                                    value={newForm.description}
                                    onChange={(e) =>
                                        setNewForm((f) => ({ ...f, description: e.target.value }))
                                    }
                                    rows={5}
                                    placeholder="Mô tả chất liệu, kích thước, màu sắc, thành phần, điều kiện sử dụng, quyền lợi kèm theo..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                                />
                            </div>

                            {/* Status toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${newForm.isActive ? "bg-green-100" : "bg-gray-100"}`}
                                    >
                                        {newForm.isActive ? (
                                            <Eye className="text-green-600" size={20} />
                                        ) : (
                                            <EyeOff className="text-gray-600" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {newForm.isActive ? "Kích hoạt ngay" : "Tạm dừng"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {newForm.isActive
                                                ? "Sản phẩm sẽ hiển thị trên trang của bạn"
                                                : "Sản phẩm sẽ được ẩn khỏi danh sách"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setNewForm((f) => ({ ...f, isActive: !f.isActive }))
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newForm.isActive ? "bg-green-600" : "bg-gray-200"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newForm.isActive ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 flex gap-3">
                    {step !== "choose" && (
                        <button
                            type="button"
                            onClick={() => setStep("choose")}
                            className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-50 transition"
                        >
                            ← Quay lại
                        </button>
                    )}
                    {step === "createNew" && (
                        <button
                            type="submit"
                            onClick={handleCreateNew as any}
                            disabled={submitting || !newForm.title || !newForm.minAmount}
                            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-black hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
                        </button>
                    )}
                    {step === "choose" && (
                        <button
                            type="button"
                            onClick={close}
                            className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-50 transition"
                        >
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
