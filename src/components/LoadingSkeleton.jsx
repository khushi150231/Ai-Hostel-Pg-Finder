const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-dark-800/60 rounded-2xl overflow-hidden border border-white/5 animate-pulse">
            <div className="h-52 bg-white/5" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-white/8 rounded-lg w-3/4" />
              <div className="h-4 bg-white/5 rounded-lg w-1/2" />
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-white/5 rounded-lg w-16" />
                <div className="h-6 bg-white/5 rounded-lg w-16" />
                <div className="h-6 bg-white/5 rounded-lg w-16" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-primary-800/30 rounded-lg w-24" />
                <div className="h-9 bg-white/5 rounded-xl w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-dark-800/60 rounded-2xl border border-white/5 p-5 flex gap-5 animate-pulse">
            <div className="w-48 h-36 bg-white/5 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 bg-white/8 rounded-lg w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/2" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 bg-white/5 rounded-lg w-14" />
                <div className="h-6 bg-white/5 rounded-lg w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-80 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-white/8 rounded-lg w-1/2" />
          <div className="h-4 bg-white/5 rounded-lg" />
          <div className="h-4 bg-white/5 rounded-lg w-5/6" />
          <div className="h-4 bg-white/5 rounded-lg w-4/5" />
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
