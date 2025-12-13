# Cursor Rules – Global Style

## General Code Style
- Prefer the simplest possible solution that is easy to read and maintain.
- Avoid clever or over-engineered patterns. Readability over "smart" code.
- Keep functions and components small and focused with a single responsibility.
- Prefer early returns instead of deeply nested conditionals.
- Use TypeScript strictly: avoid `any` unless absolutely necessary and justified.
- Use clear, descriptive names for components, functions and variables.

## React / Next.js Structure
- Use functional components only.
- Prefer server components where it makes sense, and client components only when needed for interactivity (state, event handlers, browser APIs).
- Keep page components (`page.tsx`) as thin as possible and delegate logic/UI to smaller components.
- Group related components in folders with an `index.tsx` or multiple small files, depending on complexity.
- Avoid prop drilling when it becomes noisy; consider simple context or local composition instead of global state libraries, unless really needed.

## Components and Reusability
- Extract reusable UI patterns to separate components (buttons, cards, layouts, etc.).
- Components should be focused and reusable, not monolithic.
- If a piece of JSX is reused or more than ~40–50 lines, consider extracting it into its own component.
- When adding new UI, think in terms of small composable building blocks.

## Styling and Tailwind
- Use Tailwind for styling by default.
- Use utility classes over custom CSS whenever practical.
- Do NOT hardcode hex colors directly in JSX, CSS or Tailwind classes.
- All colors must come from Tailwind config or CSS custom properties defined in `globals.css`.
- If a new color is needed, add it as a CSS variable or Tailwind color token instead of using inline hex values.
- Keep className strings reasonably short and structured; avoid chaotic class lists. Group spacing/layout/typography logically where possible.

## Layout and Structure
- Use semantic HTML elements (`main`, `header`, `section`, `nav`, `footer`) where relevant.
- Keep layout components simple and predictable. Avoid deeply nested wrappers unless necessary.
- Favor clarity over pixel-perfect micro-tweaks in code examples.

## Data & Logic
- Keep data-fetching and side effects close to where they are needed, but not mixed directly into presentational components.
- Use async server components or route handlers for data access when appropriate.
- Avoid unnecessary abstractions around fetching (no custom hooks / services unless it's needed).

## Error Handling & Edge Cases
- Handle common edge cases (loading, empty state, error) in a simple and clear way.
- Use small, focused UI states like "loading...", "ingen data", "noget gik galt" i stedet for komplekse flows.
- Do not silently ignore errors; at minimum log them or show a simple fallback.

---

# Cursor Rules – Comments

## Comment Style
- Comments must always be written in Danish.
- English technical terms (e.g. “auth”, “handler”, “routing”, “state”, “session”, “cache”) are allowed when they are the natural terms developers use.
- Comments should be used sparingly and only when they add clear value.
- Comments must be high-level and not verbose.

## Comments must NOT include
- No “Changed to…”, “Updated…”, “Refactored…”, or other commit-style notes.
- No line-by-line explanations or redundant descriptions of what the code already expresses.
- No fully English comments (only English technical vocabulary allowed).
- No obvious or filler comments.

## Appropriate use of comments
- To explain the *purpose* or *intention* behind a component, module, or larger code block.
- To clarify architectural decisions, edge cases, or important constraints.
- To give short contextual notes that help the reader understand *why* something exists.

## Tone and Length
- Short, concise, high-level.
- Typically 1–2 lines.
- Never descriptive of specific code changes.

## Examples (allowed)
- “// Håndterer auth-check for beskyttede sider”
- “// Genererer system prompt ud fra agentens settings”
- “// Simpelt embed-view til chat widget”

## Examples (not allowed)
- “// Changed logic in handler”
- “// Updated component layout”
- “// Fix for bug i useEffect”