export function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-card">
      <div className="skeleton h-56 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-5 w-28 rounded-full" />
          <div className="skeleton h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}
