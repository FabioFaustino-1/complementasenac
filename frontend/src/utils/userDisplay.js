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

export function formatCourseName(course, fallback = "") {
  if (course == null) return fallback;
  if (typeof course === "string") return course.trim() || fallback;
  if (Array.isArray(course)) {
    return course.map((item) => formatCourseName(item)).filter(Boolean).join(", ") || fallback;
  }
  if (typeof course === "object") {
    return (
      formatCourseName(course.nomeCurso) ||
      formatCourseName(course.nome_curso) ||
      formatCourseName(course.nome) ||
      formatCourseName(course.descricao) ||
      formatCourseName(course.curso) ||
      formatCourseName(course.idCurso) ||
      formatCourseName(course.id_curso) ||
      formatCourseName(course.id) ||
      fallback
    );
  }
  return String(course).trim() || fallback;
}

export function formatDisplayText(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => formatDisplayText(item)).filter(Boolean).join(", ") || fallback;
  }
  if (typeof value === "object") {
    return (
      formatDisplayText(value.nome) ||
      formatDisplayText(value.name) ||
      formatDisplayText(value.titulo) ||
      formatDisplayText(value.title) ||
      formatDisplayText(value.email) ||
      formatDisplayText(value.id) ||
      fallback
    );
  }
  return String(value).trim() || fallback;
}
