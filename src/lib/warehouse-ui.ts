export const DIGITAL_FULFILLMENT_TYPES = ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] as const;
export type DigitalFulfillmentType = (typeof DIGITAL_FULFILLMENT_TYPES)[number];
export type WarehouseCategory = "all" | "game" | "comic" | "image" | "video" | "ebook" | "key" | "other";

export function isDigitalFulfillment(type?: string | null): type is DigitalFulfillmentType {
  return DIGITAL_FULFILLMENT_TYPES.includes(type as DigitalFulfillmentType);
}

export function warehouseCategory(type?: string | null, title?: string | null): Exclude<WarehouseCategory, "all"> {
  const haystack = `${type || ""} ${title || ""}`.toLowerCase();
  if (type === "LICENSE_KEY" || /\bgame\b|steam|key|ban quyen|bản quyền/.test(haystack)) return "game";
  if (type === "DIGITAL_COMIC" || /truyen|truyện|comic|manga|webtoon/.test(haystack)) return "comic";
  if (/anh|ảnh|image|art pack|wallpaper|poster/.test(haystack)) return "image";
  if (/video|phim|clip/.test(haystack)) return "video";
  if (/ebook|pdf|sach|sách|epub/.test(haystack)) return "ebook";
  if (type === "LICENSE_KEY") return "key";
  return "other";
}

export function warehouseCategoryLabel(category: WarehouseCategory) {
  const labels: Record<WarehouseCategory, string> = {
    all: "Tất cả",
    game: "Game",
    comic: "Truyện tranh",
    image: "Ảnh / pack",
    video: "Video",
    ebook: "Ebook",
    key: "Mã bản quyền",
    other: "Khác",
  };
  return labels[category];
}
