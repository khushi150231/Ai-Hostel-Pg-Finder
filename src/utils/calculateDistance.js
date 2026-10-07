/**
 * Calculate distance between two lat/lng coordinates in km (Haversine formula)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // round to 1 decimal
};

const toRad = (value) => (value * Math.PI) / 180;

export const formatDistance = (km) => {
  if (km === null || km === undefined) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km} km`;
};

export const COLLEGE_COORDS = {
  parul: { lat: 22.2965, lng: 73.0169, label: 'Parul University' },
  ms: { lat: 22.3225, lng: 73.1860, label: 'MS University' },
  itm: { lat: 22.3561, lng: 73.1928, label: 'ITM Universe' },
  vadodara_center: { lat: 22.3072, lng: 73.1812, label: 'Vadodara City' },
};
