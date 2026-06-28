export function stripHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return String(html).replace(/<[^>]*>?/gm, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}
