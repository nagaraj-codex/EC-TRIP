export function formatOperatingHours(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

  const sections: string[] = [];
  for (const [sectionName, sectionValue] of Object.entries(value)) {
    if (sectionName === "notes") continue;
    if (typeof sectionValue === "string") {
      sections.push(`${formatLabel(sectionName)}: ${sectionValue}`);
      continue;
    }
    if (typeof sectionValue === "object" && sectionValue !== null && !Array.isArray(sectionValue)) {
      const schedule = Object.entries(sectionValue)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .map(([day, hours]) => `${formatLabel(day)}: ${hours}`)
        .join("; ");
      if (schedule) sections.push(`${formatLabel(sectionName)}: ${schedule}`);
    }
  }
  return sections.length > 0 ? sections.join(" · ") : null;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
