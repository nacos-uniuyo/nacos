import type { ReactNode } from "react";
import { type RichTextDoc, type RichTextMark, type RichTextNode, richTextDoc } from "@/db/json";
import { cn } from "@/lib/utils";

/**
 * Normalizes a RichTextDoc AST or plain string into a validated TipTap RichTextDoc.
 */
export function toRichTextDoc(input: RichTextDoc | string | null | undefined): RichTextDoc {
  if (!input) {
    return { type: "doc", content: [] };
  }

  if (typeof input === "string") {
    const paragraphs = input
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return {
      type: "doc",
      content: paragraphs.map((text) => ({
        type: "paragraph" as const,
        content: [{ type: "text" as const, text }],
      })),
    };
  }

  const parsed = richTextDoc.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }

  return { type: "doc", content: [] };
}

function extractNodeText(node: RichTextNode): string {
  switch (node.type) {
    case "text":
      return node.text;
    case "hardBreak":
      return "\n";
    case "paragraph":
    case "heading":
    case "codeBlock":
      return (node.content?.map(extractNodeText).join("") ?? "") + "\n\n";
    case "bulletList":
    case "orderedList":
    case "listItem":
    case "blockquote":
      return node.content.map(extractNodeText).join("");
    default:
      return "";
  }
}

export function richTextToPlainText(doc: RichTextDoc | string | null | undefined): string {
  if (!doc) return "";
  if (typeof doc === "string") return doc;
  return doc.content.map(extractNodeText).join("").trim();
}

function applyMarks(text: string, marks?: RichTextMark[], keyPrefix = "mark"): ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  return marks.reduce<ReactNode>((acc, mark, idx) => {
    const key = `${keyPrefix}-${mark.type}-${idx}`;
    switch (mark.type) {
      case "bold":
        return <strong key={key} className="font-semibold text-current">{acc}</strong>;
      case "italic":
        return <em key={key} className="italic">{acc}</em>;
      case "underline":
        return <u key={key} className="underline underline-offset-4">{acc}</u>;
      case "strike":
        return <s key={key} className="line-through">{acc}</s>;
      case "code":
        return (
          <code
            key={key}
            className="rounded bg-[var(--sand)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--forest)]"
          >
            {acc}
          </code>
        );
      case "link": {
        const href = mark.attrs.href;
        const isSafeHref =
          href.startsWith("https://") ||
          href.startsWith("http://") ||
          href.startsWith("mailto:") ||
          href.startsWith("/");
        if (!isSafeHref) return acc;
        const isExternal = href.startsWith("http://") || href.startsWith("https://");
        return (
          <a
            key={key}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-medium text-[var(--green)] underline underline-offset-4 transition-colors hover:text-[var(--green-hover)]"
          >
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: RichTextNode, index: number, path = "rt"): ReactNode {
  const key = `${path}-${node.type}-${index}`;

  switch (node.type) {
    case "text":
      return <span key={key}>{applyMarks(node.text, node.marks, key)}</span>;

    case "paragraph":
      return (
        <p key={key} className="leading-relaxed">
          {node.content?.map((child, i) => renderNode(child, i, key))}
        </p>
      );

    case "heading": {
      const children = node.content?.map((child, i) => renderNode(child, i, key));
      switch (node.attrs.level) {
        case 1:
          return (
            <h1 key={key} className="serif text-3xl leading-tight font-normal">
              {children}
            </h1>
          );
        case 2:
          return (
            <h2 key={key} className="serif text-2xl leading-tight font-normal">
              {children}
            </h2>
          );
        case 3:
          return (
            <h3 key={key} className="serif text-xl leading-snug font-normal">
              {children}
            </h3>
          );
        case 4:
          return (
            <h4 key={key} className="text-base leading-snug font-semibold">
              {children}
            </h4>
          );
      }
      break;
    }

    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-1.5 pl-5">
          {node.content.map((child, i) => renderNode(child, i, key))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-1.5 pl-5">
          {node.content.map((child, i) => renderNode(child, i, key))}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="leading-relaxed">
          {node.content.map((child, i) => renderNode(child, i, key))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-2 border-[var(--gold)] pl-4 sm:pl-6 py-2 my-6 text-[clamp(18px,2vw,24px)] leading-relaxed text-[var(--ink)] opacity-95 w-full max-w-none"
        >
          {node.content.map((child, i) => renderNode(child, i, key))}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          data-language={node.attrs?.language}
          className="overflow-x-auto rounded-xl bg-[var(--forest)] p-4 font-mono text-sm text-[var(--mint-3)]"
        >
          <code>{node.content?.map((child, i) => renderNode(child, i, key))}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={key} className="my-4 border-t border-[var(--rule)]" />;

    case "hardBreak":
      return <br key={key} />;

    case "image":
      return (
        <figure key={key} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.attrs.src}
            alt={node.attrs.alt ?? ""}
            title={node.attrs.title}
            className="w-full h-auto rounded-[16px] border border-[rgba(15,26,19,0.1)] shadow-sm object-cover"
            loading="lazy"
          />
          {node.attrs.title || node.attrs.alt ? (
            <figcaption className="mt-2.5 text-center text-xs sm:text-sm text-[var(--muted)]">
              {node.attrs.title ?? node.attrs.alt}
            </figcaption>
          ) : null}
        </figure>
      );

    default:
      return null;
  }
}

export interface RichTextRendererProps {
  doc: RichTextDoc | string | null | undefined;
  className?: string;
}

/**
 * Safely renders a TipTap RichTextDoc AST (from db/json.ts) as React elements
 * without ever using dangerouslySetInnerHTML.
 */
export function RichTextRenderer({ doc, className }: RichTextRendererProps) {
  const ast = toRichTextDoc(doc);

  if (ast.content.length === 0) {
    return null;
  }

  return (
    <div className={cn("rich-text space-y-3", className)}>
      {ast.content.map((node, index) => renderNode(node, index))}
    </div>
  );
}
