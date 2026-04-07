import { Button, Card, Input } from "@/components/ui";

export default function CreateCampaignPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black mb-8">Tạo chiến dịch mới</h1>
      <Card>
        <form className="space-y-6" action="/api/campaigns" method="POST">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Tên chiến dịch</label>
            <Input name="title" placeholder="Ví dụ: Cứu trợ lũ lụt miền Trung" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Mục tiêu (VND)</label>
            <Input name="goalAmount" type="number" placeholder="50.000.000" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Mô tả ngắn</label>
            <Input name="tagline" placeholder="Tóm tắt về chiến dịch của bạn..." required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Hình ảnh dự án (URL)</label>
            <Input name="imageUrl" placeholder="HTTPS URL hình ảnh" />
          </div>
          <Button type="submit" className="w-full">Tạo dự án</Button>
        </form>
      </Card>
    </div>
  );
}
