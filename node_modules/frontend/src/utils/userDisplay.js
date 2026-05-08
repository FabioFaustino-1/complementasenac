export function formatDisplayName(name) {
  if (!name || !name.trim()) return "";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function deriveDisplayName({ name, email, fallback = "Usuario" }) {
  const normalizedName = formatDisplayName(name);
  if (normalizedName) return normalizedName;

  if (email && email.trim()) {
    const localPart = email.trim().split("@")[0].replace(/[._-]+/g, " ");
    const normalizedEmailName = formatDisplayName(localPart);
    if (normalizedEmailName) return normalizedEmailName;
  }

  return fallback;
}

export function buildGreeting(name) {
  return `Ol\u00E1, ${name}`;
}
