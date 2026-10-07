export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.replace(/[\s-()+]/g, '');
  return clean.length >= 10 && clean.length <= 13;
};

export const isValidCoordinates = (lat, lng) => {
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
};

export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};
