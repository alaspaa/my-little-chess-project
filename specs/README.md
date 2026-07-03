# Specs

Living documentation for this project. Unlike a one-off design doc, these
files describe how the codebase actually works today and should be updated
whenever a change makes them inaccurate — they are meant to be read by
Claude (and humans) as project context before making changes.

- [code-style.md](code-style.md) — naming, file layout, formatting,
  readability, and testability conventions.
- [architecture.md](architecture.md) — how the app is structured: state
  management, the validation pipeline, and page/view switching.
- [commit-messages.md](commit-messages.md) — commit message format
  (Conventional Commits).

When you add a pattern that isn't covered here, or change one that is,
update the relevant spec in the same PR/commit as the code change.
