export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-8 animate-pulse">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="space-y-4">
        <div className="h-12 w-96 bg-gray-100 rounded-2xl mx-auto" />
        <div className="h-6 w-64 bg-gray-50 rounded-xl mx-auto" />
      </div>
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 pt-16">
        <div className="lg:col-span-2 space-y-16">
          <div className="aspect-video w-full rounded-[3rem] bg-gray-100" />
          <div className="space-y-8">
            <div className="h-8 w-48 bg-gray-100 rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-50 rounded" />
              <div className="h-4 w-full bg-gray-50 rounded" />
              <div className="h-4 w-2/3 bg-gray-50 rounded" />
            </div>
          </div>
        </div>
        <div className="h-[600px] bg-gray-100 rounded-[3rem]" />
      </div>
    </div>
  );
}
