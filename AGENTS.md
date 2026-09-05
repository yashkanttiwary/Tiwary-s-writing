# AI Agent Operating Guidelines for Tiwary's Writing Archive

You are an AI assistant helping Yash Kant Tiwary manage this literary archive. Your primary goal is to **seamlessly insert, organize, and format new writing** (poems, stories, fragments, dialogues, essays) into the repository without altering the core system architecture, unless explicitly requested.

This is a **READ-ONLY website for visitors**; the user manages the content via this codebase. **Do NOT generate mock data.**

## 1. Directory Structure Rule

All writings **MUST** be placed in the `content/writings/[YYYY]/[MM]/` directory based on the date of publication or creation.
- Example: If a poem was written in March 2024, its path should be `content/writings/2024/03/poem-slug.md`.
- Create the year `[YYYY]` and month `[MM]` folders if they do not exist. Use two digits for the month (e.g., `03`).

## 2. Frontmatter Formatting (YAML)

Every markdown file must begin with valid YAML frontmatter that matches the Zod schema defined in `lib/content.ts`.

### Required Fields:
- `id`: A unique string (e.g., UUID or unique semantic string).
- `slug`: URL-friendly string (e.g., `the-silent-rain`). Must match the filename (without `.md`).
- `publishedAt`: ISO 8601 Date string (e.g., `2024-03-15T12:00:00Z`).
- `type`: Must be exactly one of: `poetry`, `prose`, `story`, `essay`, `letter`, `fragment`, `experimental`.

### Optional/Recommended Fields:
- `title`: The title of the piece. (Omit if it is an untitled fragment).
- `language`: `en` (default) or `hi` (Hindi).
- `tags`: List of strings (e.g., `["nature", "loss"]`).
- `themes`: List of strings.
- `collections`: List of strings indicating which collection or series the piece belongs to. This makes migration easy.
- `excerpt`: A 1-2 sentence preview.
- `featured`: `true` or `false`.
- `draft`: `true` or `false`.
- `presentation`: Optional styling overrides.
  - `profile`: `poetry`, `prose`, `story`, `essay`, `letter`, `fragment`, `experimental`
  - `alignment`: `left`, `center`, `right`
  - `measure`: `narrow`, `standard`, `wide`, `book`
  - `density`: `compact`, `comfortable`, `spacious`

### Example Frontmatter:

```yaml
---
id: "poem-the-silent-rain-2024"
title: "The Silent Rain"
slug: "the-silent-rain"
publishedAt: "2024-03-15T00:00:00Z"
type: "poetry"
language: "en"
tags: ["rain", "silence", "memory"]
collections: ["Early Works"]
excerpt: "A poem about the silence that follows a heavy rain."
presentation:
  profile: "poetry"
  alignment: "left"
---
```

## 3. Formatting the Content

- For **Poetry**: Use standard markdown line breaks. Stanzas should be separated by a blank line. If specific indentation is needed, use HTML spaces (`&nbsp;`) or blockquotes (`>`).
- For **Prose / Stories**: Use standard paragraphs.
- For **Dialogues**: Use standard markdown `**Speaker:** Dialogue` or blockquotes to denote speakers.
- For **Hindi Text**: Set `language: "hi"` in the frontmatter. The global CSS and layout (`Noto Serif Devanagari`) will automatically apply the correct typography.

## 4. Omissions, Faults, and Edits
If the user provides you with a poem and their "omissions and faults," use your analytical capabilities to gently format or fix the poem *before* saving it, but always preserve the core emotional tone and meaning. If the user asks you to literally insert the poem, do it exactly as instructed without changing their words.

## 5. Do Not Touch the Core Logic
- Do not modify `lib/content.ts`, `app/page.tsx`, or other core UI/logic files unless the user explicitly requests a feature change. 
- Your main job when given a new poem is to create the corresponding `.md` file in the correct chronological folder.

## 6. Migration and Organization
Always use the `collections` array in the frontmatter to group related writings. If the user mentions a specific book or collection concept (e.g., "This is part of my 'Midnight' collection"), add `collections: ["Midnight"]`. This ensures future migrations or category pages can easily query the content by collection.

## 7. SEO, Metadata, and Machine-Readability (CRITICAL)
This archive is designed as a fully open, machine-readable, and SEO-optimized literary repository. The YAML frontmatter you write is the **single source of truth** that automatically powers:
- Canonical HTML URLs and Open Graph tags.
- Schema.org JSON-LD (CreativeWork).
- The `sitemap.xml` and RSS/JSON feeds.
- The public read-only API (`/api/v1/writings`) and Markdown representations.
- The IndexNow protocol.

**When adding or modifying a writing, you MUST follow these SEO and archival rules:**
1. **Permanent Identity**: The `id` must be a stable string that never changes. The `slug` dictates the permanent canonical URL (`/writing/[year]/[slug]`). Do not change slugs unless explicitly requested, as it breaks inbound links.
2. **Accurate Excerpts**: You MUST provide an `excerpt` in the frontmatter. If the user does not provide one, derive it deterministically from the first 1-2 lines of the poem or the first sentence of the prose. **NEVER hallucinate, editorialize, or write "SEO-optimized" summaries** that invent meaning not found in the original text.
3. **Pristine Content**: Do not place algorithmic keywords or hidden SEO text in the markdown body. The human literary reading experience must remain entirely untouched. The infrastructure handles all the machine-readability invisibly.
4. **Publishing Triggers**: When you successfully add or update a writing, if you are able to execute commands, you may conceptually trigger the IndexNow ping (or just know that the system will automatically include it in the sitemaps/feeds instantly).

## 8. File Creation Path Safety (CRITICAL)
Always use the exact workspace relative path when creating files (e.g., `content/writings/2026/09/slug.md`). **NEVER duplicate the `/app/applet/` path** (e.g., do NOT write `app/applet/content/...` or `/app/applet/app/applet/...`). This causes the entry to be invisible to the Next.js server. After creating a file, verify its existence at the correct path. If a user says they cannot see the file, always check if you accidentally nested it incorrectly.

## 9. Handling Markdown Elements & Hydration Errors
When formatting writings, use standard markdown elements like headings (`###`), blockquotes (`>`), and lists (`-`). The system's ReactMarkdown renderer natively handles these blocks. Do NOT try to invent your own nested structures or wrap them incorrectly.
