import { Star } from 'lucide-react';

const Rating = ({ value, count, size = 'sm', showCount = true }) => {
  const stars = 5;
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(value)
                ? 'fill-amber-400 text-amber-400'
                : i < value
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-white/10 text-white/20'
            }`}
          />
        ))}
      </div>
      <span className={`font-semibold text-amber-400 ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}>
        {value?.toFixed(1)}
      </span>
      {showCount && count && (
        <span className={`text-gray-500 ${size === 'xs' ? 'text-xs' : 'text-sm'}`}>({count})</span>
      )}
    </div>
  );
};

export default Rating;
