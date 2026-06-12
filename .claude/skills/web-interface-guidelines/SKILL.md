---
name: web-interface-guidelines
description: Audit and build UI against the Vercel Web Interface Guidelines — accessibility, focus states, forms, animation, typography, performance, theming and UX correctness. Use when reviewing UI code, building new components/pages, or checking a screen against frontend best practices.
metadata:
  source: https://github.com/vercel-labs/web-interface-guidelines
  author: Vercel Labs (vendored)
  version: "1.0.0"
---

# Web Interface Guidelines (Vercel)

The complete ruleset — 100+ rules across Accessibility, Focus, Forms, Animation, Typography,
Content Handling, Images, Performance, Navigation & State, Touch, Safe Areas, Dark Mode,
i18n and Hydration — lives in **[guidelines.md](guidelines.md)**. Read it before auditing or
building non-trivial UI.

## When BUILDING UI
Apply the rules proactively. The non-negotiables for this project:
- Icon-only buttons → `aria-label`; every input → a real `<label>` (`htmlFor`).
- Visible `focus-visible:ring-*`; never `outline-none` without a replacement.
- Animate only `transform`/`opacity`; honor `prefers-reduced-motion`; never `transition: all`.
- Real ellipsis `…` (not `...`), curly quotes, `tabular-nums` for number columns.
- Handle empty / loading / very-long-content; flex children need `min-w-0` to truncate.
- Destructive actions (delete) need a confirm or undo window — never immediate.
- Submit stays enabled until the request starts; spinner + `…` during the request.

## When AUDITING UI
1. Read the target files.
2. Check against every rule in [guidelines.md](guidelines.md).
3. Output terse `file:line` findings grouped by file (format is at the bottom of guidelines.md).
   High signal-to-noise, no preamble.

To refresh the rules from upstream before an audit:
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`

---
_Vendored from [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines). Pairs with the `yourmkt-design` skill (the taste + design-system layer for this app)._
