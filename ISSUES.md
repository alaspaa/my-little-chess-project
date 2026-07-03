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

---

## Valid-move square highlighting doesn't fit the color scheme

**Complexity:** Trivial — CSS-only, no logic or state changes.

**Area:** UI (`src/App.css`)

`.validmove` currently draws a solid green inset border
(`box-shadow: inset 0 0 0 4px rgba(80, 200, 120, 0.8)`) around legal
destination squares. Against the board's grayscale square colors
(`rgb(35, 34, 34)` / `rgb(185, 185, 185)`) and the existing green used for
"whose turn is active" (`.gameboard-player.active`, also
`rgb(80, 200, 120)`), the same green for two unrelated meanings (active
player vs. legal move) plus a hard 4px border reads as visually busy
rather than a natural affordance. Worth revisiting with something more in
line with the board's existing palette — e.g. a soft dot/overlay in the
center of the square (closer to how most chess UIs mark legal moves)
instead of a full border, and/or a color that doesn't double up with the
active-player highlight's meaning.

---

## Check/checkmate banner shifts the board when it appears or disappears

**Complexity:** Small — CSS plus a one-line JSX change, already fully
scoped below.

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

## Add a resign button

**Complexity:** Small — one new `gameStatusAtom` value, one button, and
the move-blocking check already exists for checkmate.

**Area:** UI (`src/GameBoard/GameBoard.tsx`), state (`src/state.ts`)

No way for a player to concede the game early. Needs a button (likely one
per player, or one that resigns "whoever's turn it is") that sets
`gameStatusAtom` to an end state declaring the other color the winner, and
blocks further moves the same way checkmate currently does in
`GamePiece.tsx`'s `onMouseDown`. `gameStatusAtom`'s `state` union
(`"playing" | "check" | "checkmate"`) will need a new value (e.g.
`"resigned"`) since a resignation isn't a checkmate.

---

## Display captured pieces

**Complexity:** Medium — touches the move-commit path (currently discards
captures) plus new state and a small rendering component.

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

## Introduce a footer area for game info/banners

**Complexity:** Medium — a layout restructuring rather than new game
logic, but touches several existing pieces of UI at once.

**Area:** UI (`src/GameBoard/GameBoard.tsx`, `src/App.css`)

Right now check/checkmate status, player labels, and any future additions
(captured pieces, resign/draw buttons, a rematch prompt — see the other
issues here) are placed directly above/below `.gameboard` in the normal
document flow, so anything that changes size pushes the board itself up
or down (this is the direct cause of the "Check/checkmate banner shifts
the board" issue above, though that issue can be fixed on its own with a
narrower CSS-only reserved-height fix). A dedicated footer region below
the board — sized/positioned so it can grow or change content without
affecting the board's position (e.g. taken out of flow, or the board given
a fixed position relative to the page rather than relative to its
siblings) — would give a single, consistent place for all of this
game-progress information, rather than solving the shifting problem
piecemeal for each new banner/button as it's added.

---

## Pawn promotion is not implemented

**Complexity:** Medium — a new blocking modal UI plus board-mutation
logic, but no new persistent state/history needed.

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

## Add a button to offer/accept a draw

**Complexity:** Medium — needs a two-sided offer/accept interaction, not
just a single button, to prevent a player accepting their own offer.

**Area:** UI (`src/GameBoard/GameBoard.tsx`), state (`src/state.ts`)

No way to end the game as a mutually agreed draw. Needs a two-step
interaction (one player offers, the other accepts/declines) — a single
button isn't quite enough, since one player accepting their own offer
would need to be prevented — plus a new `gameStatusAtom` end state (e.g.
`"draw"`) and blocking further moves the same way checkmate does.

---

## Offer a rematch/restart prompt when the game ends

**Complexity:** Medium-large — needs a "reset the game to its initial
state" mechanism that doesn't exist anywhere yet, in addition to the modal
itself.

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

## Fifty-move rule and threefold repetition draws are not implemented

**Complexity:** Largest — needs a full move/position history log (not
just "the last move" like en passant), spanning the whole game.

**Area:** game state (`src/state.ts`, `src/types/GameLogicValidator.ts`)

Two draw conditions aren't detected: 50 moves with no pawn move or capture,
and the same position occurring three times. Both need history that
doesn't exist yet — a move/position log — plus a new `gameStatusAtom`
state value (currently only `"playing" | "check" | "checkmate"`) for
`"draw"`, and a reason to display. Lower priority than the special-case
moves above since draws are rare in casual play, but worth tracking since
`gameStatusAtom`'s shape will need to change either way.
