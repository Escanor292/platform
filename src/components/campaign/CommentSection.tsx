"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, User, Trash2, Heart } from "lucide-react";
import { formatFullDateTime } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  campaignId: string;
  slug: string;
}

export default function CommentSection({ campaignId, slug }: CommentSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/campaigns/${slug}/reviews`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !imageUrl) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: newComment,
          imageUrl,
          rating: 5
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReviews([data, ...reviews]);
        setNewComment("");
        setImageUrl("");
      } else {
        alert(data.error || "Lỗi khi gửi bình luận");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Form gửi bình luận */}
      {session ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-soft">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={24} />
            Chia sẻ cảm nghĩ của bạn
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              className="w-full min-h-[120px] p-6 bg-gray-50 border-0 rounded-[1.8rem] focus:ring-2 focus:ring-blue-600 text-gray-900 font-medium placeholder:text-gray-400 leading-relaxed"
              placeholder="Bạn nghĩ gì về dự án này? Đừng quên gửi lời khích lệ nhé!"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
               <ImageUpload 
                  label="Đính kèm ảnh (Tùy chọn)"
                  value={imageUrl}
                  onChange={setImageUrl}
               />
               <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading || (!newComment.trim() && !imageUrl)}
                    className="h-16 px-10 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition flex items-center gap-2 shadow-lg active:scale-95"
                  >
                    <Send size={20} />
                    Gửi bình luận
                  </Button>
               </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] text-center">
           <p className="text-gray-500 font-black uppercase tracking-widest text-xs mb-4">Vui lòng đăng nhập để tham gia thảo luận</p>
           <Button variant="outline" className="rounded-full px-8 font-black" onClick={() => window.location.href='/auth/login'}>Đăng nhập ngay</Button>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="space-y-8">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">
          Tất cả thảo luận ({reviews.length})
        </h3>
        
        {fetching ? (
          <div className="py-12 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải dữ liệu...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-10">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-6 group animate-fade-in-up">
                <div className="flex-shrink-0">
                   <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg">
                      {review.user?.name?.slice(0,1) || <User />}
                   </div>
                </div>
                <div className="flex-grow space-y-4 pt-1">
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{review.user?.name || "Người dùng"}</span>
                         <span className="text-[10px] text-gray-400 font-bold">{formatFullDateTime(review.createdAt)}</span>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 text-gray-300 hover:text-red-500 transition"><Heart size={16}/></button>
                      </div>
                   </div>
                   <p className="text-gray-600 font-medium leading-relaxed bg-white border border-gray-50 p-6 rounded-[1.8rem] shadow-sm">
                      {review.comment}
                   </p>
                   {review.imageUrl && (
                      <div className="relative w-full max-w-sm h-64 overflow-hidden rounded-[1.8rem] border border-gray-100 shadow-soft">
                         <img src={review.imageUrl} alt="Review attachment" className="w-full h-full object-cover" />
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
             <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
             <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  );
}
