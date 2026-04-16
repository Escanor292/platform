// Complete Campaign Taxonomy Data - VIETNAMESE VERSION
import type { TaxonomyData, StarterTag, MainCategory, CategoryTaxonomy } from "@/types/taxonomy";
import { VIETNAMESE_LABELS, applyVietnameseLabels } from "./taxonomy-labels-vi";

// ============================================
// ALL STARTER TAGS POOL - VIETNAMESE
// ============================================
const ALL_STARTER_TAGS_RAW: StarterTag[] = [
  // Loại nội dung
  { id: "truyen-tranh", label: "Truyện tranh", group: "Loại nội dung" },
  { id: "comic", label: "Comic", group: "Loại nội dung" },
  { id: "manga", label: "Manga", group: "Loại nội dung" },
  { id: "webtoon", label: "Webtoon", group: "Loại nội dung" },
  { id: "minh-hoa", label: "Minh họa", group: "Loại nội dung" },
  { id: "tranh-ve", label: "Tranh vẽ", group: "Loại nội dung" },
  { id: "artbook", label: "Artbook", group: "Loại nội dung" },
  { id: "phim-ngan", label: "Phim ngắn", group: "Loại nội dung" },
  { id: "am-nhac", label: "Âm nhạc", group: "Loại nội dung" },
  { id: "album", label: "Album", group: "Loại nội dung" },
  { id: "video-game", label: "Video game", group: "Loại nội dung" },
  { id: "board-game", label: "Board game", group: "Loại nội dung" },
  { id: "hoc-lieu", label: "Học liệu", group: "Loại nội dung" },
  { id: "khoa-hoc", label: "Khóa học", group: "Loại nội dung" },
  { id: "sach", label: "Sách", group: "Loại nội dung" },
  { id: "giao-trinh", label: "Giáo trình", group: "Loại nội dung" },
  { id: "thiet-bi", label: "Thiết bị", group: "Loại nội dung" },
  { id: "phan-mem", label: "Phần mềm", group: "Loại nội dung" },
  { id: "ung-dung", label: "Ứng dụng", group: "Loại nội dung" },
  { id: "dich-vu", label: "Dịch vụ", group: "Loại nội dung" },
  { id: "san-pham-vat-ly", label: "Sản phẩm vật lý", group: "Loại nội dung" },
  { id: "nong-san", label: "Nông sản", group: "Loại nội dung" },
  { id: "thuc-pham", label: "Thực phẩm", group: "Loại nội dung" },
  { id: "chuong-trinh", label: "Chương trình", group: "Loại nội dung" },
  { id: "su-kien", label: "Sự kiện", group: "Loại nội dung" },
  { id: "workshop", label: "Workshop", group: "Loại nội dung" },
  { id: "hoi-thao", label: "Hội thảo", group: "Loại nội dung" },
  { id: "documentary", label: "Documentary", group: "Loại nội dung" },
  { id: "podcast", label: "Podcast", group: "Loại nội dung" },
  { id: "animation", label: "Animation", group: "Loại nội dung" },
  
  // Định dạng phát hành
  { id: "sach-in", label: "Sách in", group: "Định dạng phát hành" },
  { id: "ebook", label: "Ebook", group: "Định dạng phát hành" },
  { id: "digital", label: "Digital", group: "Định dạng phát hành" },
  { id: "physical", label: "Physical", group: "Định dạng phát hành" },
  { id: "series", label: "Series", group: "Định dạng phát hành" },
  { id: "trien-lam", label: "Triển lãm", group: "Định dạng phát hành" },
  { id: "mobile-app", label: "Mobile app", group: "Định dạng phát hành" },
  { id: "web-app", label: "Web app", group: "Định dạng phát hành" },
  { id: "desktop-app", label: "Desktop app", group: "Định dạng phát hành" },
  { id: "saas", label: "SaaS", group: "Định dạng phát hành" },
  { id: "platform", label: "Platform", group: "Định dạng phát hành" },
  { id: "marketplace", label: "Marketplace", group: "Định dạng phát hành" },
  { id: "online", label: "Online", group: "Định dạng phát hành" },
  { id: "offline", label: "Offline", group: "Định dạng phát hành" },
  { id: "hybrid", label: "Hybrid", group: "Định dạng phát hành" },
  { id: "streaming", label: "Streaming", group: "Định dạng phát hành" },
  { id: "download", label: "Download", group: "Định dạng phát hành" },
  { id: "subscription", label: "Subscription", group: "Định dạng phát hành" },
  { id: "one-time", label: "One-time", group: "Định dạng phát hành" },
  
  // Mục đích / Phong cách
  { id: "indie", label: "Indie", group: "Mục đích / Phong cách" },
  { id: "sang-tao", label: "Sáng tạo", group: "Mục đích / Phong cách" },
  { id: "storytelling", label: "Storytelling", group: "Mục đích / Phong cách" },
  { id: "giao-duc", label: "Giáo dục", group: "Mục đích / Phong cách" },
  { id: "giai-tri", label: "Giải trí", group: "Mục đích / Phong cách" },
  { id: "fandom", label: "Fandom", group: "Mục đích / Phong cách" },
  { id: "community-driven", label: "Community-driven", group: "Mục đích / Phong cách" },
  { id: "open-source", label: "Open source", group: "Mục đích / Phong cách" },
  { id: "commercial", label: "Commercial", group: "Mục đích / Phong cách" },
  { id: "non-profit", label: "Non-profit", group: "Mục đích / Phong cách" },
  { id: "social-impact", label: "Social impact", group: "Mục đích / Phong cách" },
  { id: "bao-ton", label: "Bảo tồn", group: "Mục đích / Phong cách" },
  { id: "doi-moi", label: "Đổi mới", group: "Mục đích / Phong cách" },
  { id: "truyen-thong", label: "Truyền thống", group: "Mục đích / Phong cách" },
  { id: "hien-dai", label: "Hiện đại", group: "Mục đích / Phong cách" },
  { id: "experimental", label: "Experimental", group: "Mục đích / Phong cách" },
  { id: "mainstream", label: "Mainstream", group: "Mục đích / Phong cách" },
  
  // Loại sản phẩm
  { id: "hardware", label: "Hardware", group: "Loại sản phẩm" },
  { id: "software", label: "Software", group: "Loại sản phẩm" },
  { id: "robot", label: "Robot", group: "Loại sản phẩm" },
  { id: "wearable", label: "Wearable", group: "Loại sản phẩm" },
  { id: "smart-device", label: "Smart device", group: "Loại sản phẩm" },
  { id: "consumer-product", label: "Consumer product", group: "Loại sản phẩm" },
  { id: "b2b-solution", label: "B2B solution", group: "Loại sản phẩm" },
  { id: "b2c-product", label: "B2C product", group: "Loại sản phẩm" },
  { id: "merchandise", label: "Merchandise", group: "Loại sản phẩm" },
  { id: "handmade", label: "Handmade", group: "Loại sản phẩm" },
  { id: "mass-production", label: "Mass production", group: "Loại sản phẩm" },
  { id: "limited-edition", label: "Limited edition", group: "Loại sản phẩm" },
  { id: "custom", label: "Custom", group: "Loại sản phẩm" },
  
  // Công nghệ / Kỹ thuật
  { id: "ai", label: "AI", group: "Công nghệ / Kỹ thuật" },
  { id: "machine-learning", label: "Machine Learning", group: "Công nghệ / Kỹ thuật" },
  { id: "iot", label: "IoT", group: "Công nghệ / Kỹ thuật" },
  { id: "blockchain", label: "Blockchain", group: "Công nghệ / Kỹ thuật" },
  { id: "ar-vr", label: "AR/VR", group: "Công nghệ / Kỹ thuật" },
  { id: "cloud", label: "Cloud", group: "Công nghệ / Kỹ thuật" },
  { id: "robotics", label: "Robotics", group: "Công nghệ / Kỹ thuật" },
  { id: "automation", label: "Automation", group: "Công nghệ / Kỹ thuật" },
  { id: "sensor", label: "Sensor", group: "Công nghệ / Kỹ thuật" },
  { id: "drone", label: "Drone", group: "Công nghệ / Kỹ thuật" },
  { id: "3d-printing", label: "3D Printing", group: "Công nghệ / Kỹ thuật" },
  { id: "digital-art", label: "Digital art", group: "Công nghệ / Kỹ thuật" },
  { id: "3d-art", label: "3D art", group: "Công nghệ / Kỹ thuật" },
  { id: "game-engine", label: "Game engine", group: "Công nghệ / Kỹ thuật" },
  { id: "unity", label: "Unity", group: "Công nghệ / Kỹ thuật" },
  { id: "unreal", label: "Unreal", group: "Công nghệ / Kỹ thuật" },
  { id: "renewable-energy", label: "Renewable energy", group: "Công nghệ / Kỹ thuật" },
  { id: "solar", label: "Solar", group: "Công nghệ / Kỹ thuật" },
  { id: "biotech", label: "Biotech", group: "Công nghệ / Kỹ thuật" },
  { id: "agritech", label: "Agritech", group: "Công nghệ / Kỹ thuật" },
  { id: "healthtech", label: "Healthtech", group: "Công nghệ / Kỹ thuật" },
  { id: "edtech", label: "Edtech", group: "Công nghệ / Kỹ thuật" },
  { id: "fintech", label: "Fintech", group: "Công nghệ / Kỹ thuật" },
  { id: "cleantech", label: "Cleantech", group: "Công nghệ / Kỹ thuật" },
  
  // Giai đoạn phát triển
  { id: "idea", label: "Idea", group: "Giai đoạn phát triển" },
  { id: "concept", label: "Concept", group: "Giai đoạn phát triển" },
  { id: "prototype", label: "Prototype", group: "Giai đoạn phát triển" },
  { id: "mvp", label: "MVP", group: "Giai đoạn phát triển" },
  { id: "alpha", label: "Alpha", group: "Giai đoạn phát triển" },
  { id: "beta", label: "Beta", group: "Giai đoạn phát triển" },
  { id: "pre-order", label: "Pre-order", group: "Giai đoạn phát triển" },
  { id: "production", label: "Production", group: "Giai đoạn phát triển" },
  { id: "retail-launch", label: "Retail launch", group: "Giai đoạn phát triển" },
  { id: "expansion", label: "Expansion", group: "Giai đoạn phát triển" },
  { id: "scale-up", label: "Scale-up", group: "Giai đoạn phát triển" },
  { id: "pilot", label: "Pilot", group: "Giai đoạn phát triển" },
  { id: "trial", label: "Trial", group: "Giai đoạn phát triển" },
  { id: "draft", label: "Draft", group: "Giai đoạn phát triển" },
  { id: "phat-hanh", label: "Phát hành", group: "Giai đoạn phát triển" },
  
  // Mô hình / Vận hành
  { id: "startup", label: "Startup", group: "Mô hình / Vận hành" },
  { id: "small-business", label: "Small business", group: "Mô hình / Vận hành" },
  { id: "social-enterprise", label: "Social enterprise", group: "Mô hình / Vận hành" },
  { id: "cooperative", label: "Cooperative", group: "Mô hình / Vận hành" },
  { id: "ngo", label: "NGO", group: "Mô hình / Vận hành" },
  { id: "donation", label: "Donation", group: "Mô hình / Vận hành" },
  { id: "reward-based", label: "Reward-based", group: "Mô hình / Vận hành" },
  { id: "equity", label: "Equity", group: "Mô hình / Vận hành" },
  { id: "pre-sale", label: "Pre-sale", group: "Mô hình / Vận hành" },
  { id: "franchise", label: "Franchise", group: "Mô hình / Vận hành" },
  { id: "licensing", label: "Licensing", group: "Mô hình / Vận hành" },
  
  // Đối tượng hưởng lợi
  { id: "tre-em", label: "Trẻ em", group: "Đối tượng hưởng lợi" },
  { id: "hoc-sinh", label: "Học sinh", group: "Đối tượng hưởng lợi" },
  { id: "sinh-vien", label: "Sinh viên", group: "Đối tượng hưởng lợi" },
  { id: "nguoi-lon", label: "Người lớn", group: "Đối tượng hưởng lợi" },
  { id: "nguoi-cao-tuoi", label: "Người cao tuổi", group: "Đối tượng hưởng lợi" },
  { id: "benh-nhan", label: "Bệnh nhân", group: "Đối tượng hưởng lợi" },
  { id: "nong-dan", label: "Nông dân", group: "Đối tượng hưởng lợi" },
  { id: "cong-dong-dia-phuong", label: "Cộng đồng địa phương", group: "Đối tượng hưởng lợi" },
  { id: "dan-toc-thieu-so", label: "Dân tộc thiểu số", group: "Đối tượng hưởng lợi" },
  { id: "nguoi-khuyet-tat", label: "Người khuyết tật", group: "Đối tượng hưởng lợi" },
  { id: "phu-nu", label: "Phụ nữ", group: "Đối tượng hưởng lợi" },
  { id: "nan-nhan-thien-tai", label: "Nạn nhân thiên tai", group: "Đối tượng hưởng lợi" },
  { id: "nguoi-ngheo", label: "Người nghèo", group: "Đối tượng hưởng lợi" },
  { id: "gamers", label: "Gamers", group: "Đối tượng hưởng lợi" },
  { id: "creators", label: "Creators", group: "Đối tượng hưởng lợi" },
  { id: "developers", label: "Developers", group: "Đối tượng hưởng lợi" },
  { id: "doanh-nghiep", label: "Doanh nghiệp", group: "Đối tượng hưởng lợi" },
  
  // Phạm vi
  { id: "local", label: "Local", group: "Phạm vi" },
  { id: "national", label: "National", group: "Phạm vi" },
  { id: "regional", label: "Regional", group: "Phạm vi" },
  { id: "global", label: "Global", group: "Phạm vi" },
  { id: "urban", label: "Urban", group: "Phạm vi" },
  { id: "rural", label: "Rural", group: "Phạm vi" },
  
  // Thời gian
  { id: "urgent", label: "Urgent", group: "Thời gian" },
  { id: "short-term", label: "Short-term", group: "Thời gian" },
  { id: "long-term", label: "Long-term", group: "Thời gian" },
  { id: "ongoing", label: "Ongoing", group: "Thời gian" },
  { id: "seasonal", label: "Seasonal", group: "Thời gian" },
  { id: "one-time", label: "One-time", group: "Thời gian" },
];

// ============================================
// TAXONOMY BY CATEGORY
// ============================================

const GIAO_DUC_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Đối tượng hưởng lợi",
    "Phạm vi",
  ],
  recommendedStarterTags: [
    "khoa-hoc",
    "hoc-lieu",
    "mobile-app",
    "web-app",
    "edtech",
    "online",
    "tre-em",
    "hoc-sinh",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "video-game",
    "board-game",
    "fandom",
    "merchandise",
    "game-engine",
    "unity",
    "unreal",
    "benh-nhan",
    "nong-dan",
    "nan-nhan-thien-tai",
    "donation",
    "urgent",
    "agritech",
    "healthtech",
    "nong-san",
    "thuc-pham",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["khoa-hoc", "hoc-lieu", "sach", "giao-trinh", "ung-dung", "phan-mem", "workshop", "hoi-thao", "podcast"].includes(t.id)
    )),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["mobile-app", "web-app", "platform", "online", "offline", "hybrid", "ebook", "sach-in", "subscription", "one-time"].includes(t.id)
    )),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["giao-duc", "community-driven", "open-source", "commercial", "non-profit", "doi-moi", "truyen-thong"].includes(t.id)
    )),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["ai", "machine-learning", "edtech", "cloud", "ar-vr"].includes(t.id)
    )),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "mvp", "beta", "production", "pilot", "trial"].includes(t.id)
    )),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["tre-em", "hoc-sinh", "sinh-vien", "nguoi-lon", "nguoi-khuyet-tat", "dan-toc-thieu-so"].includes(t.id)
    )),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "national", "regional", "global", "urban", "rural"].includes(t.id)
    )),
    "Loại sản phẩm": [],
    "Mô hình / Vận hành": [],
    "Thời gian": [],
  },
};

const Y_TE_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Loại sản phẩm",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Đối tượng hưởng lợi",
    "Phạm vi",
  ],
  recommendedStarterTags: [
    "thiet-bi",
    "ung-dung",
    "healthtech",
    "mobile-app",
    "ai",
    "benh-nhan",
    "prototype",
    "mvp",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "am-nhac",
    "video-game",
    "board-game",
    "fandom",
    "merchandise",
    "game-engine",
    "unity",
    "unreal",
    "nong-san",
    "thuc-pham",
    "agritech",
    "nong-dan",
    "gamers",
    "storytelling",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["thiet-bi", "ung-dung", "phan-mem", "dich-vu", "san-pham-vat-ly", "chuong-trinh", "workshop"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["mobile-app", "web-app", "platform", "saas", "physical", "online", "offline", "hybrid"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["social-impact", "non-profit", "commercial", "community-driven", "doi-moi"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["hardware", "software", "wearable", "smart-device", "b2b-solution", "b2c-product"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["ai", "machine-learning", "iot", "healthtech", "biotech", "cloud", "sensor"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "mvp", "beta", "pilot", "trial", "production"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["benh-nhan", "nguoi-cao-tuoi", "tre-em", "nguoi-khuyet-tat", "phu-nu", "cong-dong-dia-phuong"].includes(t.id))),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "national", "regional", "global", "urban", "rural"].includes(t.id))),
    "Mô hình / Vận hành": [],
    "Thời gian": [],
  },
};

const CONG_DONG_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Giai đoạn phát triển",
    "Mô hình / Vận hành",
    "Đối tượng hưởng lợi",
    "Phạm vi",
    "Thời gian",
  ],
  recommendedStarterTags: [
    "su-kien",
    "chuong-trinh",
    "workshop",
    "community-driven",
    "social-impact",
    "cong-dong-dia-phuong",
    "local",
    "non-profit",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "video-game",
    "board-game",
    "fandom",
    "merchandise",
    "game-engine",
    "unity",
    "unreal",
    "pre-order",
    "retail-launch",
    "mass-production",
    "gamers",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["su-kien", "chuong-trinh", "workshop", "hoi-thao", "dich-vu", "platform"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["online", "offline", "hybrid", "platform", "marketplace"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["community-driven", "social-impact", "non-profit", "bao-ton", "doi-moi", "truyen-thong"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "pilot", "trial", "ongoing", "expansion"].includes(t.id))),
    "Mô hình / Vận hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["ngo", "social-enterprise", "cooperative", "donation", "reward-based"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["cong-dong-dia-phuong", "dan-toc-thieu-so", "nguoi-khuyet-tat", "phu-nu", "nguoi-ngheo", "tre-em", "nguoi-cao-tuoi"].includes(t.id))),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "regional", "national", "urban", "rural"].includes(t.id))),
    "Thời gian": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["short-term", "long-term", "ongoing", "seasonal", "one-time"].includes(t.id))),
    "Loại sản phẩm": [],
    "Công nghệ / Kỹ thuật": [],
  },
};

const CONG_NGHE_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Loại sản phẩm",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Mô hình / Vận hành",
    "Đối tượng hưởng lợi",
  ],
  recommendedStarterTags: [
    "mobile-app",
    "web-app",
    "platform",
    "ai",
    "iot",
    "prototype",
    "mvp",
    "startup",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "am-nhac",
    "fandom",
    "storytelling",
    "nong-san",
    "thuc-pham",
    "benh-nhan",
    "nan-nhan-thien-tai",
    "donation",
    "urgent",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["phan-mem", "ung-dung", "thiet-bi", "san-pham-vat-ly", "dich-vu", "platform"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["mobile-app", "web-app", "desktop-app", "saas", "platform", "marketplace", "physical", "subscription", "one-time"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["indie", "open-source", "commercial", "community-driven", "doi-moi", "experimental"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["hardware", "software", "robot", "wearable", "smart-device", "consumer-product", "b2b-solution", "b2c-product"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["ai", "machine-learning", "iot", "blockchain", "ar-vr", "cloud", "robotics", "automation", "sensor", "drone", "3d-printing"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "mvp", "alpha", "beta", "pre-order", "production", "retail-launch"].includes(t.id))),
    "Mô hình / Vận hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["startup", "small-business", "pre-sale", "reward-based", "equity"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["developers", "doanh-nghiep", "nguoi-lon", "sinh-vien"].includes(t.id))),
    "Phạm vi": [],
    "Thời gian": [],
  },
};

const NGHE_THUAT_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Loại sản phẩm",
  ],
  recommendedStarterTags: [
    "truyen-tranh",
    "webtoon",
    "artbook",
    "album",
    "phim-ngan",
    "digital",
    "sach-in",
    "indie",
  ],
  disallowedStarterTags: [
    "thiet-bi",
    "iot",
    "sensor",
    "drone",
    "robot",
    "agritech",
    "healthtech",
    "nong-san",
    "thuc-pham",
    "benh-nhan",
    "nong-dan",
    "nan-nhan-thien-tai",
    "donation",
    "urgent",
    "b2b-solution",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["truyen-tranh", "comic", "manga", "webtoon", "minh-hoa", "tranh-ve", "artbook", "phim-ngan", "am-nhac", "album", "animation", "documentary", "podcast"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["sach-in", "ebook", "digital", "physical", "series", "trien-lam", "streaming", "download", "limited-edition"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["indie", "sang-tao", "storytelling", "fandom", "community-driven", "experimental", "mainstream", "truyen-thong", "hien-dai"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["digital-art", "3d-art", "animation", "ar-vr"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "draft", "prototype", "pre-order", "phat-hanh", "series"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["merchandise", "handmade", "limited-edition", "custom"].includes(t.id))),
    "Mô hình / Vận hành": [],
    "Đối tượng hưởng lợi": [],
    "Phạm vi": [],
    "Thời gian": [],
  },
};

const MOI_TRUONG_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Loại sản phẩm",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Mô hình / Vận hành",
    "Đối tượng hưởng lợi",
    "Phạm vi",
  ],
  recommendedStarterTags: [
    "san-pham-vat-ly",
    "cleantech",
    "renewable-energy",
    "social-impact",
    "bao-ton",
    "prototype",
    "cong-dong-dia-phuong",
    "local",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "am-nhac",
    "video-game",
    "board-game",
    "fandom",
    "merchandise",
    "game-engine",
    "unity",
    "unreal",
    "gamers",
    "storytelling",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["san-pham-vat-ly", "thiet-bi", "dich-vu", "chuong-trinh", "su-kien"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["physical", "platform", "marketplace", "online", "offline", "hybrid"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["social-impact", "non-profit", "bao-ton", "doi-moi", "community-driven"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["consumer-product", "b2b-solution", "b2c-product", "handmade"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["cleantech", "renewable-energy", "solar", "iot", "sensor", "3d-printing", "biotech"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "pilot", "mvp", "production", "scale-up"].includes(t.id))),
    "Mô hình / Vận hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["social-enterprise", "ngo", "cooperative", "startup", "small-business"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["cong-dong-dia-phuong", "nong-dan", "nguoi-ngheo", "dan-toc-thieu-so"].includes(t.id))),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "regional", "national", "global", "urban", "rural"].includes(t.id))),
    "Thời gian": [],
  },
};

const NONG_NGHIEP_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Loại sản phẩm",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Mô hình / Vận hành",
    "Đối tượng hưởng lợi",
    "Phạm vi",
  ],
  recommendedStarterTags: [
    "nong-san",
    "thuc-pham",
    "agritech",
    "iot",
    "marketplace",
    "nong-dan",
    "pilot",
    "rural",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "am-nhac",
    "video-game",
    "board-game",
    "fandom",
    "merchandise",
    "game-engine",
    "unity",
    "unreal",
    "benh-nhan",
    "gamers",
    "storytelling",
    "healthtech",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["nong-san", "thuc-pham", "thiet-bi", "ung-dung", "dich-vu", "chuong-trinh"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["physical", "marketplace", "platform", "mobile-app", "web-app", "subscription"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["social-impact", "commercial", "community-driven", "doi-moi", "truyen-thong"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["hardware", "software", "consumer-product", "b2b-solution", "b2c-product"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["agritech", "iot", "sensor", "drone", "automation", "ai", "biotech"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "pilot", "trial", "mvp", "production", "scale-up"].includes(t.id))),
    "Mô hình / Vận hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["startup", "small-business", "social-enterprise", "cooperative", "pre-sale"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["nong-dan", "cong-dong-dia-phuong", "dan-toc-thieu-so", "doanh-nghiep"].includes(t.id))),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "regional", "national", "rural", "urban"].includes(t.id))),
    "Thời gian": [],
  },
};

const GIAI_TRI_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Loại sản phẩm",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Đối tượng hưởng lợi",
  ],
  recommendedStarterTags: [
    "video-game",
    "board-game",
    "animation",
    "indie",
    "prototype",
    "alpha",
    "gamers",
    "fandom",
  ],
  disallowedStarterTags: [
    "benh-nhan",
    "nong-dan",
    "nan-nhan-thien-tai",
    "donation",
    "urgent",
    "ngo",
    "nong-san",
    "thuc-pham",
    "agritech",
    "healthtech",
    "hoc-lieu",
    "giao-trinh",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["video-game", "board-game", "animation", "phim-ngan", "am-nhac", "album", "su-kien", "podcast"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["mobile-app", "web-app", "desktop-app", "digital", "physical", "streaming", "download", "subscription"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["indie", "fandom", "storytelling", "community-driven", "commercial", "experimental", "mainstream"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["merchandise", "consumer-product", "limited-edition", "handmade"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["game-engine", "unity", "unreal", "ar-vr", "3d-art", "animation", "ai"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "alpha", "beta", "pre-order", "phat-hanh", "expansion"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["gamers", "creators", "tre-em", "nguoi-lon"].includes(t.id))),
    "Mô hình / Vận hành": [],
    "Phạm vi": [],
    "Thời gian": [],
  },
};

const KINH_DOANH_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Định dạng phát hành",
    "Mục đích / Phong cách",
    "Loại sản phẩm",
    "Công nghệ / Kỹ thuật",
    "Giai đoạn phát triển",
    "Mô hình / Vận hành",
    "Đối tượng hưởng lợi",
    "Phạm vi",
  ],
  recommendedStarterTags: [
    "startup",
    "san-pham-vat-ly",
    "dich-vu",
    "mvp",
    "pre-sale",
    "commercial",
    "doanh-nghiep",
    "local",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "am-nhac",
    "video-game",
    "board-game",
    "fandom",
    "game-engine",
    "unity",
    "unreal",
    "benh-nhan",
    "nan-nhan-thien-tai",
    "donation",
    "urgent",
    "ngo",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["san-pham-vat-ly", "dich-vu", "ung-dung", "phan-mem", "thiet-bi", "nong-san", "thuc-pham"].includes(t.id))),
    "Định dạng phát hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["physical", "digital", "platform", "marketplace", "saas", "mobile-app", "web-app", "subscription", "one-time"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["commercial", "social-impact", "doi-moi", "truyen-thong", "indie"].includes(t.id))),
    "Loại sản phẩm": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["consumer-product", "b2b-solution", "b2c-product", "hardware", "software", "handmade", "mass-production", "limited-edition"].includes(t.id))),
    "Công nghệ / Kỹ thuật": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["ai", "iot", "fintech", "cloud", "automation", "3d-printing"].includes(t.id))),
    "Giai đoạn phát triển": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["idea", "concept", "prototype", "mvp", "beta", "pre-order", "production", "retail-launch", "expansion", "scale-up"].includes(t.id))),
    "Mô hình / Vận hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["startup", "small-business", "social-enterprise", "pre-sale", "reward-based", "equity", "franchise", "licensing"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["doanh-nghiep", "nguoi-lon", "cong-dong-dia-phuong", "nong-dan"].includes(t.id))),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "regional", "national", "global", "urban", "rural"].includes(t.id))),
    "Thời gian": [],
  },
};

const KHAN_CAP_TU_THIEN_TAXONOMY: CategoryTaxonomy = {
  allowedTagGroups: [
    "Loại nội dung",
    "Mục đích / Phong cách",
    "Mô hình / Vận hành",
    "Đối tượng hưởng lợi",
    "Phạm vi",
    "Thời gian",
  ],
  recommendedStarterTags: [
    "donation",
    "urgent",
    "non-profit",
    "social-impact",
    "nan-nhan-thien-tai",
    "benh-nhan",
    "nguoi-ngheo",
    "ongoing",
  ],
  disallowedStarterTags: [
    "manga",
    "webtoon",
    "artbook",
    "album",
    "am-nhac",
    "video-game",
    "board-game",
    "fandom",
    "merchandise",
    "game-engine",
    "unity",
    "unreal",
    "pre-order",
    "retail-launch",
    "pre-sale",
    "commercial",
    "startup",
    "equity",
    "franchise",
    "licensing",
    "gamers",
    "storytelling",
    "mass-production",
  ],
  tagGroups: {
    "Loại nội dung": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["chuong-trinh", "su-kien", "dich-vu"].includes(t.id))),
    "Mục đích / Phong cách": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["non-profit", "social-impact", "community-driven"].includes(t.id))),
    "Mô hình / Vận hành": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["donation", "ngo", "social-enterprise"].includes(t.id))),
    "Đối tượng hưởng lợi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["nan-nhan-thien-tai", "benh-nhan", "nguoi-ngheo", "tre-em", "nguoi-cao-tuoi", "nguoi-khuyet-tat", "phu-nu", "dan-toc-thieu-so", "cong-dong-dia-phuong"].includes(t.id))),
    "Phạm vi": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["local", "regional", "national", "global", "urban", "rural"].includes(t.id))),
    "Thời gian": applyVietnameseLabels(ALL_STARTER_TAGS_RAW.filter((t) =>
      ["urgent", "short-term", "long-term", "ongoing", "one-time"].includes(t.id))),
    "Định dạng phát hành": [],
    "Loại sản phẩm": [],
    "Công nghệ / Kỹ thuật": [],
    "Giai đoạn phát triển": [],
  },
};

// ============================================
// EXPORT TAXONOMY DATA WITH VIETNAMESE LABELS
// ============================================

// Apply Vietnamese labels to all tags
export const ALL_STARTER_TAGS = applyVietnameseLabels(ALL_STARTER_TAGS_RAW);

export const TAXONOMY_DATA: TaxonomyData = {
  mainCategories: [
    "Giáo dục",
    "Y tế",
    "Cộng đồng",
    "Công nghệ",
    "Nghệ thuật",
    "Môi trường",
    "Nông nghiệp",
    "Giải trí",
    "Kinh doanh",
    "Khẩn cấp & Từ thiện",
  ],
  starterTagsByCategory: {
    "Giáo dục": GIAO_DUC_TAXONOMY,
    "Y tế": Y_TE_TAXONOMY,
    "Cộng đồng": CONG_DONG_TAXONOMY,
    "Công nghệ": CONG_NGHE_TAXONOMY,
    "Nghệ thuật": NGHE_THUAT_TAXONOMY,
    "Môi trường": MOI_TRUONG_TAXONOMY,
    "Nông nghiệp": NONG_NGHIEP_TAXONOMY,
    "Giải trí": GIAI_TRI_TAXONOMY,
    "Kinh doanh": KINH_DOANH_TAXONOMY,
    "Khẩn cấp & Từ thiện": KHAN_CAP_TU_THIEN_TAXONOMY,
  },
  allStarterTags: ALL_STARTER_TAGS,
};
