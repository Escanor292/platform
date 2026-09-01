import UserSearchForm from "@/components/users/UserSearchForm";

export default function UserSearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative overflow-hidden px-6 pt-28 pb-16 md:pt-32 md:pb-20"
        style={{
          background: "linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 50%, #F8F7F2 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-10 h-80 w-80 rounded-full bg-gradient-to-br from-pgreen/20 via-pgreen/8 to-transparent blur-3xl opacity-70" />
          <div className="absolute right-[8%] top-32 h-80 w-80 rounded-full bg-gradient-to-tl from-tblue/15 via-transparent to-transparent blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/55 px-5 py-2.5 text-xs font-bold text-pgreen shadow-lg backdrop-blur-md">
            Kết nối cộng đồng
          </div>
          <h1 className="font-display mb-5 font-black text-4xl text-dblue md:text-5xl lg:text-6xl">
            Tìm người <span className="bg-gradient-to-r from-pgreen via-fgreen to-tblue bg-clip-text text-transparent">đồng hành</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
            Tìm creator, backer hoặc thành viên đã đồng hành cùng chiến dịch trên TửTế Fund.
          </p>

          <UserSearchForm />
        </div>
      </section>
    </div>
  );
}
