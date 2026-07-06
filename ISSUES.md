# Issues

A backlog of known gaps and bugs, each written to be picked up
independently. Unlike [specs/](specs/) (which documents how things work),
this file tracks *what's not done yet*. When an issue is resolved, delete
its entry rather than leaving it marked done — git history is the record
of what was fixed and when.

Each entry: a title, complexity, the area it touches, what's
missing/wrong, and enough context to start without re-deriving it from
scratch. Ordered simplest to most complex, so it doubles as a suggested
pickup order.

We tried migrating one entry to [GitHub Issues](https://github.com/alaspaa/my-little-chess-project/issues)
(issue #1, resolved via #2) but are sticking with this file as the
source of truth for now rather than maintaining two backlogs.

---

## Investigate hosting on GitHub Pages

**Complexity:** Small — a spike, not a build task: figure out whether it
works and what it needs, rather than a fully-scoped feature.

**Area:** `vite.config.ts`, a new GitHub Actions workflow (e.g.
`.github/workflows/deploy.yml`)

No deployment exists today — the app only runs via `npm run dev`/`npm
run build` locally. Since this is a pure client-side SPA with no backend,
no server-side routing, and no persistence (per `specs/architecture.md`),
GitHub Pages (static hosting, free on a public repo) is plausible, but
needs verifying rather than assuming: `vite.config.ts` has no `base` set
today, which defaults to `/` — if this repo is served from
`https://alaspaa.github.io/my-little-chess-project/` rather than a root
domain, `base` needs to be `/my-little-chess-project/` or every built
asset URL will 404. Needs a way to build and publish `dist/` to a
`gh-pages` branch (either the `gh-pages` npm package run manually, or a
GitHub Actions workflow that builds on push to `main` and deploys via
`actions/deploy-pages` or `peaceiris/actions-gh-pages`) and confirming in
the actual hosted URL — not just a local `vite preview`, since `base`
issues and any other path-relative assumptions only show up once it's
served from a subpath.

---

## Add board coordinate labels (ranks/files)

**Complexity:** Small — a wrapper around the existing board rendering, no
new state.

**Area:** UI (`src/GameBoard/GameBoard.tsx`, `src/App.css`)

There's no way to see file/rank labels (a-h, 1-8) around the board today
— `GameBoard.tsx` just renders 8 `GameBoardRow`s of 8 `GameSquare`s, with
nothing surrounding them. Needs a wrapper element around the existing
`.gameboard` output that renders column letters (a-h) along one edge and
row numbers (1-8) along another, styled to line up with the 100px
`.gamesquare` grid. Since the board's orientation is fixed — there's no
"play as black, flip the board" feature, and `gameBoard[0]` is always
White's back rank rendered at top (see "Board coordinate system" in
`specs/architecture.md`) — the labels are static text in a fixed
position, not derived from player color or recomputed per game.

---

## Add component rendering tests

**Complexity:** Small-medium — mostly test-infrastructure setup, since the
assertions themselves (did the right elements render) are simple.

**Area:** test config (`vite.config.ts`), new dev dependencies,
`src/**/*.test.tsx` next to each component

Only the logic layer (`src/GameLogic/*.ts`, `src/types/GameBoard.ts`) has
tests today — components
(`GamePiece`, `GameBoard`, `StartPage`, etc.) aren't covered at all (see
"Testability" in `specs/code-style.md`), so there's no safety net against
a component silently failing to render or a prop being wired up wrong.
Needs: a DOM test environment for Vitest (e.g. `jsdom`, since the current
`vitest.config`'s `test` block has no `environment` set and runs in plain
Node), `@testing-library/react` for rendering into that DOM, and
`vite.config.ts`'s `test.include` extended to also pick up `*.test.tsx`
(currently only matches `*.test.ts`). Start at the minimum bar of one
smoke test per component asserting it renders its expected elements (e.g.
`GameSquare` renders a piece icon when its square has one, `StartPage`
renders both username inputs and the start button) — the existing
components' reliance on raw DOM mouse events for interaction (also called
out in `specs/code-style.md`) means testing drag-and-drop behavior itself
is a separate, harder problem than this issue's scope.

---

## Consider a distinct highlight for promotion-triggering moves

**Complexity:** Small — mostly a design question; the code hook needed to
answer it already exists.

**Area:** UI (`src/GameBoard/GameSquare.tsx`, `src/App.css`)

`GameSquare.tsx` already highlights a picked-up piece's legal destinations
with two states — `.validmove` and `.validcapture` (see `isValidMove`/
`isValidCapture` there) — but a destination that would trigger a pawn
promotion looks identical to any other move or capture square today, even
though dropping on it doesn't just move the piece, it also pops open
`PromotionPrompt`. Worth thinking about whether that's worth a third
visual state (e.g. a `.validpromotion` class) before building it:
`isPawnPromotion(piece, destination)` in `src/GameLogic/moves/pawn.ts`
already exists and could be called per candidate square in
`GameSquare.tsx` the same way `isValidCapture` is computed now, so the
implementation is small — the open question is purely whether a distinct
highlight is actually useful (arguably self-evident once you drop a pawn
there) or just visual noise.

---

## Consider a distinct highlight for castling moves

**Complexity:** Small — mostly a design question; the code hook needed to
answer it already exists.

**Area:** UI (`src/GameBoard/GameSquare.tsx`, `src/App.css`)

Same open question as "Consider a distinct highlight for
promotion-triggering moves" above, for castling instead: a castling
destination is just another square in the king's `.validmove` set today,
indistinguishable from an ordinary one-step king move, even though
dropping on it also relocates a rook two squares away.
`isCastlingMove(piece, from, to)` in `src/GameLogic/moves/king.ts` already
exists and could be called per candidate square the same way
`isValidCapture` is computed now, so — as with promotion — the
implementation is small; the open question is whether a distinct
highlight (e.g. a `.validcastle` class) is worth it, or whether seeing
the rook move is self-explanatory enough once it happens.

---

## Add a button to offer/accept a draw

**Complexity:** Medium — needs a two-sided offer/accept interaction, not
just a single button, to prevent a player accepting their own offer.

**Area:** UI (`src/GameBoard/GameFooter.tsx`), state (`src/state.ts`)

No way to end the game as a mutually agreed draw. Needs a two-step
interaction (one player offers, the other accepts/declines) — a single
button isn't quite enough, since one player accepting their own offer
would need to be prevented. The `"draw"` `gameStatusAtom` end state,
`gameStatus.draw` translation key, and `getGameStatusMessage` rendering
already exist (added for threefold repetition) — this issue can just set
`gameStatusAtom` to `{state: "draw", color: null}` directly once both
players agree, following the pattern the resign button already
established for the offer/accept UI itself.

---

## Fifty-move rule draw is not implemented

**Complexity:** Medium — just a counter (moves since the last pawn move
or capture), reset on the right conditions and checked each turn.

**Area:** game state (`src/state.ts`, `src/GameLogic/GameLogicValidator.ts`)

A game should be drawn if 50 full moves pass with no pawn move and no
capture. Needs: a new counter in state (e.g. `halfmoveClockAtom`),
incremented after every move and reset to 0 whenever the moved piece is a
`"PAWN"` or the destination square was occupied (a capture) — both already
knowable at the point `GamePiece.tsx` commits a move — then setting
`gameStatusAtom` to the existing `"draw"` end state (added for threefold
repetition; see `gameStatus.draw` in `src/locales/en.json`) once the
counter reaches 100 half-moves. Doesn't need full position history like
threefold repetition — just the running count.

---

## Make the fifty-move rule configurable

**Complexity:** Small — one boolean atom and a settings checkbox, gating
an existing check.

**Area:** state (`src/state.ts`), UI (`src/Modal/SettingsMenu.tsx`)

Depends on "Fifty-move rule draw is not implemented" above landing first
— there's nothing to gate without it. Once it exists, add a
`fiftyMoveRuleEnabledAtom` (default `true`), following the same pattern
as `highlightMovesEnabledAtom`, and a matching checkbox in
`SettingsMenu.tsx`'s modal (same shape as the existing "Highlight legal
moves" toggle). Gate only the *end-state* check — whether the halfmove clock reaching
100 actually sets `gameStatusAtom` to the draw state — not the counter
itself, since tracking it is cheap and there's no reason to stop
counting just because the auto-draw is disabled.

---

## Offer a rematch/restart prompt when the game ends

**Complexity:** Medium-large — needs a "reset the game to its initial
state" mechanism that doesn't exist anywhere yet, in addition to the modal
itself.

**Area:** UI (`src/GamePage/GamePage.tsx` or a new component), state
(`src/state.ts`)

When the game reaches an end state (checkmate today; resignation/draw once
those exist), there's currently no way to start a new game short of
reloading the page. Needs a popup/modal shown when `gameStatusAtom.state`
is any end state, with a restart action that resets `gameBoardAtom`,
`currentTurnAtom`, and `gameStatusAtom` back to their initial values.
Note there's no existing "reset to initial state" helper for
`gameBoardAtom` (it's currently initialized once at module load via
`populateBoardWithPieces(createEmptyBoard())`) — resetting it will need
that same construction callable again, not just a stored initial value,
since further game changes should build on that fresh board.

---

## Track wins/losses/draws across games

**Complexity:** Medium — new counters plus a UI spot to render them, but
depends on being able to play more than one game per session.

**Area:** state (`src/state.ts`), UI (`src/GameBoard/GameFooter.tsx` or
`src/Header/Header.tsx`)

There's no running tally of results across games — a game's outcome
(`gameStatusAtom`) is only ever shown once, and the page has to be
reloaded to play again today. Needs a score atom (e.g. `scoreAtom:
{white: number, black: number, draws: number}`, or keyed by player name
instead of color if a rematch can swap sides), incremented once when
`gameStatusAtom` reaches an end state (checkmate/resignation/draw once
that exists), and reset only on a full page reload — not by "Offer a
rematch/restart prompt" above, since the whole point is to keep counting
across rematches. Depends on that rematch/restart issue existing first,
since without a way to start a new game in the same session this would
never go above one result.

---

## Add a chess clock

**Complexity:** Large — new atoms, a per-turn ticking mechanism that has
to interact with the existing pause state during a pawn promotion, and a
new game-over reason.

**Area:** state (`src/state.ts`), `src/GameBoard/GamePiece.tsx`, UI
(`src/GameBoard/GameFooter.tsx`)

No time control exists — games can go on indefinitely. Needs deciding
between two designs before implementation: a **per-game clock** (each
player gets a fixed total budget, e.g. 10 minutes, counting down only on
their turn — the traditional physical chess-clock model), or a
**per-move clock** (each player gets a fixed amount of time to make each
individual move, resetting every turn instead of accumulating a budget).
Either needs: a remaining-time atom per color, a ticking mechanism (e.g.
`setInterval` started/stopped on `currentTurnAtom` changes), a new
`gameStatusAtom` end state (e.g. `"timeout"`) set when a color's time
expires, and a `gameStatus.timeout` translation key rendered the same way
`GameFooter.tsx`'s `getGameStatusMessage` already handles the other end
states. Also needs to not tick while `pendingPromotionAtom` is set, since
the game is already effectively paused then (see "Pawn promotion" in
`specs/architecture.md`) — the same pause condition `GamePiece.tsx`'s
`onMouseDown` already checks before starting a drag.

---

## En passant move-generation logic

**Complexity:** Large — needs move-history state that doesn't exist yet,
plus a rule that depends on the timing of the previous move, not just
current board state.

**Area:** move rules (`src/GameLogic/moves/pawn.ts`), state (`src/state.ts`)

A pawn that double-steps past an enemy pawn should be capturable "as if"
it only moved one square, but only on the very next move. This needs move
history that doesn't exist yet — specifically, which pawn (if any) just
made a two-square advance. Add that as new state (e.g. a
`lastMoveAtom`/field tracked in `GamePiece.tsx`'s move-commit step), then
extend `getPawnMoves` to use it and produce the extra diagonal capture
square. This issue is move-generation only — actually applying the
capture (removing a pawn that isn't on the destination square) is
"En passant capture wiring" below, since neither half is useful alone:
generating the move with nothing to apply it is dead code, and there's
nothing to apply without the move existing first.

---

## En passant capture wiring

**Complexity:** Medium — one method, `updateGameBoardWithMovedPiece` in
`GamePiece.tsx`, currently assumes a capture always happens on the
destination square.

**Area:** `src/GameBoard/GamePiece.tsx`

Once "En passant move-generation logic" above produces a legal en passant
destination, committing it needs to remove the *captured* pawn, which
sits one square behind the destination (same file, the row the capturing
pawn started from) — not on the destination square itself, where
`updateGameBoardWithMovedPiece` looks today. Depends on the move-history
state from the logic issue existing first, since the commit step needs
to know it's an en passant capture (as opposed to a normal diagonal
move onto an empty square, which is otherwise illegal for a pawn) to
know which extra square to clear.

---

## Make threefold repetition configurable

**Complexity:** Small — same shape as "Make the fifty-move rule
configurable" above, applied to the other draw rule.

**Area:** state (`src/state.ts`), UI (`src/Modal/SettingsMenu.tsx`)

Threefold repetition detection is implemented (`isThreefoldRepetition` in
`GameLogicValidator.ts`, checked by `GamePiece.tsx`/`PromotionPrompt.tsx`
right after appending to `positionHistoryAtom`; see "Position history" in
`specs/architecture.md`) but always-on. Add a
`threefoldRepetitionEnabledAtom` (default `true`) and a matching settings
checkbox, gating whether reaching three occurrences of a position
actually sets `gameStatusAtom` to the draw state. `positionHistoryAtom`
itself (tracked unconditionally) doesn't need gating — only the
draw-triggering check does, same reasoning as the fifty-move toggle
above.
