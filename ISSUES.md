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

## Display wins/losses/draws

**Complexity:** Small — read-only rendering of an existing atom.

**Area:** UI (`src/GameBoard/GameFooter.tsx` or `src/Header/Header.tsx`)

`scoreAtom` (`{player1, player2, draws}`, see "Score tracking" in
`specs/architecture.md`) exists and is already incremented correctly
across rematches — nothing renders it yet. Render its counts somewhere in
the persistent chrome (`GameFooter` alongside the player names, or
`Header` if it should survive independent of `GamePage`) — plain text is
enough, no new interaction needed. Note the atom's `player1`/`player2`
fields don't currently correspond to fixed people if "Allow switching
sides on rematch" below ever lands — see that issue's note on this.

---

## Allow switching sides on rematch

**Complexity:** Small-medium — swapping two atoms is trivial; the open
question is the trigger, plus a real knock-on effect on score tracking.

**Area:** state (`src/state.ts`), UI (`src/Modal/RematchPrompt.tsx`)

`resetGameAtom` always restarts with the same colors each player had
before (White stays White). Needs deciding how sides get swapped before
implementing: a checkbox in `RematchPrompt.tsx` ("swap sides"), or
swapping automatically every rematch, or a dedicated button alongside
"Rematch". Whichever is chosen, it's just swapping `whitePlayerAtom` and
`blackPlayerAtom`'s values (or leaving `resetGameAtom` to do it
conditionally). The real complication: `scoreAtom`'s `player1`/`player2`
tally (see "Score tracking" in `specs/architecture.md`) currently
attributes wins by *whichever color is currently White/Black* at the
moment a game ends — that's only correct because sides never change
today. Once they can, `GamePage.tsx`'s scoring effect needs a stable way
to know which physical player is "player1" independent of color (e.g. an
atom capturing each player's original color, set once at the first game
and never touched by a later swap) instead of inferring it from
`whitePlayerAtom` at increment time.

---

## Unify player-identity naming (`whitePlayerAtom`/`blackPlayerAtom` vs `scoreAtom`'s `player1`/`player2`)

**Complexity:** Small-medium — a naming/modeling question more than new
functionality; likely worth solving together with "Allow switching sides
on rematch" above rather than separately.

**Area:** state (`src/state.ts`)

Two different conventions now represent "the two people playing" in
`state.ts`: `whitePlayerAtom`/`blackPlayerAtom` (set once at setup,
keyed by *current color*) and `scoreAtom`'s `player1`/`player2` fields
(added for score tracking, meant to stay stable *regardless* of color —
see "Score tracking" in `specs/architecture.md`). These are conceptually
the same two people described two different ways, and it's only a naming
inconsistency today because sides can't be swapped yet — once "Allow
switching sides on rematch" above lands, `whitePlayerAtom`/
`blackPlayerAtom` and "player1"/"player2" identity will actively diverge
(a player's color can change between games, but their player-1-ness
shouldn't), making the two namings actively confusing rather than just
inconsistent. Worth deciding on one model — e.g. a `player1Atom`/
`player2Atom` holding the `Player` objects directly (position-stable,
set once at setup) plus a small separate atom/derivation for which slot
currently plays which color, with `whitePlayerAtom`/`blackPlayerAtom`
either removed in favor of that or made explicitly derived from it — and
updating every current consumer of the color-keyed atoms
(`GameFooter.tsx`, `GamePage.tsx`, `StartPage`, etc.) to match.

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

---

## Extend position history to support reviewing a game

**Complexity:** Medium — the pieces needed don't exist yet, but nothing
here is architecturally hard on its own.

**Area:** `src/GameLogic/Position.ts`, state (`src/state.ts`)

`positionHistoryAtom` (see "Position history" in `specs/architecture.md`)
already has every position of the current game in order, which is most
of what a "step through this game" review feature would need — but a
few things are missing: `serializePosition` only goes board→string,
there's no inverse (`deserializePosition`) to turn a saved entry back
into a `Square[][]` for rendering (piece `id`/`hasMoved` can't be
recovered since they were never encoded, but that's fine for pure
review — only the visual position matters there). Also,
`resetGameAtom` clears `positionHistoryAtom` on rematch (deliberately,
so a new game's threefold-repetition count doesn't inherit the old
game's positions), so reviewing a *previous* rematch would need an
explicit archive step — e.g. copying the array somewhere else - before
that reset fires, since nothing preserves it today. See "Record check/
checkmate info in move history" below for the related question of
per-move annotations (check, checkmate, whose move) that a review UI
would likely also want alongside the raw positions.

---

## Record check/checkmate info in move history, including the checking piece

**Complexity:** Medium-large — needs check detection to report *which*
piece is checking, not just whether the king is in check, plus a shape
change to how history is stored.

**Area:** `src/GameLogic/GameLogicValidator.ts`, `src/GameLogic/moves/king.ts`,
state (`src/state.ts`)

`isKingInCheck`/`isSquareAttacked` currently only return a boolean —
by design, since all `isKingInCheck` needs today is yes/no. Annotating
history with "this move gave check" (and by which piece — useful for a
review feature, and matches how real chess notation marks checks) needs
`isSquareAttacked` (or a new function built on the same scan in
`moves/king.ts`) to return the attacking piece(s)' coordinates instead of
just `true`, since more than one piece can deliver check at once
(discovered double check). Since `positionHistoryAtom` is currently a
flat `string[]` (see "Position history" in `specs/architecture.md`),
recording this means growing each entry into a small record (e.g.
`{position: string, checkedBy: BoardCoordinates[] | null}`) instead of a
bare string — `isThreefoldRepetition`'s comparison would need updating to
compare the `position` field specifically rather than the whole entry.
Depends on "Extend position history to support reviewing a game" above
existing first if the goal is showing this in a review UI, though the
detection/recording half could land independently.
