<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

I like building complex things in the simplest way that works. Everything in this codebase must be concrete, verifiable, and free of speculative abstractions. Keep solutions minimal, direct, and well integrated with existing conventions.

## Writing style and communication

Write clear, well-structured paragraphs rather than bullet points. This preference applies across responses, documentation, commit messages, PR descriptions, and plans. Lists should be reserved strictly for genuine sequential instructions or tables of parallel facts. Never use em dashes anywhere in chat, comments, documentation, commit messages, or pull requests; use a comma or a full stop instead.

## Pull requests and git workflow

Commits, pushes, and pull requests are performed strictly on demand. Never initiate a commit or push unless explicitly requested.

When presenting or opening a pull request, follow these standards:
The title must be concise, readable, and explain why the change matters.
The PR description must open with a plain explanation of the problem drawn directly from the user's prompt or requirement, followed by a concise description of the solution.
Never lead with an inventory or laundry list of changed files and components.
Avoid bulleted changelogs, marketing language, hyperbole, and decorative emojis in descriptions. Keep the tone grounded, factual, and direct.
If subsequent commits land on an open pull request, review the title and description to verify they still accurately reflect the state of the branch, and update them if they have drifted.

For meaningful application code changes, run the repository review workflows to address standards and spec compliance before presenting a PR. Minor documentation, markdown adjustments, and trivial copy edits do not require review passes and can be handled directly.

## Development and code conventions

Never create, move, copy, read, or edit `.env` or `.env.local` files; only `.env.example` may be read and edited. Never use `grep`; always use `ripgrep` (`rg`).

In this project, use `bun`, `bunx`, and `bun run`. Keep external dependencies minimal. Access environment variables only through the configured T3 env schema and never through raw `process.env`. In TypeScript, prefer inferred types, avoid `any` and `unknown`, prefer `satisfies` over `as`, and use explicit literal or discriminated unions. Any client-side navigation must use `nextjs-toploader` (import `useRouter` from `nextjs-toploader/app`, never from `next/navigation`). When loading asynchronous data, display structured skeleton states instead of plain loading text. Mocks are enemies of the codebase. Once an endpoint is provided to replace a mocked one, remove every mock for that endpoint, everywhere it appears, because API integration means all data is live. If the codebase truly needs mocks or fallbacks, keep all of them in one dedicated top-level folder and never scatter pieces through components and files, so they can be found, changed, and cleaned up in one place. When a framework such as Next.js supports file imports, import binary assets directly into code as variables rather than placing them in the public folder to be fetched by URL. This confirms asset availability at build time and enables framework image optimizations.

