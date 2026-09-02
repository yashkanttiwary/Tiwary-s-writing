# Tiwary's Writing Archive

A living literary archive designed for reading and preserving Yash Kant Tiwary's words.

## Project Philosophy
This is a **read-only** website designed for visitors to experience poems, stories, fragments, and dialogues without distraction. The archive does not include a CMS or writing tools in the browser. All content is managed through standard Markdown files and committed to the repository.

## Content Management Rules (For Authors & AI Agents)

To insert new poems, stories, or fragments, follow these strict integration rules to maintain the integrity and seamlessness of the website:

### 1. File Placement
All writings must be stored in the `content/writings/` directory, organized strictly by the year and month of their publication or creation.
Format: `content/writings/[YYYY]/[MM]/[slug].md`

*Example:* A poem written in January 2026 goes into `content/writings/2026/01/my-poem.md`.

### 2. Frontmatter Schema
Every Markdown file must contain YAML frontmatter at the very top. The system relies on this metadata for categorization, typography, and sorting.

```yaml
---
id: "unique-identifier"             # UUID or unique string (required)
title: "Title of the Piece"         # String (optional, omit for fragments)
slug: "title-of-the-piece"          # Must match the filename (required)
publishedAt: "2026-01-01T12:00:00Z" # ISO Date (required)
type: "poetry"                      # 'poetry', 'prose', 'story', 'essay', 'letter', 'fragment', 'experimental' (required)
language: "en"                      # 'en' or 'hi' (Hindi automatically gets Devanagari font)
tags: ["love", "grief"]             # Array of strings
themes: ["existentialism"]          # Array of strings
collections: ["Book One"]           # Used to group writings for easy future migration
excerpt: "A short preview."         # Optional
featured: false                     # Set to true to highlight on the homepage
draft: false                        # Set to true to hide from production
presentation:                       # Optional styling configuration for the Reading Mode
  profile: "poetry"
  alignment: "left"
---
```

### 3. Inserting Content
- **Formatting:** Keep poems structured with standard single line breaks. Leave a blank line between stanzas. 
- **Collections for Migration:** By consistently tagging `collections: ["Name of Collection"]`, exporting or migrating specific books/volumes in the future becomes trivial.
- **Hindi Typography:** Simply adding `language: "hi"` in the frontmatter instructs the renderer to wrap the content in the `Noto Serif Devanagari` font. No additional CSS is needed.

### 4. AI Prompting Guide
If using an AI (like Google AI Studio) to insert new writings, simply paste your poem and say:
> *"Insert this new poem into the archive. Here are my omissions and faults... [paste poem]."*

The AI is instructed (via `AGENTS.md`) to read these rules, format the Markdown correctly, fix the noted faults while preserving your voice, and place the file in the exact correct folder without altering the website's code.

---

## Technical Stack
- Next.js 15 (App Router)
- React, Tailwind CSS
- Framer Motion (for subtle transitions)
- `gray-matter` and `zod` for content validation
