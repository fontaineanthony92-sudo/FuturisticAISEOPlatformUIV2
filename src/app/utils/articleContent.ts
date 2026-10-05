export interface ArticleSection {
  id: string;
  type: "intro" | "section";
  heading: string;
  body: string;
}

/** Convertit le Markdown d'un article en sections modifiables dans l'éditeur. */
export function contentToSections(content: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  const blocks = content.split(/\r?\n\s*\r?\n/).map(block => block.trim()).filter(Boolean);
  let activeSection: ArticleSection | null = null;

  for (const block of blocks) {
    const heading = block.match(/^##\s+(.+)$/);
    if (heading) {
      activeSection = {
        id: `section-${sections.length + 1}`,
        type: "section",
        heading: heading[1].trim(),
        body: "",
      };
      sections.push(activeSection);
      continue;
    }

    if (activeSection) {
      activeSection.body = activeSection.body ? `${activeSection.body}\n\n${block}` : block;
    } else {
      const intro = sections.find(section => section.type === "intro");
      if (intro) intro.body += `\n\n${block}`;
      else sections.unshift({ id: "intro", type: "intro", heading: "", body: block });
    }
  }

  return sections.length ? sections : [{ id: "intro", type: "intro", heading: "", body: content.trim() }];
}

/** Reconstruit le Markdown sauvegardé depuis les sections de l'éditeur. */
export function sectionsToContent(sections: ArticleSection[]): string {
  return sections.map(section => {
    const heading = section.type === "section" && section.heading.trim()
      ? `## ${section.heading.trim()}\n\n`
      : "";
    return `${heading}${section.body.trim()}`;
  }).filter(Boolean).join("\n\n");
}
