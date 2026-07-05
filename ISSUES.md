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

## Threefold repetition draw is not implemented

**Complexity:** Largest — needs a full position history log (not just a
running counter like the fifty-move rule, or "the last move" like en
passant), plus a way to compare positions for equality.

**Area:** game state (`src/state.ts`, `src/types/GameLogicValidator.ts`)

A game should be drawn if the same position (piece placement, side to
move, and — once implemented — castling/en passant rights) occurs three
times. Needs: a log of every position reached so far (e.g. a serialized
board snapshot per move, since there's no existing notion of "position
equality" — `Square[][]` objects are always structurally distinct even
when the arrangement is identical), a way to detect when a new snapshot
matches two earlier ones, and a new `gameStatusAtom` end state (e.g.
`"draw"`). Depends on castling/en passant rights being tracked first if
those are implemented, since two positions with different castling/en
passant availability aren't actually the same position for repetition
purposes — otherwise it can ship considering board+turn only, which is a
reasonable simplification for now.
