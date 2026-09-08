"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gift, Package, Calendar, Eye, EyeOff } from "lucide-react";
import { DateInput } from "@/components/shared/DateInput";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

interface Campaign {
    id: string;
    slug: string;
    title: string;
    campaignCode: string;
    status: string;
}

interface CreateRewardFormProps {
    campaign?: Campaign | null;
    projectId?: string;
    successHref?: string;
}

export default function CreateRewardForm({ campaign, projectId, successHref }: CreateRewardFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        minAmount: "",
        maxQuantity: "",
        deliveryDate: "",
        isActive: true,
        availability: "AVAILABLE" as "AVAILABLE" | "DEVELOPMENT",
        isPreorder: false,
        onlineDepositPercent: 30,
        codDepositPercent: 50,
        fulfillmentType: "PHYSICAL" as "PHYSICAL" | "EMAIL" | "DOWNLOAD" | "LICENSE_KEY" | "DIGITAL_COMIC",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaign?.id && !projectId) {
            toast.error("Thiếu chiến dịch hoặc dự án để gắn sản phẩm");
            return;
        }
        if (formData.isPreorder && !formData.deliveryDate) {
            toast.error("Vui lòng chọn ngày dự kiến giao hàng cho đơn đặt trước");
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch("/api/rewards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    campaignId: campaign?.id || undefined,
                    projectId: projectId || undefined,
                    title: formData.title,
                    description: formData.description || null,
                    minAmount: parseFloat(formData.minAmount),
                    maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
                    deliveryDate: formData.isPreorder && formData.deliveryDate ? new Date(formData.deliveryDate) : null,
                    isPreorder: formData.isPreorder,
                    onlineDepositPercent: Number(formData.onlineDepositPercent),
                    codDepositPercent: Number(formData.codDepositPercent),
                    isActive: formData.isActive,
                    availability: formData.isPreorder ? "DEVELOPMENT" : "AVAILABLE",
                    fulfillmentType: formData.fulfillmentType,
                    isIncludedInProject: Boolean(projectId || campaign?.id),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create reward");
            }

            toast.success(projectId && !campaign ? "Tạo sản phẩm dự án thành công!" : "Tạo quà tặng thành công!");
            router.push(successHref || (campaign ? `/dashboard/creator/rewards/${campaign.slug}` : "/dashboard/creator/projects"));
        } catch (error) {
            toast.error("Lỗi tạo quà tặng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleActive = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pgreen/10 rounded-2xl flex items-center justify-center">
                        <Gift className="text-pgreen" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{projectId && !campaign ? "Thông tin sản phẩm" : "Thông tin quà tặng"}</h2>
                        <p className="text-gray-500 text-sm">{projectId && !campaign ? "Sản phẩm thuộc dự án, bán độc lập hoặc gắn thêm vào chiến dịch sau." : "Có quà: giao ngay hoặc đặt trước. Ủng hộ không quà là luồng pledge riêng."}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Tên quà tặng *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="VD: Gói ủng hộ cơ bản, Sản phẩm đầu tiên..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pgreen/30 focus:border-transparent transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mô tả chi tiết
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Mô tả chi tiết về quà tặng, quyền lợi, điều kiện..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pgreen/30 focus:border-transparent transition resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Khi nào giao quà *
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, availability: "AVAILABLE", isPreorder: false, deliveryDate: "" }))}
                            className={`rounded-2xl border p-4 text-left transition ${!formData.isPreorder ? "border-pgreen bg-fgreen/10 ring-2 ring-pgreen/20" : "border-gray-200 hover:border-pgreen/40"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fgreen/15">
                                    <Package className="text-pgreen" size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Giao ngay</div>
                                    <div className="text-xs text-gray-500">Hàng có sẵn. Trả xong là giao / vào Kho đồ</div>
                                </div>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, availability: "DEVELOPMENT", isPreorder: true }))}
                            className={`rounded-2xl border p-4 text-left transition ${formData.isPreorder ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200" : "border-gray-200 hover:border-amber-300"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                                    <Calendar className="text-amber-700" size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Đặt trước</div>
                                    <div className="text-xs text-gray-500">Có quà, giao đúng ngày dự kiến. Có thể thu cọc</div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Ủng hộ không nhận quà không tạo ở đây — dùng nút pledge không reward trên chiến dịch.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Hình thức nhận sản phẩm *</label>
                    <select
                        value={formData.fulfillmentType}
                        onChange={(event) => setFormData(prev => ({ ...prev, fulfillmentType: event.target.value as typeof prev.fulfillmentType }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pgreen/30 focus:border-transparent transition"
                    >
                        <option value="PHYSICAL">Sản phẩm vật lý — giao tận nơi/COD</option>
                        <option value="EMAIL">Tài sản số — gửi qua email</option>
                        <option value="DOWNLOAD">Tài sản số — Kho đã mua</option>
                        <option value="LICENSE_KEY">Mã bản quyền — Kho đã mua</option>
                        <option value="DIGITAL_COMIC">Truyện số — Kho đã mua</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">COD chỉ mở cho sản phẩm vật lý giao ngay.</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mức ủng hộ tối thiểu *
                    </label>
                    <CurrencyInput
                        name="minAmount"
                        value={formData.minAmount}
                        onChange={(value) => setFormData(prev => ({ ...prev, minAmount: value }))}
                        placeholder="50.000"
                        required
                        min="1000"
                        step="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Số tiền tối thiểu để nhận được quà tặng này (VNĐ)
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Số lượng giới hạn
                    </label>
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="number"
                            name="maxQuantity"
                            value={formData.maxQuantity}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="Để trống nếu không giới hạn"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pgreen/30 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {formData.isPreorder && <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ngày dự kiến giao hàng *
                    </label>
                    <DateInput
                        value={formData.deliveryDate}
                        onChange={(value) => setFormData(prev => ({ ...prev, deliveryDate: value }))}
                        placeholder="dd/mm/yyyy"
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>}

                {formData.isPreorder && (
                    <div className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Cọc online (%)</label>
                            <input type="number" name="onlineDepositPercent" value={formData.onlineDepositPercent} onChange={handleInputChange} min="1" max="99" step="1" required className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3" />
                            <p className="mt-1 text-xs text-gray-600">Thanh toán online đủ: tỷ lệ giữ lại khi tự hủy.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Cọc COD (%)</label>
                            <input type="number" name="codDepositPercent" value={formData.codDepositPercent} onChange={handleInputChange} min="1" max="99" step="1" required className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3" />
                            <p className="mt-1 text-xs text-gray-600">Phần còn lại thanh toán khi nhận hàng.</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${formData.isActive ? 'bg-fgreen/10' : 'bg-gray-100'}`}>
                            {formData.isActive ? (
                                <Eye className="text-pgreen" size={20} />
                            ) : (
                                <EyeOff className="text-gray-600" size={20} />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">
                                {formData.isActive ? 'Kích hoạt ngay' : 'Tạm dừng'}
                            </div>
                            <div className="text-sm text-gray-500">
                                {formData.isActive
                                    ? 'Quà tặng sẽ hiển thị cho người ủng hộ'
                                    : 'Quà tặng sẽ được ẩn khỏi danh sách'
                                }
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={toggleActive}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-pgreen' : 'bg-gray-200'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !formData.title || !formData.minAmount}
                        className="flex-1 px-6 py-3 gradient-green text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang tạo...' : (projectId && !campaign ? 'Tạo sản phẩm' : 'Tạo quà tặng')}
                    </button>
                </div>
            </form>
        </div>
    );
}
