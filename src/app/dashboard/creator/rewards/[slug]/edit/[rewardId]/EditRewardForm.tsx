"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gift, Package, Calendar, FileText, Eye, EyeOff, Users, AlertTriangle } from "lucide-react";
import { DateInput } from "@/components/shared/DateInput";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

interface Reward {
    id: string;
    title: string;
    description: string | null;
    minAmount: number;
    maxQuantity: number | null;
    deliveryDate: string | null;
    isPreorder?: boolean;
    isActive: boolean;
    availability?: "AVAILABLE" | "DEVELOPMENT";
    fulfillmentType?: "PHYSICAL" | "EMAIL" | "DOWNLOAD" | "LICENSE_KEY" | "DIGITAL_COMIC";
    _count: {
        pledges: number;
    };
    campaign: {
        id: string;
        slug: string;
        title: string;
        campaignCode: string;
        status: string;
    };
}

interface EditRewardFormProps {
    reward: Reward;
}

export default function EditRewardForm({ reward }: EditRewardFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: reward.title,
        description: reward.description || "",
        minAmount: reward.minAmount.toString(),
        maxQuantity: reward.maxQuantity?.toString() || "",
        deliveryDate: reward.deliveryDate || "",
        isPreorder: reward.isPreorder === true,
        isActive: reward.isActive,
        availability: reward.availability || "AVAILABLE",
        fulfillmentType: reward.fulfillmentType || "PHYSICAL",
    });

    const hasPledges = reward._count.pledges > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.isPreorder && !formData.deliveryDate) {
            toast.error("Vui lòng chọn ngày dự kiến giao hàng cho sản phẩm đặt trước");
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch(`/api/rewards/${reward.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || null,
                    minAmount: parseFloat(formData.minAmount),
                    maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
                    deliveryDate: formData.isPreorder && formData.deliveryDate ? new Date(formData.deliveryDate) : null,
                    isPreorder: formData.isPreorder,
                    isActive: formData.isActive,
                    availability: formData.availability,
                    fulfillmentType: formData.fulfillmentType,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update reward");
            }

            toast.success("Cập nhật quà tặng thành công!");
            router.push(`/dashboard/creator/rewards/${reward.campaign.slug}`);
        } catch (error) {
            toast.error("Lỗi cập nhật quà tặng");
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
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa quà tặng</h2>
                        <p className="text-gray-500 text-sm">Cập nhật thông tin gói quà tặng</p>
                    </div>
                    {hasPledges && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-tblue/10 rounded-xl">
                            <Users className="text-tblue" size={16} />
                            <span className="text-sm font-semibold text-tblue">
                                {reward._count.pledges} lượt chọn
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {hasPledges && (
                <div className="px-8 py-4 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-amber-800">Lưu ý khi chỉnh sửa</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                Quà tặng này đã có {reward._count.pledges} người chọn. Việc thay đổi thông tin có thể ảnh hưởng đến cam kết với người ủng hộ.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Title */}
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

                {/* Description */}
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

                {/* Product Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Loại sản phẩm/quà tặng *
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, availability: "AVAILABLE", deliveryDate: "" }))}
                            className={`rounded-2xl border p-4 text-left transition ${formData.availability === "AVAILABLE" ? "border-pgreen bg-fgreen/10 ring-2 ring-pgreen/20" : "border-gray-200 hover:border-pgreen/40"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fgreen/15">
                                    <Package className="text-pgreen" size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Có sẵn</div>
                                    <div className="text-xs text-gray-500">Mua bán như sản phẩm thương mại điện tử</div>
                                </div>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, availability: "DEVELOPMENT" }))}
                            className={`rounded-2xl border p-4 text-left transition ${formData.availability === "DEVELOPMENT" ? "border-dblue bg-blue-50 ring-2 ring-dblue/20" : "border-gray-200 hover:border-dblue/40"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                    <FileText className="text-dblue" size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Đang phát triển</div>
                                    <div className="text-xs text-gray-500">Ủng hộ trước, có thể cần ngày giao dự kiến</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Pre-order toggle */}
                <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${formData.isPreorder ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${formData.isPreorder ? 'bg-amber-100' : 'bg-white'}`}>
                            <Calendar className={formData.isPreorder ? 'text-amber-700' : 'text-gray-500'} size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Cho phép đặt hàng trước</div>
                            <div className="text-xs text-gray-500">Bật khi sản phẩm giao vào một ngày dự kiến trong tương lai</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={formData.isPreorder}
                        aria-label="Cho phép đặt hàng trước"
                        onClick={() => setFormData(prev => ({ ...prev, isPreorder: !prev.isPreorder, deliveryDate: prev.isPreorder ? '' : prev.deliveryDate }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${formData.isPreorder ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${formData.isPreorder ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
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
                    <p className="text-xs text-gray-500 mt-1">COD chỉ áp dụng cho sản phẩm vật lý có sẵn.</p>
                </div>

                {/* Min Amount */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mức ủng hộ tối thiểu *
                        {hasPledges && (
                            <span className="text-amber-600 text-xs ml-2">
                                (Cẩn thận khi thay đổi - đã có người ủng hộ)
                            </span>
                        )}
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

                {/* Max Quantity */}
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
                    <p className="text-xs text-gray-500 mt-1">
                        Số lượng tối đa có thể phát hành (để trống nếu không giới hạn)
                    </p>
                </div>

                {/* Pre-order delivery date */}
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
                    <p className="text-xs text-gray-500 mt-1">
                        Ngày này sẽ được hiển thị cho khách hàng trước khi đặt hàng.
                    </p>
                </div>}

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${formData.isActive ? 'bg-fgreen/10' : 'bg-gray-100'
                            }`}>
                            {formData.isActive ? (
                                <Eye className="text-pgreen" size={20} />
                            ) : (
                                <EyeOff className="text-gray-600" size={20} />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">
                                {formData.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                            </div>
                            <div className="text-sm text-gray-500">
                                {formData.isActive
                                    ? 'Quà tặng hiển thị cho người ủng hộ'
                                    : 'Quà tặng bị ẩn khỏi danh sách'
                                }
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={toggleActive}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-pgreen' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Submit Buttons */}
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
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật quà tặng'}
                    </button>
                </div>
            </form>
        </div>
    );
}