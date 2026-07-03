# Commit messages

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <concise summary in imperative mood>

<optional body explaining why, if it's not obvious from the diff>
```

- **type** is one of: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`,
  `style` (formatting only, no logic change), `perf`.
- Summary line: imperative mood ("add", "fix", "move", not "added"/
  "adds"), no trailing period, ideally under ~70 characters.
- Keep the summary concise — it should describe *what* changed. Save
  *why* for the body, and only include a body when the reasoning isn't
  already obvious from the diff itself.
- One logical change per commit. If a change touches both a feature and
  an unrelated cleanup, split it into two commits.

Examples:

```
feat: add check and checkmate detection
```

```
fix: correct pawn double-step target square for white

The two-square advance was writing to y-2 instead of y+2, a copy-paste
leftover from the black branch.
```
