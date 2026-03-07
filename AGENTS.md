# Agent guidelines for Land & Crafts

## Project overview

- **Stack**: Deno + Astro
- **Output**: Static site (Deno Deploy)

## Commands

- **Dev**: `deno task dev`
- **Build**: `deno task build`
- **Test**: `deno task test` (Playwright)

## Code standards

- **Formatting/Linting**: Ensure `deno fmt` and `deno lint` pass.
- **TypeScript**: Strict mode. Explicit types preferred.
- **CSS**: Use Astro scoped styles, native nesting, and `dvh` units.

### Naming conventions

| Element          | Convention | Example                       |
| :--------------- | :--------- | :---------------------------- |
| TS Files         | kebab-case | `client.ts`                   |
| Components       | PascalCase | `ProjectCard.astro`           |
| Custom Elements  | kebab-case | `<project-card>`              |
| Variables        | camelCase  | `projectCoordinates`          |
| CSS Classes/Vars | kebab-case | `.project-card`, `--bg-color` |

## Architecture

- **Client State**: Use vanilla Custom Elements (`HTMLElement`).
- **Communication**: Use the global `eventBus` (from `client.ts`) for events.
- **Content**: Project data is in `src/data/projects/`.

### Key logic

**Responsive Map Zoom:**

```typescript
const getZoom = (w = window?.visualViewport?.width ?? window.innerWidth) =>
    Math.max(3, Math.min(5, Math.floor((w - 100) / 350) + 3));
```

## Git

- Use conventional commits (`feat:`, `fix:`).

## Documentation and comments

Use sentence case for all headings (e.g., 'How to install the project', NOT 'How To Install The Project').
