export default function isArabic(text) {
  if (!text) return false;
  // Check for common Arabic Unicode ranges
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    String(text),
  );
}
