/**
 * Mock Project Data for Testing
 */

import { ProjectListItem, CampaignType, CampaignStatus, CompletionState, MainCategory } from "@/types/project";

const categories: MainCategory[] = [
  "Giáo dục", "Y tế", "Cộng đồng", "Công nghệ", "Nghệ thuật",
  "Môi trường", "Nông nghiệp", "Giải trí", "Kinh doanh", "Khẩn cấp & Từ thiện"
];

const campaignTypes: CampaignType[] = ["REWARD", "DONATION", "EQUITY", "SUBSCRIPTION", "PREORDER"];

const projectTitles = [
  "Phát triển ứng dụng học tiếng Anh cho trẻ em",
  "Xây dựng trường học tại vùng cao",
  "Sản xuất robot dọn dẹp tự động",
  "Phim tài liệu về động vật hoang dã Việt Nam",
  "Nền tảng kết nối nông dân với người tiêu dùng",
  "Thiết bị lọc nước năng lượng mặt trời",
  "Album nhạc indie Việt Nam",
  "Startup công nghệ AI cho y tế",
  "Dự án trồng rừng bảo vệ môi trường",
  "Sách điện tử miễn phí cho học sinh nghèo",
  "Ứng dụng quản lý tài chính cá nhân",
  "Phát triển game giáo dục lịch sử Việt Nam",
  "Xây dựng bệnh viện từ thiện",
  "Sản xuất túi xách thân thiện môi trường",
  "Nền tảng học lập trình online",
  "Dự án nuôi ong mật hữu cơ",
  "Phim ngắn về văn hóa dân tộc",
  "Thiết bị theo dõi sức khỏe thông minh",
  "Quán cà phê xã hội dành cho người khuyết tật",
  "Ứng dụng đặt vé xem phim",
  "Dự án cứu trợ lũ lụt miền Trung",
  "Sản xuất đồ chơi gỗ thủ công",
  "Nền tảng crowdfunding cho nghệ sĩ",
  "Xây dựng thư viện cộng đồng",
  "Phát triển drone giao hàng",
  "Album ảnh nghệ thuật đường phố",
  "Dự án tái chế rác thải nhựa",
  "Ứng dụng tìm việc làm cho sinh viên",
  "Sản xuất thực phẩm hữu cơ",
  "Phim hoạt hình Việt Nam",
  "Thiết bị sạc điện thoại năng lượng mặt trời",
  "Dự án hỗ trợ người già neo đơn",
  "Nền tảng học ngoại ngữ với AI",
  "Xây dựng sân chơi cho trẻ em",
  "Sản xuất mỹ phẩm thiên nhiên",
];

function generateMockProjects(): ProjectListItem[] {
  const projects: ProjectListItem[] = [];
  const now = new Date();

  for (let i = 0; i < 35; i++) {
    const createdDaysAgo = Math.floor(Math.random() * 365);
    const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
    
    const durationDays = 30 + Math.floor(Math.random() * 60);
    const startDate = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const goalAmount = (Math.floor(Math.random() * 20) + 5) * 10000000; // 50M - 250M
    const progressPercent = Math.floor(Math.random() * 150); // 0-150%
    const currentAmount = Math.floor((goalAmount * progressPercent) / 100);
    
    const totalBackers = Math.floor(Math.random() * 500) + 10;
    const totalViews = Math.floor(Math.random() * 5000) + 100;
    
    const ratingCount = Math.floor(Math.random() * 100);
    const ratingAverage = ratingCount > 0 ? 3 + Math.random() * 2 : 0; // 3-5 stars
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const campaignType = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
    
    const statuses: CampaignStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "COMPLETED", "DRAFT", "PAUSED"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const completionStates: CompletionState[] = [
      "ONGOING", "ONGOING", "ONGOING", "GOAL_REACHED", "COMPLETED", "NOT_STARTED", "FAILED", "PAUSED"
    ];
    const completionState = completionStates[Math.floor(Math.random() * completionStates.length)];
    
    const isFeatured = Math.random() > 0.8;
    
    const title = projectTitles[i % projectTitles.length];
    const slug = title.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const campaignCode = `CF-${dateStr}-${randomStr}`;
    
    const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));
    
    projects.push({
      id: `project-${i + 1}`,
      campaignCode,
      slug: `${slug}-${i + 1}`,
      title,
      description: `Dự án ${title.toLowerCase()} nhằm mang lại giá trị cho cộng đồng và xã hội.`,
      imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=800&h=600&fit=crop`,
      
      creatorId: `creator-${Math.floor(i / 3) + 1}`,
      creatorName: `Creator ${Math.floor(i / 3) + 1}`,
      creatorAvatar: null,
      creatorIsPro: Math.random() > 0.7,
      
      category,
      tags: [`tag-${i % 5}`, `tag-${(i + 1) % 5}`],
      campaignType,
      
      goalAmount,
      currentAmount,
      progressPercent,
      
      totalBackers,
      totalViews,
      ratingAverage: parseFloat(ratingAverage.toFixed(1)),
      ratingCount,
      
      createdAt,
      updatedAt,
      startDate,
      endDate,
      
      status,
      completionState,
      isFeatured,
    });
  }

  return projects;
}

export const mockProjects = generateMockProjects();
