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

Only the logic layer (`src/types/*.ts`) has tests today — components
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

## Add a button to offer/accept a draw

**Complexity:** Medium — needs a two-sided offer/accept interaction, not
just a single button, to prevent a player accepting their own offer.

**Area:** UI (`src/GameBoard/GameFooter.tsx`), state (`src/state.ts`)

No way to end the game as a mutually agreed draw. Needs a two-step
interaction (one player offers, the other accepts/declines) — a single
button isn't quite enough, since one player accepting their own offer
would need to be prevented — plus a new `gameStatusAtom` end state (e.g.
`"draw"`). Follow the pattern the resign button already established:
add `"draw"` to `GameStatus["state"]` in `src/state.ts`, extend the
`isGameOver` helper there to include it, and add a `gameStatus.draw`
translation key in `src/locales/en.json` (see `gameStatus.resigned` for
the shape) rendered the same way in `GameFooter.tsx`'s
`getGameStatusMessage`.

---

## Fifty-move rule draw is not implemented

**Complexity:** Medium — just a counter (moves since the last pawn move
or capture), reset on the right conditions and checked each turn.

**Area:** game state (`src/state.ts`, `src/types/GameLogicValidator.ts`)

A game should be drawn if 50 full moves pass with no pawn move and no
capture. Needs: a new counter in state (e.g. `halfmoveClockAtom`),
incremented after every move and reset to 0 whenever the moved piece is a
`"PAWN"` or the destination square was occupied (a capture) — both already
knowable at the point `GamePiece.tsx` commits a move — plus a new
`gameStatusAtom` end state (e.g. `"draw"`) once the counter reaches 100
half-moves. Doesn't need full position history, unlike threefold
repetition below — just the running count.

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

**Area:** move rules (`src/types/MoveValidator.ts`), state (`src/state.ts`)

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

## Castling move-generation logic

**Complexity:** Large — several interacting preconditions, including
reusing check detection along the king's path.

**Area:** move rules (`src/types/MoveValidator.ts`)

King and rook castling (kingside and queenside) isn't in `getKingMoves` or
anywhere else. Needs: neither piece has moved (`hasMoved` already exists on
`ChessPiece`), no pieces between king and rook, king not currently in
check, and king doesn't pass through or land on an attacked square (reuse
`isKingInCheck` from `GameLogicValidator.ts` for the "passes through
check" part). This issue is move-generation only — producing the castling
destination square for the king; actually relocating the rook alongside
it is "Castling atomic two-piece move" below, since the two need to land
together for castling to be usable at all.

---

## Castling atomic two-piece move

**Complexity:** Medium — the single-piece move architecture needs a second
code path for the one move that relocates two pieces at once.

**Area:** `src/GameBoard/GamePiece.tsx`

`updateGameBoardWithMovedPiece` only relocates one piece per move today.
Once "Castling move-generation logic" above can produce a legal castling
destination for the king, committing that move needs to also move the
corresponding rook to its post-castling square in the same board update,
not as a separate move (the rook's move isn't independently legal and
shouldn't flip the turn or be undoable on its own).

---

## Position history tracking

**Complexity:** Large — no existing notion of "position equality" to build
on, and every move needs to feed it.

**Area:** game state (`src/state.ts`), `src/GameBoard/GamePiece.tsx`

Threefold repetition (below) needs a log of every position reached so
far, which doesn't exist in any form today — `Square[][]` objects are
always structurally distinct even when the arrangement is identical, so
this needs an explicit serialization (e.g. a helper that turns a board +
side-to-move into a comparable string or key) plus a new atom (e.g.
`positionHistoryAtom`) appended to in `GamePiece.tsx`'s move-commit step.
This issue is the tracking half only — recording history nobody reads is
harmless but pointless on its own; "Threefold repetition detection" below
is what actually consumes it. Once castling/en passant rights exist,
revisit the serialization to include them, since two positions with
different rights aren't truly the same position for repetition purposes
— until then, board+turn is a reasonable simplification.

---

## Threefold repetition detection

**Complexity:** Medium — once a history exists, this is a lookup plus a
new end state.

**Area:** `src/types/GameLogicValidator.ts`, state (`src/state.ts`)

A game should be drawn if the same position occurs three times. Once
"Position history tracking" above exists, this is: after appending the
current position, count how many times it (or an equal entry) appears in
`positionHistoryAtom`, and if three, set a new `gameStatusAtom` end state
(e.g. `"draw"`). Depends entirely on the tracking issue above landing
first — there's nothing to detect against without it.
