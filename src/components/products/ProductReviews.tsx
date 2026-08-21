'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ImagePlus, Loader2, Play, Star, Upload, UserRound } from 'lucide-react';

type Review = {
  id: string;
  rating: number;
  comment: string;
  mediaUrls: string[];
  createdAt: string;
  users: { name: string; avatar: string | null };
};

type Eligibility = {
  isLoggedIn: boolean;
  canConfirmReceipt: boolean;
  canReview: boolean;
  hasReviewed: boolean;
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(?:\?|$)/i.test(url);
}

export default function ProductReviews({ rewardId }: { rewardId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  async function loadReviews() {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${rewardId}/reviews`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể tải đánh giá');
      setReviews(data.reviews || []);
      setEligibility(data.eligibility || null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [rewardId]);

  async function confirmReceived() {
    setConfirming(true);
    setMessage('');
    try {
      const response = await fetch(`/api/products/${rewardId}/received`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể xác nhận');
      setMessage('Đã xác nhận nhận hàng. Bạn có thể gửi đánh giá ngay bây giờ.');
      await loadReviews();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể xác nhận đã nhận hàng');
    } finally {
      setConfirming(false);
    }
  }

  async function uploadFiles() {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        throw new Error(data.error || `Không thể tải ${file.name}`);
      }
      urls.push(data.secure_url);
    }
    return urls;
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) {
      setMessage('Vui lòng nhập nội dung bình luận.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const mediaUrls = await uploadFiles();
      const response = await fetch(`/api/products/${rewardId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, mediaUrls }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể gửi đánh giá');
      setReviews((current) => [data, ...current]);
      setEligibility((current) => current ? { ...current, canReview: false, hasReviewed: true } : current);
      setComment('');
      setFiles([]);
      setMessage('Cảm ơn bạn đã đánh giá sản phẩm.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12" aria-labelledby="product-reviews-title">
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-pgreen font-bold mb-1">Phản hồi cộng đồng</p>
            <h2 id="product-reviews-title" className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
            <p className="text-sm text-gray-500 mt-1">Chỉ người đã mua và xác nhận nhận hàng mới có thể đánh giá.</p>
          </div>
          <div className="text-sm text-gray-500">{reviews.length} đánh giá</div>
        </div>

        {eligibility?.canConfirmReceipt && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-900">Bạn đã nhận được sản phẩm?</p>
              <p className="text-sm text-amber-800">Xác nhận để mở quyền đánh giá và chia sẻ ảnh/video thực tế.</p>
            </div>
            <button type="button" onClick={confirmReceived} disabled={confirming} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
              {confirming && <Loader2 size={16} className="animate-spin" />}
              {confirming ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng'}
            </button>
          </div>
        )}

        {eligibility?.canReview && (
          <form onSubmit={submitReview} className="rounded-2xl border border-pgreen/20 bg-pgreen/5 p-4 sm:p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Chia sẻ trải nghiệm của bạn</h3>
            <div className="flex items-center gap-1 mb-4" aria-label="Chọn số sao">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} sao`} className="p-1">
                  <Star size={24} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} maxLength={2000} placeholder="Sản phẩm và trải nghiệm của bạn như thế nào?" className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pgreen focus:ring-2 focus:ring-pgreen/10" />
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-pgreen">
                <ImagePlus size={18} /> Thêm ảnh/video
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" multiple className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))} />
              </label>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-pgreen px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
            {files.length > 0 && <p className="mt-2 text-xs text-gray-500">Đã chọn {files.length} tệp: {files.map((file) => file.name).join(', ')}</p>}
          </form>
        )}

        {eligibility?.hasReviewed && <p className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">Bạn đã gửi đánh giá cho sản phẩm này.</p>}
        {!eligibility?.isLoggedIn && <p className="mb-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">Đăng nhập và mua sản phẩm để có thể đánh giá sau khi nhận hàng.</p>}
        {message && <p className="mb-6 text-sm text-gray-600">{message}</p>}

        {loading ? <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Đang tải đánh giá...</div> : reviews.length === 0 ? <p className="text-sm text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm.</p> : <div className="space-y-5">{reviews.map((review) => <article key={review.id} className="border-t border-gray-100 pt-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-pgreen/10 flex items-center justify-center overflow-hidden">{review.users.avatar ? <img src={review.users.avatar} alt="" className="w-full h-full object-cover" /> : <UserRound size={17} className="text-pgreen" />}</div><div><p className="font-semibold text-sm text-gray-900">{review.users.name}</p><p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p></div><div className="ml-auto flex">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={15} className={value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}</div></div><p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">{review.comment}</p>{review.mediaUrls.length > 0 && <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">{review.mediaUrls.map((url) => isVideo(url) ? <a key={url} href={url} target="_blank" rel="noreferrer" className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"><video src={url} muted className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-black/20"><Play size={24} className="text-white fill-white" /></span></a> : <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt="Ảnh người dùng đính kèm" className="aspect-square w-full rounded-xl object-cover" /></a>)}</div>}</article>)}</div>}
      </div>
    </section>
  );
}
