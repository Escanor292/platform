export type PublicProductReview = {
  id: string;
  rating: number;
  comment?: string | null;
};

export function isProductReviewQuestion(question: string) {
  return /(đánh giá|review|bình luận|nhận xét|phản hồi).*(sản phẩm|hàng|món)|((sản phẩm|hàng|món).*(đánh giá|review|bình luận|nhận xét|phản hồi))/.test(question.toLocaleLowerCase("vi-VN"));
}

export function rewardIdFromProductPath(pathname: string) {
  const match = /^\/products\/([^/?#]+)/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function summarizePublicProductReviews(reviews: PublicProductReview[]) {
  const valid = reviews.filter(review => Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5);
  if (valid.length === 0) {
    return "Sản phẩm này hiện chưa có đánh giá công khai đã xác nhận. Bạn có thể xem lại sau khi người mua hoàn tất nhận hàng và gửi phản hồi.";
  }

  const total = valid.length;
  const average = valid.reduce((sum, review) => sum + review.rating, 0) / total;
  const distribution = [5, 4, 3, 2, 1]
    .map(star => ({ star, count: valid.filter(review => review.rating === star).length }))
    .filter(item => item.count > 0)
    .map(item => `${item.star} sao: ${item.count}`)
    .join(" · ");
  const commented = valid.filter(review => review.comment?.trim()).length;
  const positive = valid.filter(review => review.rating >= 4).length;
  const low = valid.filter(review => review.rating <= 2).length;
  const trend = low === 0
    ? "Chưa có đánh giá từ 1–2 sao trong dữ liệu hiện có."
    : positive > low
      ? "Phản hồi tích cực vẫn nhiều hơn đánh giá thấp; hãy xem chi tiết để cân nhắc các góp ý cụ thể."
      : "Có một số phản hồi cần cân nhắc; hãy đọc phần đánh giá chi tiết trước khi quyết định.";

  return `Tôi đã xem ${total} đánh giá công khai của sản phẩm này: trung bình ${average.toFixed(1)}/5 sao (${distribution}). Có ${commented} bình luận kèm nội dung. ${trend} Tôi chỉ tổng hợp số liệu và xu hướng, không lặp lại nguyên văn bình luận của người dùng.`;
}
