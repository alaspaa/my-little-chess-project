# Issues

A backlog of known gaps and bugs, each written to be picked up
independently. Unlike [specs/](specs/) (which documents how things work),
this file tracks *what's not done yet*. When an issue is resolved, delete
its entry rather than leaving it marked done — git history is the record
of what was fixed and when.

Each entry: a title, complexity, the area it touches, what's
missing/wrong, and enough context to start without re-deriving it from
scratch. Ordered simplest to most complex, so it doubles as a suggested
pickup order — except "Support touch input for dragging pieces" is
pinned to the top as the current highest priority regardless of size.

We tried migrating one entry to [GitHub Issues](https://github.com/alaspaa/my-little-chess-project/issues)
(issue #1, resolved via #2) but are sticking with this file as the
source of truth for now rather than maintaining two backlogs.

---

## Support touch input for dragging pieces

**Complexity:** Medium-large — needs a parallel (or replacement) event
path for the existing mouse-only drag implementation.

**Area:** `src/GameBoard/GamePiece.tsx`, `src/GameBoard/GameBoard.tsx`

Piece drag-and-drop only responds to `mousedown`/`mousemove`/`mouseup` —
`GamePiece.tsx` attaches native `mousedown`/`mouseup` listeners directly
to each piece's DOM node, and `GameBoard.tsx` attaches a `mousemove`
listener on the board container to track the drag position into
`boardCoordinatesAtom` (see "Turn flow" in `specs/architecture.md`).
None of these fire on a touch-only device — touch interactions dispatch
`touchstart`/`touchmove`/`touchend` instead, with coordinates read from
`e.touches[0].clientX`/`clientY` rather than `e.clientX`/`clientY`, so a
piece currently can't be picked up at all on a phone. The likely cleanest
fix is switching the existing listeners from `mousedown`/`mousemove`/
`mouseup` to their `pointerdown`/`pointermove`/`pointerup` equivalents,
since Pointer Events fire for mouse, touch, and pen uniformly with the
same `clientX`/`clientY` shape — replacing the mouse-specific listeners
rather than adding a second parallel set for touch. Also needs
`touch-action: none` (or equivalent) on draggable pieces so the browser
doesn't try to scroll the page while a drag is in progress. The layout
itself already scales to fit a phone viewport (see "Responsive layout"
in `specs/architecture.md`) — this is the remaining piece needed to make
the board actually playable by touch.

---

## Add a quick glow animation to the active side's pieces

**Complexity:** Small — a CSS class + keyframe animation, keyed off state
that's already read where it'd apply.

**Area:** `src/GameBoard/GamePiece.tsx`, `src/App.css`

Now that the turn-arrow indicator is gone from `GameFooter.tsx` (the
active player is already clear enough from the highlighted name/color
there), the pieces themselves could use a small one-shot visual cue when
their side's turn begins — a quick glow, not a persistent effect for the
whole turn. `GamePiece.tsx` already reads `currentTurnAtom` internally
(for drag-eligibility checks); rendering could add a class like
`.active-side` when `piece.color === currentTurn`, paired with a CSS
`@keyframes` animation (e.g. a brief `box-shadow`/`filter: drop-shadow`
pulse, non-`infinite` so it plays once and settles). Since all pieces of
the newly-active color pick up the class at the same moment the turn
flips, they'd all glow together — worth checking that feels right rather
than gimmicky before committing to per-piece vs. some other grouping.

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

## Display wins/losses/draws

**Complexity:** Small — read-only rendering of an existing atom.

**Area:** UI (`src/GameBoard/GameFooter.tsx` or `src/Header/Header.tsx`)

`scoreAtom` (`{player1, player2, draws}`, see "Score tracking" in
`specs/architecture.md`) exists and is already incremented correctly
across rematches, using `player1ColorAtom` so the tally stays correct
even after "Rematch (Swap Sides)" — but nothing renders it yet. Render
its counts somewhere in the persistent chrome (`GameFooter` alongside the
player names, or `Header` if it should survive independent of
`GamePage`) — plain text is enough, no new interaction needed.

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
