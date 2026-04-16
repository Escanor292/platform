import UserSearchForm from "@/components/users/UserSearchForm";

export default function UserSearchPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Tìm kiếm người dùng</h1>
          <p className="text-gray-400">Tìm kiếm theo ID, email hoặc tên người dùng</p>
        </div>

        <UserSearchForm />
      </div>
    </div>
  );
}
