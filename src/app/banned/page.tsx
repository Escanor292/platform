import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Ban, Mail } from "lucide-react";
import Link from "next/link";

export default async function BannedPage() {
    const session = await auth();

    // Nếu không bị banned thì redirect về home
    if (!session?.user || (session.user as any).status !== "BANNED") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-lg p-12 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ban size={40} className="text-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-black text-gray-900 mb-4">
                        Tài khoản bị tạm khóa
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-8">
                        Tài khoản của bạn đã bị tạm khóa do vi phạm điều khoản sử dụng.
                        Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm chi tiết.
                    </p>

                    {/* Contact Button */}
                    <Link
                        href="mailto:support@crowdfunding.vn"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                        <Mail size={20} />
                        Liên hệ hỗ trợ
                    </Link>

                    {/* User Info */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            <div>Email: {session.user.email}</div>
                            <div>Tên: {session.user.name}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
