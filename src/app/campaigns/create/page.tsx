"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUpload } from "@/components/shared/ImageUpload";
import RichTextEditor from "@/components/shared/RichTextEditor";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    goalAmount: 1000000,
    category: "Phát triển",
    imageUrl: "",
    endDate: "",
  });

  const [displayAmount, setDisplayAmount] = useState("1.000.000");

  const formatVNDInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(numericValue));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatVNDInput(rawValue);
    const numeric = Number(rawValue.replace(/\D/g, ""));

    setDisplayAmount(formatted);
    setFormData({ ...formData, goalAmount: numeric });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const campaign = await res.json();
        router.push(`/campaigns/${campaign.slug}`);
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi khi tạo dự án");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">Bắt đầu dự án mới</CardTitle>
          <CardDescription>
            Chia sẻ ý tưởng của bạn với cộng đồng và biến nó thành hiện thực.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tên dự án</label>
              <Input 
                required 
                placeholder="Ví dụ: Năng lượng xanh cho bản vùng cao" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mô tả ngắn (Tagline)</label>
              <Input 
                required 
                placeholder="Câu tóm tắt ngắn gọn nhất về dự án của bạn..." 
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mô tả chi tiết</label>
              <RichTextEditor 
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Kể chi tiết về dự án của bạn, tại sao mọi người nên hỗ trợ..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Số vốn mục tiêu (VND)</label>
                <Input 
                  type="text" 
                  required 
                  placeholder="VD: 1.000.000"
                  value={displayAmount}
                  onChange={handleAmountChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ngày kết thúc</label>
                <Input 
                  type="date" 
                  required 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <ImageUpload 
              label="Ảnh dự án"
              value={formData.imageUrl}
              onChange={(url: string) => setFormData({ ...formData, imageUrl: url })}
            />

            <Button type="submit" disabled={loading} className="w-full py-4 text-lg font-bold">
              {loading ? "Đang xử lý..." : "Khởi tạo dự án"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
