function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders `text`, marking every occurrence of the active search term so the
 * matched word stands out in the result row (UC8-MF-001).
 */
export default function HighlightedText({ text, query }) {
  const value = text == null ? '' : String(text);
  const term = (query || '').trim();

  if (!term) return value;

  const parts = value.split(new RegExp(`(${escapeRegExp(term)})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-emerald-400/30 px-0.5 text-emerald-200">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
