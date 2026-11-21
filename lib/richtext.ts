import type { RichTextDoc, RichTextNode } from "@/db/json";

/**
 * Converts a plain-text or multi-line string into a valid TipTap JSON AST
 * conforming to `RichTextDoc`.
 */
export function textToRichTextDoc(text: string): RichTextDoc {
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: text.trim() || "No description provided." }],
        },
      ],
    };
  }

  const content: RichTextNode[] = paragraphs.map((p) => ({
    type: "paragraph",
    content: [{ type: "text", text: p }],
  }));

  return {
    type: "doc",
    content,
  };
}

/**
 * Extracts plain text from a `RichTextDoc` for editing in standard inputs/textareas.
 */
export function richTextDocToText(doc: RichTextDoc | null | undefined): string {
  if (!doc || !Array.isArray(doc.content)) return "";

  return doc.content
    .map((node) => {
      if (node.type === "paragraph" && Array.isArray(node.content)) {
        return node.content
          .filter((n) => n.type === "text" && typeof n.text === "string")
          .map((n) => (n as { text: string }).text)
          .join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}
