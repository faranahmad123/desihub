export default function ProductSkeleton() {
  return (
    <div className="card flex flex-col">
      <div className="aspect-square w-full skeleton" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/3" />
        <div className="h-3 skeleton w-full" />
        <div className="h-6 skeleton w-1/2 mt-2" />
        <div className="h-10 skeleton w-full mt-1 rounded-xl" />
      </div>
    </div>
  );
}
