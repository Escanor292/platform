import UserSearchForm from "@/components/users/UserSearchForm";

export default function UserSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <UserSearchForm />
      </div>
    </div>
  );
}
