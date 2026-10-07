export const formatPrice = (price) => {
  if (!price && price !== 0) return '—';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export const formatPriceRange = (min, max) => {
  if (!min && !max) return '—';
  if (!max) return `${formatPrice(min)}+`;
  return `${formatPrice(min)} – ${formatPrice(max)}`;
};

export const formatPricePerMonth = (price) => {
  return `${formatPrice(price)}/mo`;
};
