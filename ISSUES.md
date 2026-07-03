# Issues

A backlog of known gaps and bugs, each written to be picked up
independently. Unlike [specs/](specs/) (which documents how things work),
this file tracks *what's not done yet*. When an issue is resolved, delete
its entry rather than leaving it marked done — git history is the record
of what was fixed and when.

Each entry: a title, the area it touches, what's missing/wrong, and enough
context to start without re-deriving it from scratch.

---

## Castling is not implemented

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

## En passant is not implemented

**Area:** move rules (`src/types/MoveValidator.ts`), state (`src/state.ts`)

A pawn that double-steps past an enemy pawn should be capturable "as if"
it only moved one square, but only on the very next move. This needs move
history that doesn't exist yet — specifically, which pawn (if any) just
made a two-square advance. Add that as new state (e.g. a
`lastMoveAtom`/field tracked in `GamePiece.tsx`'s move-commit step) before
attempting the capture logic itself, since `getPawnMoves` currently has no
way to know what the previous move was.

---

## Pawn promotion is not implemented

**Area:** move rules + UI (`src/types/MoveValidator.ts`,
`src/GameBoard/GamePiece.tsx`)

A pawn reaching the opposite back rank (y=7 for white, y=0 for black) must
be replaced by a queen, rook, bishop, or knight of the player's choice —
not automatically a queen. Needs: detecting the promotion condition when a
pawn move lands on the back rank, a UI prompt to choose the piece (a new
small component, likely modal-like, blocking further interaction until a
choice is made), and updating the board with the chosen piece type instead
of the pawn.

---

## Fifty-move rule and threefold repetition draws are not implemented

**Area:** game state (`src/state.ts`, `src/types/GameLogicValidator.ts`)

Two draw conditions aren't detected: 50 moves with no pawn move or capture,
and the same position occurring three times. Both need history that
doesn't exist yet — a move/position log — plus a new `gameStatusAtom`
state value (currently only `"playing" | "check" | "checkmate"`) for
`"draw"`, and a reason to display. Lower priority than the special-case
moves above since draws are rare in casual play, but worth tracking since
`gameStatusAtom`'s shape will need to change either way.

---

## Check/checkmate banner shifts the board when it appears or disappears

**Area:** UI (`src/GameBoard/GameBoard.tsx`, `src/App.css`)

The `.gameboard-status` banner is only rendered in the DOM when
`gameStatus.state !== 'playing'` (see the conditional in `GameBoard.tsx`'s
render). Its height isn't reserved when absent, so the board visibly jumps
down by the banner's height the moment a check/checkmate happens (and jumps
back up if the state clears). Fix should keep the board's position stable
regardless of whether a message is showing — e.g. always render the
`.gameboard-status` div and reserve its height via CSS
(`visibility: hidden` when there's no message, rather than removing it from
the DOM), instead of conditionally rendering the element itself.

---

## Display captured pieces

**Area:** UI (`src/GameBoard/GameBoard.tsx`), state (`src/state.ts`)

There's no visual record of which pieces have been taken, which would help
a player track how the game has progressed at a glance (material count,
what's left on the board). Needs: capturing the taken `ChessPiece` (not
just discarding it) at the point a move replaces an occupied square —
currently `updateGameBoardWithMovedPiece`/`validateAndUpdateGameBoardWithMovedPiece`
in `GamePiece.tsx` overwrite the captured square's piece with the mover
and the captured piece is simply lost — plus new state (e.g.
`capturedPiecesAtom`, probably split per color) and a small rendering
component (icons via the existing FontAwesome piece icons, grouped by
color) placed near each player's username label.

---

## Add a resign button

**Area:** UI (`src/GameBoard/GameBoard.tsx`), state (`src/state.ts`)

No way for a player to concede the game early. Needs a button (likely one
per player, or one that resigns "whoever's turn it is") that sets
`gameStatusAtom` to an end state declaring the other color the winner, and
blocks further moves the same way checkmate currently does in
`GamePiece.tsx`'s `onMouseDown`. `gameStatusAtom`'s `state` union
(`"playing" | "check" | "checkmate"`) will need a new value (e.g.
`"resigned"`) since a resignation isn't a checkmate.

---

## Add a button to offer/accept a draw

**Area:** UI (`src/GameBoard/GameBoard.tsx`), state (`src/state.ts`)

No way to end the game as a mutually agreed draw. Needs a two-step
interaction (one player offers, the other accepts/declines) — a single
button isn't quite enough, since one player accepting their own offer
would need to be prevented — plus a new `gameStatusAtom` end state (e.g.
`"draw"`) and blocking further moves the same way checkmate does.

---

## Offer a rematch/restart prompt when the game ends

**Area:** UI (`src/GameBoard/GameBoard.tsx` or a new component), state
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
