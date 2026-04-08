import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full h-full">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center animate-pulse">
         <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">
        Đang tải...
      </p>
    </div>
  );
}
