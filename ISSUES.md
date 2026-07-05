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

## Add a language selection screen

**Complexity:** Medium — a small new UI + one new piece of state, but
only meaningful once a second language exists to choose (depends on the
translations issue above).

**Area:** UI (`src/Header/SettingsMenu.tsx`), state (`src/state.ts`)

Once more than one language exists (see the translations issue above),
add a control letting a player pick a language before or while playing,
calling `i18n.changeLanguage(...)`
(from the `i18n` instance exported by `src/i18n.ts`) — probably still
worth mirroring the choice into a Jotai atom too, so React components can
reactively re-render on change rather than relying on `i18next`'s own
subscription mechanism directly. Consider whether the choice should
persist across a page reload (there's no persistence layer in this
project at all yet — see how `whitePlayerAtom`/`blackPlayerAtom` are
already lost on refresh — so this may need to stay in-memory-only too,
unless persistence is added as part of this work).

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

## En passant is not implemented

**Complexity:** Large — new move-history state plus capture logic that
depends on the timing of the previous move, not just current board state.

**Area:** move rules (`src/types/MoveValidator.ts`), state (`src/state.ts`)

A pawn that double-steps past an enemy pawn should be capturable "as if"
it only moved one square, but only on the very next move. This needs move
history that doesn't exist yet — specifically, which pawn (if any) just
made a two-square advance. Add that as new state (e.g. a
`lastMoveAtom`/field tracked in `GamePiece.tsx`'s move-commit step) before
attempting the capture logic itself, since `getPawnMoves` currently has no
way to know what the previous move was.

---

## Castling is not implemented

**Complexity:** Large — several interacting preconditions (including
reusing check detection), and requires extending the single-piece move
architecture to move two pieces atomically.

**Area:** move rules (`src/types/MoveValidator.ts`)

King and rook castling (kingside and queenside) isn't in `getKingMoves` or
anywhere else. Needs: neither piece has moved (`hasMoved` already exists on
`ChessPiece`), no pieces between king and rook, king not currently in check,
and king doesn't pass through or land on an attacked square (reuse
`isKingInCheck` from `GameLogicValidator.ts` for the "passes through check"
part). Also needs a way to move two pieces (king + rook) as one atomic move,
which `updateGameBoardWithMovedPiece` in `GamePiece.tsx` doesn't currently
support (it only relocates one piece per move).

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
