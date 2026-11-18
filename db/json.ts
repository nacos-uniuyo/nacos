import { z } from "zod";

/**
 * Shapes for every jsonb column in db/schema.ts. Each one is a concrete zod
 * schema rather than a loose record, so a malformed value fails at the write
 * boundary and the column type in queries tells us what the UI will receive.
 */

export type RichTextMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "link"; attrs: { href: string } };

export type RichTextNode =
  | { type: "text"; text: string; marks?: RichTextMark[] }
  | { type: "paragraph"; content?: RichTextNode[] }
  | { type: "heading"; attrs: { level: 1 | 2 | 3 | 4 }; content?: RichTextNode[] }
  | { type: "bulletList"; content: RichTextNode[] }
  | { type: "orderedList"; content: RichTextNode[] }
  | { type: "listItem"; content: RichTextNode[] }
  | { type: "blockquote"; content: RichTextNode[] }
  | { type: "codeBlock"; attrs?: { language?: string }; content?: RichTextNode[] }
  | { type: "horizontalRule" }
  | { type: "hardBreak" }
  | { type: "image"; attrs: { src: string; alt?: string; title?: string } };

const markSchema: z.ZodType<RichTextMark> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("underline") }),
  z.object({ type: z.literal("strike") }),
  z.object({ type: z.literal("code") }),
  z.object({ type: z.literal("link"), attrs: z.object({ href: z.string() }) }),
]);

const nodeSchema: z.ZodType<RichTextNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("text"),
      text: z.string(),
      marks: z.array(markSchema).optional(),
    }),
    z.object({ type: z.literal("paragraph"), content: z.array(nodeSchema).optional() }),
    z.object({
      type: z.literal("heading"),
      attrs: z.object({ level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) }),
      content: z.array(nodeSchema).optional(),
    }),
    z.object({ type: z.literal("bulletList"), content: z.array(nodeSchema) }),
    z.object({ type: z.literal("orderedList"), content: z.array(nodeSchema) }),
    z.object({ type: z.literal("listItem"), content: z.array(nodeSchema) }),
    z.object({ type: z.literal("blockquote"), content: z.array(nodeSchema) }),
    z.object({
      type: z.literal("codeBlock"),
      attrs: z.object({ language: z.string().optional() }).optional(),
      content: z.array(nodeSchema).optional(),
    }),
    z.object({ type: z.literal("horizontalRule") }),
    z.object({ type: z.literal("hardBreak") }),
    z.object({
      type: z.literal("image"),
      attrs: z.object({ src: z.string(), alt: z.string().optional(), title: z.string().optional() }),
    }),
  ]),
);

export const richTextDoc = z.object({
  type: z.literal("doc"),
  content: z.array(nodeSchema),
});

export const socialLinks = z.object({
  linkedin: z.url().optional(),
  github: z.url().optional(),
  x: z.url().optional(),
  portfolio: z.url().optional(),
});

export const leadContributor = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  github: z.url().optional(),
  linkedin: z.url().optional(),
});

export const agendaItem = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  speaker: z.string().optional(),
  venue: z.string().optional(),
});

export const guestAuthor = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  photoUrl: z.string().optional(),
});

/** One member per platform_setting key, added as settings appear. */
export const platformSettingValue = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("deans_message"),
    heading: z.string().min(1),
    body: z.string().min(1),
    authorName: z.string().min(1),
    authorTitle: z.string().min(1),
  }),
]);

export type RichTextDoc = z.infer<typeof richTextDoc>;
export type SocialLinks = z.infer<typeof socialLinks>;
export type LeadContributor = z.infer<typeof leadContributor>;
export type AgendaItem = z.infer<typeof agendaItem>;
export type GuestAuthor = z.infer<typeof guestAuthor>;
export type PlatformSettingValue = z.infer<typeof platformSettingValue>;
