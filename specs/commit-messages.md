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
- Default to a summary line only, no body. Most commits in this project
  don't need one — git history + the diff itself are the detailed
  record; the commit message doesn't need to re-derive or restate it.
- Only add a body when the summary line genuinely isn't enough to know
  why the commit exists (a non-obvious bug fix, a reason a reviewer
  couldn't guess from the diff). When you do, keep it to one short,
  loose sentence — not a itemized rundown of every file/mechanism
  touched.
- One logical change per commit. If a change touches both a feature and
  an unrelated cleanup, split it into two commits.

Examples:

```
feat: add check and checkmate detection
```

```
fix: correct pawn double-step target square for white

Was writing to the wrong row for white, a copy-paste leftover from the
black branch.
```
