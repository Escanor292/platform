import React from "react";
import { CreateCampaignForm } from "@/components/create-campaign/create-campaign-form";
import { getTaxonomyStats } from "@/lib/taxonomy-helpers";

export default function TaxonomyDemoPage() {
  const stats = getTaxonomyStats();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campaign Taxonomy Demo
          </h1>
          <p className="text-gray-600">
            Hệ thống phân loại chiến dịch với {stats.totalCategories} danh mục chính
            và {stats.totalTags} thẻ phụ
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCategories}
            </div>
            <div className="text-sm text-gray-600">Danh mục chính</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalTags}
            </div>
            <div className="text-sm text-gray-600">Tổng số thẻ</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.tagsByGroup).length}
            </div>
            <div className="text-sm text-gray-600">Nhóm thẻ</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">5</div>
            <div className="text-sm text-gray-600">Thẻ tối đa</div>
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CreateCampaignForm />
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Hướng dẫn sử dụng
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Chọn 1 danh mục chính phù hợp với chiến dịch của bạn</li>
            <li>• Hệ thống sẽ tự động lọc và hiển thị các thẻ phụ phù hợp</li>
            <li>• Chọn tối đa 5 thẻ phụ để mô tả chi tiết chiến dịch</li>
            <li>• Sử dụng tìm kiếm để nhanh chóng tìm thẻ phù hợp</li>
            <li>
              • Nếu thay đổi danh mục chính, các thẻ không phù hợp sẽ tự động bị
              xóa
            </li>
          </ul>
        </div>
        
        {/* Category Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Số lượng thẻ theo danh mục
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(stats.tagsByCategory).map(([category, count]) => (
              <div
                key={category}
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
