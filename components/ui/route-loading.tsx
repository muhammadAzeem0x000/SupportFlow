interface RouteLoadingProps {
  label: string;
}

export function RouteLoading({ label }: RouteLoadingProps) {
  return (
    <section aria-busy="true" aria-label={`Loading ${label}`} className="animate-pulse">
      <span className="sr-only">Loading {label}…</span>
      <div className="border-b border-[#deded8] pb-6">
        <div className="h-3 w-24 bg-slate-200" />
        <div className="mt-4 h-8 w-64 max-w-3/4 bg-slate-300" />
        <div className="mt-3 h-4 w-80 max-w-full bg-slate-200" />
      </div>
      <div className="mt-7 border border-[#deded8] bg-white">
        <div className="flex items-center justify-between border-b border-[#deded8] px-5 py-4">
          <div className="h-4 w-28 bg-slate-300" />
          <div className="h-8 w-20 bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100 px-5">
          {["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5"].map(
            (width, index) => (
              <div key={index} className="flex items-center gap-5 py-5">
                <div className={`h-4 ${width} bg-slate-200`} />
                <div className="ml-auto h-5 w-16 shrink-0 bg-slate-100" />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
